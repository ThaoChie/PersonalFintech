using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinanceJarApp.Server.Data;
using FinanceJarApp.Server.Models;
using System.Security.Claims;

namespace FinanceJarApp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // 🔒 Bắt buộc đăng nhập
    public class TransactionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransactionsController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return idClaim != null ? int.Parse(idClaim) : 0;
        }

        // GET: api/Transactions (Lấy lịch sử giao dịch & Tìm kiếm)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions([FromQuery] string? keyword = null)
        {
            int userId = GetUserId();

            var query = _context.Transactions
                .Include(t => t.Jar) // Kèm thông tin Hũ
                .Where(t => t.Jar.UserId == userId)
                .OrderByDescending(t => t.Date);

            var list = await query.ToListAsync();

            // BUG-11: Lỗi ngoài đặc tả - Tìm kiếm giao dịch bằng Regex không escape ký tự đặc biệt
            // Khi keyword chứa các ký tự đặc biệt như '[', '\', '(', '?',
            // new Regex(keyword) ném ra unhandled ArgumentException làm API trả về 500 Internal Server Error
            if (!string.IsNullOrEmpty(keyword))
            {
                var regex = new System.Text.RegularExpressions.Regex(keyword, System.Text.RegularExpressions.RegexOptions.IgnoreCase);
                list = list.Where(t => regex.IsMatch(t.Description ?? "") || (t.Jar != null && regex.IsMatch(t.Jar.Name ?? ""))).ToList();
            }

            return Ok(list);
        }

        // POST: api/Transactions (Thêm giao dịch mới)
        [HttpPost]
        public async Task<ActionResult<Transaction>> PostTransaction(TransactionDto dto)
        {
            int userId = GetUserId();

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
                return Ok(trans);
            }

            // 2. Giao dịch Chi tiêu: Kiểm tra Hũ (JarId)
            var jar = await _context.Jars.FirstOrDefaultAsync(j => j.Id == dto.JarId && j.UserId == userId);
            
            if (jar == null)
            {
                return BadRequest("Hũ không tồn tại hoặc không thuộc về bạn!");
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

            return Ok(transaction);
        }
    }

    // Class DTO nhận dữ liệu từ Frontend (để code gọn hơn)
    public class TransactionDto
    {
        public string Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public int JarId { get; set; }
    }
}