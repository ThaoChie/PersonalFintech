using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Owlfin.Application.Common.Interfaces;
using Owlfin.Application.DTOs;
using Owlfin.Application.Interfaces;

namespace Owlfin.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ICurrentUserService _currentUserService;

        public AuthController(IAuthService authService, ICurrentUserService currentUserService)
        {
            _authService = authService;
            _currentUserService = currentUserService;
        }

        // --- ĐĂNG KÝ ---
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto request)
        {
            await _authService.RegisterAsync(request);
            return Ok(new { message = "Đăng ký thành công!" });
        }

        // --- ĐĂNG NHẬP ---
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            var user = await _authService.LoginAsync(request);
            return Ok(new { token = user.Token, username = user.Username, fullName = user.FullName, email = user.Email });
        }

        // --- LẤY THÔNG TIN (PROFILE) ---
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            int userId = _currentUserService.UserId;
            if (userId == 0) return Unauthorized();

            var user = await _authService.GetProfileAsync(userId);
            if (user == null) return NotFound("User không tồn tại");

            return Ok(user);
        }

        // --- CẬP NHẬT THÔNG TIN ---
        [HttpPut("update-profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto request)
        {
            int userId = _currentUserService.UserId;
            if (userId == 0) return Unauthorized();

            var fullName = await _authService.UpdateProfileAsync(userId, request);
            return Ok(new { message = "Cập nhật thành công!", fullName = fullName });
        }

        // --- ĐỔI MẬT KHẨU ---
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto request)
        {
            int userId = _currentUserService.UserId;
            if (userId == 0) return Unauthorized();

            await _authService.ChangePasswordAsync(userId, request);
            return Ok(new { message = "Đổi mật khẩu thành công!" });
        }
    }
}
