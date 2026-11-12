using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace Dial50_MVC_Core.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpPost("GetNotifications")]
        public async Task<IActionResult> GetNotifications([FromBody] NotificationRequestModel request)
        {
            if (string.IsNullOrEmpty(request.RoomNo))
                return Ok(new List<NotificationModel>());

            var result = await _notificationService.GetNotificationsByRoomAsync(request.RoomNo, 1000);
            return Ok(result);
        }

        [HttpPost("GetUnreadCount")]
        public async Task<IActionResult> GetUnreadCount([FromBody] NotificationRequestModel request)
        {
            if (string.IsNullOrEmpty(request.RoomNo))
                return Ok(new { UNREAD_COUNT = 0 });

            var count = await _notificationService.GetUnreadCountByRoomAsync(request.RoomNo);
            return Ok(new { UNREAD_COUNT = count });
        }

        [HttpPost("GetTotalCount")]
        public async Task<IActionResult> GetTotalCount([FromBody] NotificationRequestModel request)
        {
            if (string.IsNullOrEmpty(request.RoomNo))
                return Ok(new { TOTAL_COUNT = 0 });

            var count = await _notificationService.GetTotalCountByRoomAsync(request.RoomNo);
            return Ok(new { TOTAL_COUNT = count });
        }

        [HttpPost("MarkAllAsRead")]
        public async Task<IActionResult> MarkAllAsRead([FromBody] NotificationRequestModel request)
        {
            if (string.IsNullOrEmpty(request.RoomNo))
                return Ok(new { success = false, message = "RoomNo is required" });

            var success = await _notificationService.MarkAllNotificationsAsReadByRoomAsync(request.RoomNo);

            return Ok(new
            {
                success,
                message = success
                    ? "All notifications marked as read"
                    : "No notifications to update"
            });
        }

        [HttpPost("MarkAsRead")]
        public async Task<IActionResult> MarkAsRead([FromBody] NotificationRequestModel request)
        {
            if (string.IsNullOrEmpty(request.NotificationId))
                return Ok(new { success = false });

            var success = await _notificationService.MarkNotificationAsReadAsync(request.NotificationId);
            return Ok(new { success });
        }
    }

    public class NotificationRequestModel
    {
        public string RoomNo { get; set; }
        public string NotificationId { get; set; }
    }
}