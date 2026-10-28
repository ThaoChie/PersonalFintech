using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Owlfin.Application.Common.Interfaces;
using Owlfin.Application.Interfaces;

namespace Owlfin.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly ICurrentUserService _currentUserService;

        public DashboardController(IDashboardService dashboardService, ICurrentUserService currentUserService)
        {
            _dashboardService = dashboardService;
            _currentUserService = currentUserService;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboardData()
        {
            int userId = _currentUserService.UserId;
            if (userId == 0) return Unauthorized();

            var data = await _dashboardService.GetDashboardDataAsync(userId);
            return Ok(data);
        }
    }
}
