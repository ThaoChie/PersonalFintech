using FluentAssertions;
using Owlfin.Application.Services;
using Xunit;

namespace Owlfin.Application.Tests.Services
{
    public class FinancialCycleAndDailyBudgetTests
    {
        [Fact]
        public void LeapYear_2024_February_Has_29_Days_AllocationDay_1()
        {
            // Năm nhuận 2024: Tháng 2 có 29 ngày
            DateTime.IsLeapYear(2024).Should().BeTrue();
            DateTime.DaysInMonth(2024, 2).Should().Be(29);

            var now = new DateTime(2024, 2, 15, 12, 0, 0, DateTimeKind.Utc);
            var (cycleStart, cycleEnd) = DashboardService.CalculateFinancialCycle(now, 1);

            cycleStart.Should().Be(new DateTime(2024, 2, 1, 0, 0, 0, DateTimeKind.Utc));
            cycleEnd.Date.Should().Be(new DateTime(2024, 2, 29));
            cycleEnd.Day.Should().Be(29);

            int remainingDays = DashboardService.CalculateRemainingDays(now, cycleEnd);
            remainingDays.Should().Be(15); // 29 - 15 + 1 = 15 ngày

            decimal dailyBudget = DashboardService.CalculateDailySafeBudget(15_000_000m, now, 1);
            dailyBudget.Should().Be(1_000_000m);
        }

        [Fact]
        public void NonLeapYear_2025_February_Has_28_Days_AllocationDay_1()
        {
            // Năm không nhuận 2025: Tháng 2 có 28 ngày
            DateTime.IsLeapYear(2025).Should().BeFalse();
            DateTime.DaysInMonth(2025, 2).Should().Be(28);

            var now = new DateTime(2025, 2, 15, 12, 0, 0, DateTimeKind.Utc);
            var (cycleStart, cycleEnd) = DashboardService.CalculateFinancialCycle(now, 1);

            cycleStart.Should().Be(new DateTime(2025, 2, 1, 0, 0, 0, DateTimeKind.Utc));
            cycleEnd.Date.Should().Be(new DateTime(2025, 2, 28));
            cycleEnd.Day.Should().Be(28);

            int remainingDays = DashboardService.CalculateRemainingDays(now, cycleEnd);
            remainingDays.Should().Be(14); // 28 - 15 + 1 = 14 ngày

            decimal dailyBudget = DashboardService.CalculateDailySafeBudget(14_000_000m, now, 1);
            dailyBudget.Should().Be(1_000_000m);
        }

        [Fact]
        public void LeapYear_2024_AllocationDay_30_Ends_On_Feb_29()
        {
            // Năm nhuận 2024: T = 30 bắt đầu từ ngày 30/1, kết thúc vào ngày T-1 của tháng 2 là 29/2
            var now = new DateTime(2024, 1, 30, 8, 0, 0, DateTimeKind.Utc);
            var (cycleStart, cycleEnd) = DashboardService.CalculateFinancialCycle(now, 30);

            cycleStart.Should().Be(new DateTime(2024, 1, 30, 0, 0, 0, DateTimeKind.Utc));
            cycleEnd.Date.Should().Be(new DateTime(2024, 2, 29));
            cycleEnd.Day.Should().Be(29);

            int remainingDays = DashboardService.CalculateRemainingDays(now, cycleEnd);
            remainingDays.Should().Be(31); // 2 ngày tháng 1 (30, 31) + 29 ngày tháng 2 = 31 ngày
        }

        [Fact]
        public void NonLeapYear_2026_AllocationDay_30_Ends_On_Feb_28()
        {
            // Năm không nhuận 2026: T = 30 bắt đầu từ ngày 30/1, kết thúc vào ngày T-1 của tháng 2 (clamp về 28/2)
            var now = new DateTime(2026, 1, 30, 8, 0, 0, DateTimeKind.Utc);
            var (cycleStart, cycleEnd) = DashboardService.CalculateFinancialCycle(now, 30);

            cycleStart.Should().Be(new DateTime(2026, 1, 30, 0, 0, 0, DateTimeKind.Utc));
            cycleEnd.Date.Should().Be(new DateTime(2026, 2, 28));
            cycleEnd.Day.Should().Be(28);

            int remainingDays = DashboardService.CalculateRemainingDays(now, cycleEnd);
            remainingDays.Should().Be(30); // 2 ngày tháng 1 (30, 31) + 28 ngày tháng 2 = 30 ngày
        }

        [Fact]
        public void LeapYear_2024_AllocationDay_29_Starts_On_Feb_29()
        {
            // Năm nhuận 2024: Có ngày 29/2. Khi now = 29/2 và T = 29, chu kỳ mới bắt đầu từ 29/2 đến 28/3
            var now = new DateTime(2024, 2, 29, 10, 0, 0, DateTimeKind.Utc);
            var (cycleStart, cycleEnd) = DashboardService.CalculateFinancialCycle(now, 29);

            cycleStart.Should().Be(new DateTime(2024, 2, 29, 0, 0, 0, DateTimeKind.Utc));
            cycleEnd.Date.Should().Be(new DateTime(2024, 3, 28));
            cycleEnd.Month.Should().Be(3);
            cycleEnd.Day.Should().Be(28);

            int remainingDays = DashboardService.CalculateRemainingDays(now, cycleEnd);
            remainingDays.Should().Be(29); // 1 ngày tháng 2 (29) + 28 ngày tháng 3 = 29 ngày
        }

        [Fact]
        public void NonLeapYear_2026_AllocationDay_29_On_Feb_28_Is_LastDay_Of_Cycle()
        {
            // Năm không nhuận 2026: Không có ngày 29/2. Vào ngày 28/2 và T = 29, chu kỳ thuộc về chu kỳ bắt đầu từ 29/1 đến 28/2
            var now = new DateTime(2026, 2, 28, 15, 0, 0, DateTimeKind.Utc);
            var (cycleStart, cycleEnd) = DashboardService.CalculateFinancialCycle(now, 29);

            cycleStart.Should().Be(new DateTime(2026, 1, 29, 0, 0, 0, DateTimeKind.Utc));
            cycleEnd.Date.Should().Be(new DateTime(2026, 2, 28));
            cycleEnd.Day.Should().Be(28);

            int remainingDays = DashboardService.CalculateRemainingDays(now, cycleEnd);
            remainingDays.Should().Be(1); // Ngày cuối cùng của chu kỳ: 1 ngày duy nhất
        }

        [Fact]
        public void NonLeapYear_2026_March_1_When_AllocationDay_31_Starts_On_March_1()
        {
            // Năm không nhuận 2026: T = 31. Tháng 2 chỉ có 28 ngày nên chu kỳ kết thúc ngày 28/2.
            // Vào ngày 1/3, chu kỳ mới bắt đầu từ ngày 1/3 và kết thúc ngày 30/3 (T-1)
            var now = new DateTime(2026, 3, 1, 9, 0, 0, DateTimeKind.Utc);
            var (cycleStart, cycleEnd) = DashboardService.CalculateFinancialCycle(now, 31);

            cycleStart.Should().Be(new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc));
            cycleEnd.Date.Should().Be(new DateTime(2026, 3, 30));
            cycleEnd.Day.Should().Be(30);

            int remainingDays = DashboardService.CalculateRemainingDays(now, cycleEnd);
            remainingDays.Should().Be(30);
        }
    }
}
