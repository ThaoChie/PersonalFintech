using Microsoft.EntityFrameworkCore;
using Owlfin.Application.Common.Exceptions;
using Owlfin.Application.Common.Interfaces;
using Owlfin.Application.DTOs;
using Owlfin.Application.Interfaces;
using Owlfin.Domain.Entities;

namespace Owlfin.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAppDbContext _context;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        public AuthService(IAppDbContext context, IJwtTokenGenerator jwtTokenGenerator)
        {
            _context = context;
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        public async Task RegisterAsync(RegisterDto request)
        {
            // 1. Kiểm tra Email trùng
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                throw new ValidationException("Email này đã tồn tại.");
            }

            // BUG-01: Lỗi hiểu sai đặc tả BR-02 - Chỉ kiểm tra độ dài >= 8, quên kiểm tra mật khẩu phải có cả chữ và số
            // (Mật khẩu "12345678" hoặc "abcdefgh" vẫn được chấp nhận)
            if (string.IsNullOrEmpty(request.Password) || request.Password.Length < 8)
            {
                throw new ValidationException("Mật khẩu phải có tối thiểu 8 ký tự.");
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
                CreatedAt = DateTime.UtcNow
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
        }

        public async Task<UserDto> LoginAsync(LoginDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            // BUG-02: Lỗi hiểu sai đặc tả UC002 Luồng 2a - Thay vì câu chuẩn 'Email hoặc mật khẩu không chính xác'
            // Dev tách riêng thông báo lộ thông tin bảo mật và sai đặc tả
            if (user == null)
            {
                throw new ValidationException("Email không tồn tại trong hệ thống.");
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                throw new ValidationException("Mật khẩu không chính xác.");
            }

            string token = _jwtTokenGenerator.GenerateToken(user);

            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                AllocationDay = user.AllocationDay > 0 ? user.AllocationDay : 1,
                CreatedAt = user.CreatedAt,
                Token = token
            };
        }

        public async Task<UserDto?> GetProfileAsync(int userId)
        {
            var user = await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    FullName = u.FullName,
                    AllocationDay = u.AllocationDay > 0 ? u.AllocationDay : 1,
                    CreatedAt = u.CreatedAt
                })
                .FirstOrDefaultAsync();

            return user;
        }

        public async Task<string> UpdateProfileAsync(int userId, UpdateProfileDto request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new NotFoundException("User", userId);
            }

            // BUG-03: Lỗi hiểu sai đặc tả UC003 Bảng 2.6.3 - Quên validate chặn dưới 2 ký tự, cho phép tên 1 ký tự
            if (string.IsNullOrWhiteSpace(request.FullName) || request.FullName.Length > 100)
            {
                throw new ValidationException("Họ tên không được để trống và tối đa 100 ký tự.");
            }

            user.FullName = request.FullName;
            if (request.AllocationDay.HasValue && request.AllocationDay.Value >= 1 && request.AllocationDay.Value <= 31)
            {
                user.AllocationDay = request.AllocationDay.Value;
            }
            await _context.SaveChangesAsync();

            return user.FullName;
        }

        public async Task ChangePasswordAsync(int userId, ChangePasswordDto request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new NotFoundException("User", userId);
            }

            if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash))
            {
                throw new ValidationException("Mật khẩu cũ không đúng.");
            }

            // BUG-04: Lỗi hiểu sai đặc tả UC004 Luồng 3b - Quên kiểm tra mật khẩu mới trùng mật khẩu cũ
            // Cho phép đổi mật khẩu mới giống hệt mật khẩu hiện tại
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();
        }
    }
}
