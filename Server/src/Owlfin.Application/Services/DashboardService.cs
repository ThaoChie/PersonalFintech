using Microsoft.EntityFrameworkCore;
using Owlfin.Application.Common.Interfaces;
using Owlfin.Application.DTOs;
using Owlfin.Application.Interfaces;

namespace Owlfin.Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IAppDbContext _context;

        public DashboardService(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardSummaryDto> GetDashboardDataAsync(int userId)
        {
            // 1. Tính tổng số dư các hũ CỦA USER NÀY
            var totalBalance = await _context.Jars
                .Where(j => j.UserId == userId)
                .SumAsync(j => j.Balance);

            // 2. Lấy thông tin User để xác định Ngày phân bổ T & Chu kỳ tài chính cá nhân
            var user = await _context.Users.FindAsync(userId);
            int allocationDay = user != null && user.AllocationDay >= 1 && user.AllocationDay <= 31 ? user.AllocationDay : 1;

            var now = DateTime.UtcNow;
            var (cycleStart, cycleEnd) = CalculateFinancialCycle(now, allocationDay);
            int remainingDays = CalculateRemainingDays(now, cycleEnd);
            decimal dailySafeBudget = totalBalance > 0 && remainingDays > 0 
                ? Math.Round(totalBalance / remainingDays, 2) 
                : 0;

            var transactions = await _context.Transactions
                .Include(t => t.Jar)
                .Where(t => t.Jar != null && t.Jar.UserId == userId && t.Date >= cycleStart && t.Date <= cycleEnd)
                .ToListAsync();

            var income = transactions.Where(t => t.Amount > 0).Sum(t => t.Amount);
            var expense = transactions.Where(t => t.Amount < 0).Sum(t => t.Amount);

            // 3. Lấy 5 giao dịch gần nhất
            // BUG-05: Lỗi hiểu sai đặc tả UC005 - Lấy 5 giao dịch theo thứ tự TĂNG DẦN (OrderBy) thay vì GIẢM DẦN (OrderByDescending)
            var recentTransactions = await _context.Transactions
                .Include(t => t.Jar)
                .Where(t => t.Jar != null && t.Jar.UserId == userId)
                .OrderBy(t => t.Date) // 👈 Lỗi: Đưa giao dịch cũ nhất lên đầu
                .Take(5)
                .Select(t => new RecentTransactionDto
                {
                    Id = t.Id,
                    Description = t.Description,
                    Amount = t.Amount,
                    Date = t.Date,
                    JarId = t.JarId,
                    JarName = t.Jar != null ? t.Jar.Name : string.Empty
                })
                .ToListAsync();

            return new DashboardSummaryDto
            {
                TotalBalance = totalBalance,
                MonthIncome = income,
                MonthExpense = Math.Abs(expense),
                AllocationDay = allocationDay,
                CycleStartDate = cycleStart,
                CycleEndDate = cycleEnd,
                RemainingDaysInCycle = remainingDays,
                DailySafeBudget = dailySafeBudget,
                RecentTransactions = recentTransactions
            };
        }

        /// <summary>
        /// Xác định chu kỳ tài chính của cá nhân: Từ Ngày T của chu kỳ đến 23h59 Ngày T-1.
        /// Xử lý chuẩn xác các trường hợp năm nhuận (tháng 2 có 29 ngày), năm không nhuận (tháng 2 có 28 ngày),
        /// và các tháng có 30 hoặc 31 ngày.
        /// </summary>
        public static (DateTime cycleStart, DateTime cycleEnd) CalculateFinancialCycle(DateTime now, int allocationDay)
        {
            int year = now.Year;
            int month = now.Month;
            int day = now.Day;

            allocationDay = Math.Clamp(allocationDay, 1, 31);

            int DaysInMonth(int y, int m) => DateTime.DaysInMonth(y, m);
            int ClampDay(int y, int m, int d) => Math.Min(d, DaysInMonth(y, m));

            DateTime cycleStart;
            DateTime cycleEnd;

            int daysThisMonth = DaysInMonth(year, month);

            if (allocationDay == 1)
            {
                // Chu kỳ tháng dương lịch chuẩn: từ ngày 1 đến ngày cuối tháng (28/29/30/31 ngày)
                cycleStart = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
                cycleEnd = new DateTime(year, month, daysThisMonth, 23, 59, 59, 999, DateTimeKind.Utc);
            }
            else if (day >= allocationDay)
            {
                int startDay = ClampDay(year, month, allocationDay);
                cycleStart = new DateTime(year, month, startDay, 0, 0, 0, DateTimeKind.Utc);

                DateTime nextMonth = (month == 12) 
                    ? new DateTime(year + 1, 1, 1, 0, 0, 0, DateTimeKind.Utc) 
                    : new DateTime(year, month + 1, 1, 0, 0, 0, DateTimeKind.Utc);

                // Nếu tháng sau là tháng 2 (năm nhuận có 29 ngày, năm thường có 28 ngày)
                int endDay = ClampDay(nextMonth.Year, nextMonth.Month, allocationDay - 1);
                cycleEnd = new DateTime(nextMonth.Year, nextMonth.Month, endDay, 23, 59, 59, 999, DateTimeKind.Utc);
            }
            else
            {
                DateTime prevMonth = (month == 1) 
                    ? new DateTime(year - 1, 12, 1, 0, 0, 0, DateTimeKind.Utc) 
                    : new DateTime(year, month - 1, 1, 0, 0, 0, DateTimeKind.Utc);

                int daysInPrevMonth = DaysInMonth(prevMonth.Year, prevMonth.Month);

                if (allocationDay > daysInPrevMonth)
                {
                    // Tháng trước có ít ngày hơn T (Ví dụ: Tháng trước là tháng 2 có 28/29 ngày, T = 30 hoặc 31, hiện tại là tháng 3)
                    // Chu kỳ bắt đầu từ ngày 1 của tháng hiện tại (ngay sau khi tháng trước kết thúc lúc 23:59:59)
                    cycleStart = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
                }
                else
                {
                    int startDay = ClampDay(prevMonth.Year, prevMonth.Month, allocationDay);
                    cycleStart = new DateTime(prevMonth.Year, prevMonth.Month, startDay, 0, 0, 0, DateTimeKind.Utc);
                }

                int endDay = ClampDay(year, month, allocationDay - 1);
                cycleEnd = new DateTime(year, month, endDay, 23, 59, 59, 999, DateTimeKind.Utc);
            }

            return (cycleStart, cycleEnd);
        }

        /// <summary>
        /// Tính số ngày còn lại trong chu kỳ (tính cả ngày hôm nay).
        /// Đảm bảo tối thiểu là 1 ngày.
        /// </summary>
        public static int CalculateRemainingDays(DateTime now, DateTime cycleEnd)
        {
            var nowDate = now.Date;
            var endDate = cycleEnd.Date;

            if (nowDate > endDate)
            {
                return 1;
            }

            return Math.Max(1, (endDate - nowDate).Days + 1);
        }

        /// <summary>
        /// Tính mức chi tiêu an toàn/ngày: Số dư / Số ngày còn lại của chu kỳ tài chính
        /// </summary>
        public static decimal CalculateDailySafeBudget(decimal balance, DateTime now, int allocationDay)
        {
            if (balance <= 0) return 0;
            var (_, cycleEnd) = CalculateFinancialCycle(now, allocationDay);
            int remainingDays = CalculateRemainingDays(now, cycleEnd);
            return remainingDays > 0 ? Math.Round(balance / remainingDays, 2) : 0;
        }
    }
}
