using Microsoft.EntityFrameworkCore;
using Owlfin.Application.Common.Exceptions;
using Owlfin.Application.Common.Interfaces;
using Owlfin.Application.Interfaces;
using Owlfin.Domain.Entities;

namespace Owlfin.Application.Services
{
    public class JarService : IJarService
    {
        private readonly IAppDbContext _context;

        public JarService(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Jar>> GetJarsByUserIdAsync(int userId)
        {
            var jars = await _context.Jars
                .Where(j => j.UserId == userId)
                .ToListAsync();

            var user = await _context.Users.FindAsync(userId);
            int allocationDay = user != null && user.AllocationDay >= 1 && user.AllocationDay <= 31 ? user.AllocationDay : 1;

            var now = DateTime.UtcNow;
            var (_, cycleEnd) = DashboardService.CalculateFinancialCycle(now, allocationDay);
            int remainingDays = DashboardService.CalculateRemainingDays(now, cycleEnd);

            foreach (var jar in jars)
            {
                jar.RemainingDaysInCycle = remainingDays;
                jar.DailyBudget = jar.Balance > 0 && remainingDays > 0 
                    ? Math.Round(jar.Balance / remainingDays, 2) 
                    : 0;
            }

            return jars;
        }

        public async Task<Jar> CreateJarAsync(int userId, Jar jar)
        {
            // BUG-08: Lỗi hiểu sai đặc tả BR-12 & UC008 Luồng 5c
            // Đặc tả quy định mỗi người dùng có tối đa 10 hũ. Khi vượt 10 hũ phải chặn và báo lỗi 400.
            // Nhưng dev không kiểm tra count >= 10, cho phép tạo hũ thứ 11, 12... thành công!

            jar.UserId = userId;
            jar.Balance = 0; // Mặc định tạo hũ mới thì tiền = 0

            _context.Jars.Add(jar);
            await _context.SaveChangesAsync();

            return jar;
        }

        public async Task<bool> UpdateJarAsync(int userId, int jarId, Jar jarData)
        {
            var existingJar = await _context.Jars
                .FirstOrDefaultAsync(j => j.Id == jarId && j.UserId == userId);

            if (existingJar == null)
            {
                return false;
            }

            existingJar.Name = jarData.Name;
            existingJar.Percent = jarData.Percent;
            existingJar.Goal = jarData.Goal;

            // BUG-07: Lỗi hiểu sai đặc tả UC007 & BR-14
            // Đặc tả quy định: Khi đặt mục tiêu mà số dư hũ >= mục tiêu (Goal > 0) lần đầu, 
            // hệ thống phải gửi thông báo chúc mừng "Đạt mục tiêu" vào bảng Notifications.
            // Nhưng dev chỉ cập nhật trường Goal vào DB mà không tạo thông báo nào!

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteJarAsync(int userId, int jarId)
        {
            var jar = await _context.Jars
                .FirstOrDefaultAsync(j => j.Id == jarId && j.UserId == userId);

            if (jar == null)
            {
                return false;
            }

            _context.Jars.Remove(jar);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
