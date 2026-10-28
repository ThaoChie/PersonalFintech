using FluentAssertions;
using Owlfin.Application.DTOs;
using Owlfin.Application.Services;
using Owlfin.Application.Tests.Common;
using Owlfin.Domain.Entities;
using Xunit;

namespace Owlfin.Application.Tests.Services
{
    public class TransactionServiceTests : IDisposable
    {
        private readonly TestDbContext _context;
        private readonly TransactionService _service;

        public TransactionServiceTests()
        {
            _context = TestDbContext.Create();
            _service = new TransactionService(_context);
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        // BUG-09 Test Verification: Allows future date transactions
        [Fact]
        public async Task CreateTransactionAsync_FutureDate_Succeeds()
        {
            int userId = 300;
            var jar = new Jar { Name = "General", UserId = userId, Balance = 100_000m };
            _context.Jars.Add(jar);
            await _context.SaveChangesAsync();

            var futureDto = new TransactionDto
            {
                Description = "Future income",
                Amount = -20_000m,
                Date = DateTime.UtcNow.AddYears(2),
                JarId = jar.Id
            };

            var result = await _service.CreateTransactionAsync(userId, futureDto);
            result.Id.Should().BeGreaterThan(0);
            result.Date.Year.Should().BeGreaterThan(DateTime.UtcNow.Year);
        }

        // BUG-12 Test Verification: Income with 0 jars throws InvalidOperationException (causing 500)
        [Fact]
        public async Task CreateTransactionAsync_IncomeWithZeroJars_ThrowsInvalidOperationException()
        {
            int userId = 400; // No jars in DB for this user

            var incomeDto = new TransactionDto
            {
                Description = "Salary",
                Amount = 10_000_000m,
                Date = DateTime.UtcNow
            };

            var act = async () => await _service.CreateTransactionAsync(userId, incomeDto);
            await act.Should().ThrowAsync<InvalidOperationException>();
        }
    }
}
