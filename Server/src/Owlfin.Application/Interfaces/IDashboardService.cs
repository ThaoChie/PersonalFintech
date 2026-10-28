using Owlfin.Application.DTOs;

namespace Owlfin.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardSummaryDto> GetDashboardDataAsync(int userId);
    }
}
