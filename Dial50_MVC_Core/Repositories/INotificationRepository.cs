    using Dial50_MVC_Core.Data;
    using Dial50_MVC_Core.Models;
    using Dial50_MVC_Core.Models.HIS;
    using System.Collections.Generic;

    namespace Dial50_MVC_Core.Repositories
    {
    public interface INotificationRepository
    {
        Task<List<NotificationModel>> GetNotificationsByRoom(string roomNo, int maxCount);
        Task<int> GetUnreadCountByRoom(string roomNo);
        Task<bool> MarkNotificationAsRead(string notificationId);
        Task<bool> MarkAllAsReadByRoomAsync(string roomNo);
        Task<int> GetTotalCountByRoom(string roomNo);
    }
}
