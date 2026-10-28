namespace Owlfin.Application.DTOs
{
    public class DashboardSummaryDto
    {
        public decimal TotalBalance { get; set; }
        public decimal MonthIncome { get; set; }
        public decimal MonthExpense { get; set; }
        public int AllocationDay { get; set; } = 1;
        public DateTime CycleStartDate { get; set; }
        public DateTime CycleEndDate { get; set; }
        public int RemainingDaysInCycle { get; set; }
        public decimal DailySafeBudget { get; set; }
        public IEnumerable<RecentTransactionDto> RecentTransactions { get; set; } = new List<RecentTransactionDto>();
    }

    public class RecentTransactionDto
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public int JarId { get; set; }
        public string JarName { get; set; } = string.Empty;
    }
}
