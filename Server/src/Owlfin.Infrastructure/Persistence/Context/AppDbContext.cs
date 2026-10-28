using Microsoft.EntityFrameworkCore;
using Owlfin.Application.Common.Interfaces;
using Owlfin.Domain.Entities;

namespace Owlfin.Infrastructure.Persistence.Context
{
    public class AppDbContext : DbContext, IAppDbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Jar> Jars { get; set; } = null!;
        public DbSet<Transaction> Transactions { get; set; } = null!;
        public DbSet<ChatMessage> ChatMessages { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<Challenge> Challenges { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Cấu hình Quan hệ (Relationships)

            // Xóa User -> Xóa hết Hũ của User đó
            modelBuilder.Entity<Jar>()
                .HasOne(j => j.User)
                .WithMany(u => u.Jars)
                .HasForeignKey(j => j.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Xóa Hũ -> Xóa hết Giao dịch trong hũ đó
            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.Jar)
                .WithMany(j => j.Transactions)
                .HasForeignKey(t => t.JarId)
                .OnDelete(DeleteBehavior.Cascade);

            // Xóa User -> Xóa hết Notification của User đó
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Xóa User -> Xóa hết Challenge của User đó
            modelBuilder.Entity<Challenge>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
