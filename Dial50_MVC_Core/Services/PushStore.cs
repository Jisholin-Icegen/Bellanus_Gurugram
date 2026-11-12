using System.Data;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Data.SqlClient;

namespace Dial50_MVC_Core.Services
{
    public class PushSub
    {
        public string RoomNo { get; set; } = "";
        public string BedInfo { get; set; } = "";
        public string Endpoint { get; set; } = "";
        public string P256dh { get; set; } = "";
        public string Auth { get; set; } = "";
    }

    public class PushPromptStatus
    {
        public bool ShouldShow { get; set; }
        public string Status { get; set; } = "";
        public DateTime? NextPromptAt { get; set; }
    }

    public class PushStore
    {
        private const int MaxDevicesPerRoom = 30;

        private readonly IConfiguration _cfg;

        public PushStore(IConfiguration cfg)
        {
            _cfg = cfg;
        }

        private string GetCs() => _cfg.GetConnectionString("Dial50")
            ?? throw new Exception("Dial50 connection string not found in appsettings.json");

        private static byte[] GetRoomHash(string roomNo)
        {
            return SHA256.HashData(Encoding.UTF8.GetBytes((roomNo ?? "").Trim().ToUpperInvariant()));
        }

        private static void AddText(SqlCommand cmd, string name, string? value, int size)
        {
            cmd.Parameters.Add(name, SqlDbType.NVarChar, size).Value = (object?)value ?? DBNull.Value;
        }

