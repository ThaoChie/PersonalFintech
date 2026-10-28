using Owlfin.Application.DTOs;
using Owlfin.Domain.Entities;

namespace Owlfin.Application.Interfaces
{
    public interface ITransactionService
    {
        Task<IEnumerable<Transaction>> GetTransactionsAsync(int userId, string? keyword = null);
        Task<Transaction> CreateTransactionAsync(int userId, TransactionDto dto);
    }
}
