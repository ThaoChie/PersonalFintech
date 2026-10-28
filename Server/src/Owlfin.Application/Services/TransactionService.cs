using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Owlfin.Application.Common.Exceptions;
using Owlfin.Application.Common.Interfaces;
using Owlfin.Application.DTOs;
using Owlfin.Application.Interfaces;
using Owlfin.Domain.Entities;

namespace Owlfin.Application.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly IAppDbContext _context;

        public TransactionService(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Transaction>> GetTransactionsAsync(int userId, string? keyword = null)
        {
            var query = _context.Transactions
                .Include(t => t.Jar)
                .Where(t => t.Jar != null && t.Jar.UserId == userId)
                .OrderByDescending(t => t.Date);

            var list = await query.ToListAsync();

            // BUG-11: Lỗi ngoài đặc tả - Tìm kiếm giao dịch bằng Regex không escape ký tự đặc biệt
            // Khi keyword chứa các ký tự đặc biệt như '[', '\', '(', '?',
            // new Regex(keyword) ném ra unhandled ArgumentException làm API trả về 500 Internal Server Error
            if (!string.IsNullOrEmpty(keyword))
            {
                var regex = new Regex(keyword, RegexOptions.IgnoreCase);
                list = list.Where(t => regex.IsMatch(t.Description ?? "") || (t.Jar != null && regex.IsMatch(t.Jar.Name ?? ""))).ToList();
            }

            return list;
        }

        public async Task<Transaction> CreateTransactionAsync(int userId, TransactionDto dto)
        {
            // BUG-09: Lỗi hiểu sai đặc tả Bảng 2.6.9 & Luồng 6a
            // Đặc tả quy định Ngày giao dịch không được ở tương lai.
            // Nhưng dev không kiểm tra dto.Date > DateTime.Today, cho phép lưu giao dịch với ngày tương lai

            // 1. Giao dịch Thu nhập: Phân bổ tự động vào các hũ (BR-07)
            if (dto.Amount > 0)
            {
                var userJars = await _context.Jars.Where(j => j.UserId == userId).ToListAsync();

                // BUG-12: Lỗi ngoài đặc tả - Phân bổ thu nhập khi người dùng không có hũ nào (hoặc hũ bị xóa hết)
                // Dev giả định luôn có hũ và gọi .First() trực tiếp mà không kiểm tra userJars.Count == 0,
                // ném ra ngoại lệ InvalidOperationException ("Sequence contains no elements") gây lỗi 500
                var primaryJar = userJars.OrderByDescending(j => j.Percent).First();

                var trans = new Transaction
                {
                    Description = dto.Description,
                    Amount = dto.Amount,
                    Date = dto.Date,
                    JarId = primaryJar.Id
                };

                decimal distributedTotal = 0;
                foreach (var j in userJars)
                {
                    if (j.Id != primaryJar.Id)
                    {
                        decimal share = Math.Round(dto.Amount * (decimal)(j.Percent / 100.0), 0);
                        j.Balance += share;
                        distributedTotal += share;
                    }
                }
                primaryJar.Balance += (dto.Amount - distributedTotal);

                _context.Transactions.Add(trans);
                await _context.SaveChangesAsync();
                return trans;
            }

            // 2. Giao dịch Chi tiêu: Kiểm tra Hũ (JarId)
            var jar = await _context.Jars.FirstOrDefaultAsync(j => j.Id == dto.JarId && j.UserId == userId);

            if (jar == null)
            {
                throw new ValidationException("Hũ không tồn tại hoặc không thuộc về bạn!");
            }

            var transaction = new Transaction
            {
                Description = dto.Description,
                Amount = dto.Amount,
                Date = dto.Date,
                JarId = dto.JarId
            };

            jar.Balance += dto.Amount;

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return transaction;
        }
    }
}
