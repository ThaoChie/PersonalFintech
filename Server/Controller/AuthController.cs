using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FinanceJarApp.Server.Data;
using FinanceJarApp.Server.Models;

namespace FinanceJarApp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // --- ĐĂNG KÝ ---
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto request)
        {
            try 
            {
                // 1. Kiểm tra Email trùng
                if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                {
                    return BadRequest("Email này đã tồn tại.");
                }

                // BUG-01: Lỗi hiểu sai đặc tả BR-02 - Chỉ kiểm tra độ dài >= 8, quên kiểm tra mật khẩu phải có cả chữ và số
                // (Mật khẩu "12345678" hoặc "abcdefgh" vẫn được chấp nhận)
                if (string.IsNullOrEmpty(request.Password) || request.Password.Length < 8)
                {
                    return BadRequest("Mật khẩu phải có tối thiểu 8 ký tự.");
                }

                string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

                // 2. Điền thông tin mặc định nếu thiếu
                string finalUsername = string.IsNullOrEmpty(request.Username) ? request.Email : request.Username;
                string finalFullName = string.IsNullOrEmpty(request.FullName) 
                                       ? request.Email.Split('@')[0] 
                                       : request.FullName;

                var newUser = new User
                {
                    Username = finalUsername,
                    Email = request.Email,
                    PasswordHash = passwordHash,
                    FullName = finalFullName,
                    CreatedAt = DateTime.Now  
                };

                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();

                // Khởi tạo 6 hũ mặc định theo Bảng 2.6.14 & BR-04
                var defaultJars = new List<Jar>
                {
                    new Jar { Name = "Thiết yếu", Percent = 55, Balance = 0, Goal = 0, UserId = newUser.Id },
                    new Jar { Name = "Tiết kiệm", Percent = 10, Balance = 0, Goal = 0, UserId = newUser.Id },
                    new Jar { Name = "Đầu tư", Percent = 10, Balance = 0, Goal = 0, UserId = newUser.Id },
                    new Jar { Name = "Giáo dục", Percent = 10, Balance = 0, Goal = 0, UserId = newUser.Id },
                    new Jar { Name = "Hưởng thụ", Percent = 10, Balance = 0, Goal = 0, UserId = newUser.Id },
                    new Jar { Name = "Cho đi", Percent = 5, Balance = 0, Goal = 0, UserId = newUser.Id }
                };
                _context.Jars.AddRange(defaultJars);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Đăng ký thành công!" });
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ LỖI DATABASE: " + ex.Message);
                if (ex.InnerException != null)
                {
                    Console.WriteLine("❌ CHI TIẾT GỐC RỄ: " + ex.InnerException.Message);
                }
                return StatusCode(500, "Lỗi máy chủ: " + ex.Message);
            }
        }

        // --- ĐĂNG NHẬP ---
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            
            // BUG-02: Lỗi hiểu sai đặc tả UC002 Luồng 2a - Thay vì câu chuẩn 'Email hoặc mật khẩu không chính xác'
            // Dev tách riêng thông báo lộ thông tin bảo mật và sai đặc tả
            if (user == null)
            {
                return BadRequest("Email không tồn tại trong hệ thống.");
            }
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return BadRequest("Mật khẩu không chính xác.");
            }

            string token = CreateToken(user);
            return Ok(new { token = token, username = user.Username, fullName = user.FullName, email = user.Email });
        }

        // --- LẤY THÔNG TIN (PROFILE) ---
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(idClaim)) return Unauthorized();

            int userId = int.Parse(idClaim);

            var user = await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => new { u.Id, u.Username, u.Email, u.FullName, u.CreatedAt })
                .FirstOrDefaultAsync();

            if (user == null) return NotFound("User không tồn tại");

            return Ok(user);
        }

        // --- CẬP NHẬT THÔNG TIN ---
        [HttpPut("update-profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile(UpdateProfileDto request)
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(idClaim)) return Unauthorized();
            int userId = int.Parse(idClaim);

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            // BUG-03: Lỗi hiểu sai đặc tả UC003 Bảng 2.6.3 - Quên validate chặn dưới 2 ký tự, cho phép tên 1 ký tự
            if (string.IsNullOrWhiteSpace(request.FullName) || request.FullName.Length > 100)
            {
                return BadRequest("Họ tên không được để trống và tối đa 100 ký tự.");
            }

            user.FullName = request.FullName;
            
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thành công!", fullName = user.FullName });
        }

        // --- ĐỔI MẬT KHẨU ---
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto request)
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(idClaim)) return Unauthorized();
            int userId = int.Parse(idClaim);

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash))
            {
                return BadRequest("Mật khẩu cũ không đúng.");
            }

            // BUG-04: Lỗi hiểu sai đặc tả UC004 Luồng 3b - Quên kiểm tra mật khẩu mới trùng mật khẩu cũ
            // Cho phép đổi mật khẩu mới giống hệt mật khẩu hiện tại
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đổi mật khẩu thành công!" });
        }

        // Helper: Tạo Token
        private string CreateToken(User user)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username ?? user.Email), // Fallback nếu username null
                new Claim(ClaimTypes.Email, user.Email)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? ""));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // --- DTOs (Data Transfer Objects) ---
    
    public class RegisterDto
    {
        public string? FullName { get; set; } // Thêm trường này để nhận Họ Tên từ React
        public string? Username { get; set; } // Cho phép null (để code tự xử lý)
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class LoginDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class UpdateProfileDto
    {
        public string FullName { get; set; }
    }

    public class ChangePasswordDto
    {
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }
}