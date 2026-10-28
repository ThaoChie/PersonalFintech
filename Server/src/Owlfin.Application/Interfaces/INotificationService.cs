using Owlfin.Domain.Entities;

namespace Owlfin.Application.Interfaces
{
    public interface INotificationService
    {
        Task<IEnumerable<Notification>> GetNotificationsAsync(int userId);
        Task<int> GetUnreadCountAsync(int userId);
        Task<bool> MarkAsReadAsync(int userId, int notificationId);
        Task<int> MarkAllAsReadAsync(int userId);
    }
}
