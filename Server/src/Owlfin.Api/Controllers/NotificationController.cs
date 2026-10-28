using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Owlfin.Application.Common.Interfaces;
using Owlfin.Application.Interfaces;
using Owlfin.Domain.Entities;

namespace Owlfin.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ICurrentUserService _currentUserService;

        public NotificationController(INotificationService notificationService, ICurrentUserService currentUserService)
        {
            _notificationService = notificationService;
            _currentUserService = currentUserService;
        }

        // GET: api/Notification — Lấy danh sách thông báo của User (mới nhất lên đầu)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Notification>>> GetNotifications()
        {
            int userId = _currentUserService.UserId;
            if (userId == 0) return Unauthorized();

            var notifications = await _notificationService.GetNotificationsAsync(userId);
            return Ok(notifications);
        }

        // GET: api/Notification/unread-count — Đếm số thông báo chưa đọc
        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            int userId = _currentUserService.UserId;
            if (userId == 0) return Unauthorized();

            int count = await _notificationService.GetUnreadCountAsync(userId);
            return Ok(count);
        }

        // PUT: api/Notification/{id}/read — Đánh dấu thông báo đã đọc
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            int userId = _currentUserService.UserId;
            if (userId == 0) return Unauthorized();

            bool success = await _notificationService.MarkAsReadAsync(userId, id);
            if (!success)
            {
                return NotFound();
            }

            return Ok(new { message = "Đã đánh dấu đọc!" });
        }

        // PUT: api/Notification/read-all — Đánh dấu tất cả đã đọc
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            int userId = _currentUserService.UserId;
            if (userId == 0) return Unauthorized();

            int count = await _notificationService.MarkAllAsReadAsync(userId);
            return Ok(new { message = $"Đã đánh dấu {count} thông báo đã đọc." });
        }
    }
}
