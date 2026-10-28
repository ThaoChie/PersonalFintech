using Microsoft.EntityFrameworkCore;
using Owlfin.Domain.Entities;

namespace Owlfin.Application.Common.Interfaces
{
    public interface IAppDbContext
    {
        DbSet<User> Users { get; set; }
        DbSet<Jar> Jars { get; set; }
        DbSet<Transaction> Transactions { get; set; }
        DbSet<ChatMessage> ChatMessages { get; set; }
        DbSet<Notification> Notifications { get; set; }
        DbSet<Challenge> Challenges { get; set; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
