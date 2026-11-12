using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;

namespace Dial50_MVC_Core.Services
{
    public class NotificationPushWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<NotificationPushWorker> _logger;

        private static readonly Dictionary<string, int> LastPushedIdByRoom = new Dictionary<string, int>();

        public NotificationPushWorker(IServiceProvider serviceProvider, ILogger<NotificationPushWorker> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
                        var pushSender = scope.ServiceProvider.GetRequiredService<PushSender>();
                        var connectionString = config.GetConnectionString("Dial50");

                        var activeRooms = new List<string>();
                        using (var con = new SqlConnection(connectionString))
                        {
                            await con.OpenAsync();
                            using var cmd = new SqlCommand("SELECT DISTINCT RoomNo FROM PushSubscriptions", con);
                            using var reader = await cmd.ExecuteReaderAsync();
                            while (await reader.ReadAsync())
                            {
                                activeRooms.Add(reader["RoomNo"].ToString());
                            }
                        }

                        foreach (var roomNo in activeRooms)
                        {
                            var latest = await GetLatestNotification(connectionString, roomNo);

                            if (latest == null)
                            {
                                continue;
                            }

                            int lastPushed = LastPushedIdByRoom.TryGetValue(roomNo, out var last) ? last : 0;

                            if (latest.Id <= lastPushed)
                            {
                                continue;
                            }

                            if (latest.IsRead)
                            {
                                LastPushedIdByRoom[roomNo] = latest.Id;
                                continue;
                            }

                            await pushSender.SendToRoomAsync(
                                roomNo: roomNo,
                                title: latest.OrderType,
                                body: latest.ItemSummary,
                                relativeUrl: "/",
                                tag: latest.Id.ToString()
                            );

                            LastPushedIdByRoom[roomNo] = latest.Id;
                        }
                    }
                }
                catch (Exception)
                {
                    // Errors are silently swallowed to avoid console output
                }

                await Task.Delay(8000, stoppingToken);
            }
        }

        private async Task<NotificationSnapshot> GetLatestNotification(string connectionString, string roomNo)
        {
            using var con = new SqlConnection(connectionString);
            using var cmd = new SqlCommand("SP_MOB_NOTIFICATION", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@Process", "GET");
            cmd.Parameters.AddWithValue("@RoomNo", roomNo);
            cmd.Parameters.AddWithValue("@NotificationID", DBNull.Value);
            cmd.Parameters.AddWithValue("@MaxCount", 1);

            await con.OpenAsync();
            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new NotificationSnapshot
                {
                    Id = Convert.ToInt32(reader["ID"]),
                    OrderType = reader["ORDER_TYPE"]?.ToString() ?? "",
                    ItemSummary = reader["ITEM_SUMMARY"]?.ToString() ?? "",
                    IsRead = reader["IS_READ"] != DBNull.Value && Convert.ToBoolean(reader["IS_READ"])
                };
            }
            return null;
        }

        private class NotificationSnapshot
        {
            public int Id { get; set; }
            public string OrderType { get; set; } = "";
            public string ItemSummary { get; set; } = "";
            public bool IsRead { get; set; }
        }
    }
}