        public async Task UpsertAsync(PushSub s)
        {
            using var con = new SqlConnection(GetCs());
            await con.OpenAsync();

            using var cmd = new SqlCommand(@"
                MERGE PushSubscriptions WITH (HOLDLOCK) AS t
                USING (SELECT CAST(HASHBYTES('SHA2_256', @e) AS BINARY(32)) AS H) AS src
                    ON t.EndpointHash = src.H
                WHEN MATCHED THEN
                    UPDATE SET RoomNo = @r, BedInfo = @b, P256dh = @p, Auth = @a, UpdatedOn = GETDATE()
                WHEN NOT MATCHED THEN
                    INSERT (RoomNo, BedInfo, Endpoint, P256dh, Auth, UpdatedOn)
                    VALUES (@r, @b, @e, @p, @a, GETDATE());

                DELETE FROM PushSubscriptions
                WHERE LTRIM(RTRIM(RoomNo)) = @r
                  AND EndpointHash <> CAST(HASHBYTES('SHA2_256', @e) AS BINARY(32))
                  AND Id NOT IN
                  (
                      SELECT TOP (@cap) Id
                      FROM PushSubscriptions
                      WHERE LTRIM(RTRIM(RoomNo)) = @r
                      ORDER BY Id DESC
                  );", con);

            AddText(cmd, "@r", (s.RoomNo ?? "").Trim(), 100);
            AddText(cmd, "@b", s.BedInfo, 2000);
            AddText(cmd, "@e", s.Endpoint, 1000);
            AddText(cmd, "@p", s.P256dh, 200);
            AddText(cmd, "@a", s.Auth, 100);
            cmd.Parameters.Add("@cap", SqlDbType.Int).Value = MaxDevicesPerRoom;

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task ReplaceAsync(string oldEndpoint, PushSub s)
        {
            using var con = new SqlConnection(GetCs());
            await con.OpenAsync();

            using var cmd = new SqlCommand(@"
                DECLARE @oldHash BINARY(32) = CAST(HASHBYTES('SHA2_256', @old) AS BINARY(32));
                DECLARE @newHash BINARY(32) = CAST(HASHBYTES('SHA2_256', @e) AS BINARY(32));

                IF @newHash = @oldHash
                BEGIN
                    UPDATE PushSubscriptions
                    SET P256dh = @p, Auth = @a, UpdatedOn = GETDATE()
                    WHERE EndpointHash = @oldHash;
                END
                ELSE IF EXISTS (SELECT 1 FROM PushSubscriptions WHERE EndpointHash = @newHash)
                BEGIN
                    DELETE FROM PushSubscriptions WHERE EndpointHash = @oldHash;
                END
                ELSE
                BEGIN
                    UPDATE PushSubscriptions
                    SET Endpoint = @e, P256dh = @p, Auth = @a, UpdatedOn = GETDATE()
                    WHERE EndpointHash = @oldHash;
                END", con);

            AddText(cmd, "@e", s.Endpoint, 1000);
            AddText(cmd, "@p", s.P256dh, 200);
            AddText(cmd, "@a", s.Auth, 100);
            AddText(cmd, "@old", oldEndpoint, 1000);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task<List<PushSub>> GetByRoomAsync(string roomNo)
        {
            var list = new List<PushSub>();

            using var con = new SqlConnection(GetCs());
            await con.OpenAsync();

            using var cmd = new SqlCommand(@"
                SELECT RoomNo, BedInfo, Endpoint, P256dh, Auth
                FROM PushSubscriptions
                WHERE LTRIM(RTRIM(RoomNo)) = @r", con);

            AddText(cmd, "@r", (roomNo ?? "").Trim(), 100);

            using var rd = await cmd.ExecuteReaderAsync();

            while (await rd.ReadAsync())
            {
                list.Add(new PushSub
                {
                    RoomNo = rd.GetString(0),
                    BedInfo = rd.IsDBNull(1) ? "" : rd.GetString(1),
                    Endpoint = rd.GetString(2),
                    P256dh = rd.GetString(3),
                    Auth = rd.GetString(4)
                });
            }

            return list;
        }

        public async Task<List<PushSub>> GetAllAsync()
        {
            var list = new List<PushSub>();

            using var con = new SqlConnection(GetCs());
            await con.OpenAsync();

            using var cmd = new SqlCommand(
                "SELECT RoomNo, BedInfo, Endpoint, P256dh, Auth FROM PushSubscriptions", con);

            using var rd = await cmd.ExecuteReaderAsync();

            while (await rd.ReadAsync())
            {
                list.Add(new PushSub
                {
                    RoomNo = rd.GetString(0),
                    BedInfo = rd.IsDBNull(1) ? "" : rd.GetString(1),
                    Endpoint = rd.GetString(2),
                    P256dh = rd.GetString(3),
                    Auth = rd.GetString(4)
                });
            }

            return list;
        }

        public async Task DeleteAsync(string endpoint)
        {
            using var con = new SqlConnection(GetCs());
            await con.OpenAsync();

            using var cmd = new SqlCommand(
                "DELETE FROM PushSubscriptions WHERE EndpointHash = CAST(HASHBYTES('SHA2_256', @e) AS BINARY(32))", con);

            AddText(cmd, "@e", endpoint, 1000);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task DeleteRoomAsync(string roomNo)
        {
            using var con = new SqlConnection(GetCs());
            await con.OpenAsync();

            using var cmd = new SqlCommand(
                "DELETE FROM PushSubscriptions WHERE LTRIM(RTRIM(RoomNo)) = @r", con);
            AddText(cmd, "@r", (roomNo ?? "").Trim(), 100);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task<PushPromptStatus> GetPromptStatusAsync(string roomNo, string bedInfo)
        {
            var room = (roomNo ?? "").Trim();
            var hash = GetRoomHash(room);

            using var con = new SqlConnection(GetCs());
            await con.OpenAsync();

            using var cmd = new SqlCommand(@"
                MERGE PushNotificationPrompt WITH (HOLDLOCK) AS t
                USING (SELECT @h AS BedInfoHash) AS s
                    ON t.BedInfoHash = s.BedInfoHash
                WHEN NOT MATCHED THEN
                    INSERT (RoomNo, BedInfoHash, PromptStatus, CreatedOn, UpdatedOn)
                    VALUES (@r, @h, 'PENDING', SYSUTCDATETIME(), SYSUTCDATETIME());

                SELECT
                    CASE
                        WHEN EnabledAt IS NOT NULL THEN 'ENABLED'
                        WHEN DeferredAt IS NOT NULL THEN 'DEFERRED'
                        ELSE 'PENDING'
                    END AS PromptStatus,
                    NextPromptAt,
                    CASE
                        WHEN EnabledAt IS NOT NULL THEN 0
                        WHEN DeferredAt IS NOT NULL
                            THEN CASE WHEN NextPromptAt <= SYSUTCDATETIME() THEN 1 ELSE 0 END
                        ELSE 1
                    END AS ShouldShow
                FROM PushNotificationPrompt
                WHERE BedInfoHash = @h;", con);

            AddText(cmd, "@r", room, 100);
            cmd.Parameters.Add("@h", SqlDbType.VarBinary, 32).Value = hash;

            using var rd = await cmd.ExecuteReaderAsync();

            if (!await rd.ReadAsync())
                throw new Exception("Notification prompt record not found.");

            return new PushPromptStatus
            {
                Status = rd.GetString(0),
                NextPromptAt = rd.IsDBNull(1) ? null : rd.GetDateTime(1),
                ShouldShow = rd.GetInt32(2) == 1
            };
        }

        public async Task DeferPromptAsync(string roomNo, string bedInfo)
        {
            var room = (roomNo ?? "").Trim();
            var hash = GetRoomHash(room);

            using var con = new SqlConnection(GetCs());
            await con.OpenAsync();

            using var cmd = new SqlCommand(@"
                MERGE PushNotificationPrompt WITH (HOLDLOCK) AS t
                USING (SELECT @h AS BedInfoHash) AS s
                    ON t.BedInfoHash = s.BedInfoHash
                WHEN MATCHED THEN
                    UPDATE SET
                        PromptStatus = 'DEFERRED',
                        DeferredAt = SYSUTCDATETIME(),
                        NextPromptAt = DATEADD(HOUR, 12, SYSUTCDATETIME()),
                        EnabledAt = NULL,
                        UpdatedOn = SYSUTCDATETIME()
                WHEN NOT MATCHED THEN
                    INSERT (RoomNo, BedInfoHash, PromptStatus, DeferredAt, NextPromptAt, CreatedOn, UpdatedOn)
                    VALUES (@r, @h, 'DEFERRED', SYSUTCDATETIME(), DATEADD(HOUR, 12, SYSUTCDATETIME()), SYSUTCDATETIME(), SYSUTCDATETIME());", con);

            AddText(cmd, "@r", room, 100);
            cmd.Parameters.Add("@h", SqlDbType.VarBinary, 32).Value = hash;

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task CompletePromptAsync(string roomNo, string bedInfo)
        {
            var room = (roomNo ?? "").Trim();
            var hash = GetRoomHash(room);

            using var con = new SqlConnection(GetCs());
            await con.OpenAsync();

            using var cmd = new SqlCommand(@"
                MERGE PushNotificationPrompt WITH (HOLDLOCK) AS t
                USING (SELECT @h AS BedInfoHash) AS s
                    ON t.BedInfoHash = s.BedInfoHash
                WHEN MATCHED THEN
                    UPDATE SET
                        PromptStatus = 'ENABLED',
                        EnabledAt = SYSUTCDATETIME(),
                        DeferredAt = NULL,
                        NextPromptAt = NULL,
                        UpdatedOn = SYSUTCDATETIME()
                WHEN NOT MATCHED THEN
                    INSERT (RoomNo, BedInfoHash, PromptStatus, EnabledAt, CreatedOn, UpdatedOn)
                    VALUES (@r, @h, 'ENABLED', SYSUTCDATETIME(), SYSUTCDATETIME(), SYSUTCDATETIME());", con);

            AddText(cmd, "@r", room, 100);
            cmd.Parameters.Add("@h", SqlDbType.VarBinary, 32).Value = hash;

            await cmd.ExecuteNonQueryAsync();
        }
    }
}