using FluentAssertions;
using Owlfin.Application.Services;
using Owlfin.Application.Tests.Common;
using Owlfin.Domain.Entities;
using Xunit;

namespace Owlfin.Application.Tests.Services
{
    public class JarServiceTests : IDisposable
    {
        private readonly TestDbContext _context;
        private readonly JarService _service;

        public JarServiceTests()
        {
            _context = TestDbContext.Create();
            _service = new JarService(_context);
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        // BUG-08 Test Verification: Allows creating > 10 jars
        [Fact]
        public async Task CreateJarAsync_UserAlreadyHasTenJars_AllowsEleventhJar()
        {
            int userId = 100;
            for (int i = 1; i <= 10; i++)
            {
                _context.Jars.Add(new Jar { Name = $"Jar {i}", UserId = userId });
            }
            await _context.SaveChangesAsync();

            var newJar = new Jar { Name = "Jar 11", Percent = 0, Goal = 0 };
            var result = await _service.CreateJarAsync(userId, newJar);

            result.Id.Should().BeGreaterThan(0);
            _context.Jars.Count(j => j.UserId == userId).Should().Be(11);
        }

        // BUG-07 Test Verification: Updating goal does not generate notification
        [Fact]
        public async Task UpdateJarAsync_BalanceReachesGoal_DoesNotCreateNotification()
        {
            int userId = 200;
            var jar = new Jar { Name = "Savings", UserId = userId, Balance = 2_000_000m, Goal = 0 };
            _context.Jars.Add(jar);
            await _context.SaveChangesAsync();

            var updateData = new Jar { Name = "Savings", Goal = 1_500_000m, Percent = 10 };
            var result = await _service.UpdateJarAsync(userId, jar.Id, updateData);

            result.Should().BeTrue();
            _context.Notifications.Count(n => n.UserId == userId).Should().Be(0);
        }
    }
}
