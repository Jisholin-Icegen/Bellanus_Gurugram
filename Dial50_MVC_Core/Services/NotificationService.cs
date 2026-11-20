using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Repositories;

namespace Dial50_MVC_Core.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _repository;

        public NotificationService(INotificationRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<NotificationModel>> GetNotificationsByRoomAsync(string roomNo, int maxCount)
        {
            return await _repository.GetNotificationsByRoom(roomNo, maxCount);
        }

        public async Task<bool> MarkAllNotificationsAsReadByRoomAsync(string roomNo)
        {
            return await _repository.MarkAllAsReadByRoomAsync(roomNo);
        }

        public async Task<int> GetUnreadCountByRoomAsync(string roomNo)
        {
            return await _repository.GetUnreadCountByRoom(roomNo);
        }

        public async Task<bool> MarkNotificationAsReadAsync(string roomNo, string notificationId)
        {
            return await _repository.MarkNotificationAsRead(roomNo, notificationId);
        }

        public async Task<int> GetTotalCountByRoomAsync(string roomNo)
        {
            return await _repository.GetTotalCountByRoom(roomNo);
        }
    }
}