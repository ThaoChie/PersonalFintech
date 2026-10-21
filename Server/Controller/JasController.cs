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
    [Authorize]
    public class JarsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public JarsController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return idClaim != null ? int.Parse(idClaim) : 0;
        }

        // GET: api/Jars
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Jar>>> GetJars()
        {
            int userId = GetUserId();
            return await _context.Jars.Where(j => j.UserId == userId).ToListAsync();
        }

        // POST: api/Jars (Tạo mới)
        [HttpPost]
        public async Task<ActionResult<Jar>> PostJar(Jar jar)
        {
            int userId = GetUserId();

            // BUG-08: Lỗi hiểu sai đặc tả BR-12 & UC008 Luồng 5c
            // Đặc tả quy định mỗi người dùng có tối đa 10 hũ. Khi vượt 10 hũ phải chặn và báo lỗi 400.
            // Nhưng dev không kiểm tra count >= 10, cho phép tạo hũ thứ 11, 12... thành công!
            
            jar.UserId = userId;
            jar.Balance = 0; // Mặc định tạo hũ mới thì tiền = 0

            _context.Jars.Add(jar);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetJars", new { id = jar.Id }, jar);
        }

        // PUT: api/Jars/5 (Chỉnh sửa / Thiết lập mục tiêu)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutJar(int id, Jar jarData)
        {
            int userId = GetUserId();

            // 1. Tìm hũ cũ trong Database trước
            var existingJar = await _context.Jars
                .FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);

            if (existingJar == null)
            {
                return NotFound("Không tìm thấy hũ này hoặc bạn không có quyền sửa.");
            }

            // 2. Chỉ cập nhật những thông tin cho phép (Tên, %, Mục tiêu)
            existingJar.Name = jarData.Name;
            existingJar.Percent = jarData.Percent;
            existingJar.Goal = jarData.Goal;

            // BUG-07: Lỗi hiểu sai đặc tả UC007 & BR-14
            // Đặc tả quy định: Khi đặt mục tiêu mà số dư hũ >= mục tiêu (Goal > 0) lần đầu, 
            // hệ thống phải gửi thông báo chúc mừng "Đạt mục tiêu" vào bảng Notifications.
            // Nhưng dev chỉ cập nhật trường Goal vào DB mà không tạo thông báo nào!

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Jars/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJar(int id)
        {
            int userId = GetUserId();
            var jar = await _context.Jars.FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);
            
            if (jar == null) return NotFound();

            // Kiểm tra: Nếu hũ còn tiền thì cảnh báo (Tuỳ chọn, hiện tại cứ cho xoá)
            if (jar.Balance > 0)
            {
                // return BadRequest("Hũ này vẫn còn tiền, hãy rút hết tiền trước khi xóa!");
            }

            _context.Jars.Remove(jar);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}