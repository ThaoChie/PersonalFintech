using Microsoft.EntityFrameworkCore;
using Owlfin.Application.Common.Interfaces;
using Owlfin.Domain.Entities;

namespace Owlfin.Application.Tests.Common
{
    public class TestDbContext : DbContext, IAppDbContext
    {
        public TestDbContext(DbContextOptions<TestDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Jar> Jars { get; set; } = null!;
        public DbSet<Transaction> Transactions { get; set; } = null!;
        public DbSet<ChatMessage> ChatMessages { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<Challenge> Challenges { get; set; } = null!;

        public static TestDbContext Create()
        {
            var options = new DbContextOptionsBuilder<TestDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new TestDbContext(options);
        }
    }
}
