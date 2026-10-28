using FluentAssertions;
using Moq;
using Owlfin.Application.Common.Exceptions;
using Owlfin.Application.Common.Interfaces;
using Owlfin.Application.DTOs;
using Owlfin.Application.Services;
using Owlfin.Application.Tests.Common;
using Owlfin.Domain.Entities;
using Xunit;

namespace Owlfin.Application.Tests.Services
{
    public class AuthServiceTests : IDisposable
    {
        private readonly TestDbContext _context;
        private readonly Mock<IJwtTokenGenerator> _jwtMock;
        private readonly AuthService _service;

        public AuthServiceTests()
        {
            _context = TestDbContext.Create();
            _jwtMock = new Mock<IJwtTokenGenerator>();
            _jwtMock.Setup(j => j.GenerateToken(It.IsAny<User>())).Returns("mock_token_123");
            _service = new AuthService(_context, _jwtMock.Object);
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        [Fact]
        public async Task RegisterAsync_ValidRequest_CreatesUserAndSixDefaultJars()
        {
            var request = new RegisterDto
            {
                Email = "test@owlfin.vn",
                Password = "validpassword123",
                FullName = "Nguyen Van A"
            };

            await _service.RegisterAsync(request);

            _context.Users.Should().ContainSingle(u => u.Email == "test@owlfin.vn");
            var user = _context.Users.First();
            _context.Jars.Count(j => j.UserId == user.Id).Should().Be(6);
        }

        [Fact]
        public async Task RegisterAsync_DuplicateEmail_ThrowsValidationException()
        {
            _context.Users.Add(new User { Email = "dup@owlfin.vn", PasswordHash = "hash" });
            await _context.SaveChangesAsync();

            var request = new RegisterDto
            {
                Email = "dup@owlfin.vn",
                Password = "password123"
            };

            var act = async () => await _service.RegisterAsync(request);
            await act.Should().ThrowAsync<ValidationException>()
                .WithMessage("Email này đã tồn tại.");
        }

        // BUG-01 Test Verification: Accepts password without digits check, but rejects < 8 chars
        [Fact]
        public async Task RegisterAsync_PasswordUnderEightChars_ThrowsValidationException()
        {
            var request = new RegisterDto
            {
                Email = "shortpass@owlfin.vn",
                Password = "12345"
            };

            var act = async () => await _service.RegisterAsync(request);
            await act.Should().ThrowAsync<ValidationException>()
                .WithMessage("Mật khẩu phải có tối thiểu 8 ký tự.");
        }

        // BUG-02 Test Verification: Separate error messages
        [Fact]
        public async Task LoginAsync_NonExistentEmail_ThrowsSpecificEmailError()
        {
            var request = new LoginDto
            {
                Email = "unknown@owlfin.vn",
                Password = "password123"
            };

            var act = async () => await _service.LoginAsync(request);
            await act.Should().ThrowAsync<ValidationException>()
                .WithMessage("Email không tồn tại trong hệ thống.");
        }

        [Fact]
        public async Task LoginAsync_WrongPassword_ThrowsSpecificPasswordError()
        {
            var user = new User
            {
                Email = "user@owlfin.vn",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("correct_pass_123")
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var request = new LoginDto
            {
                Email = "user@owlfin.vn",
                Password = "wrong_password"
            };

            var act = async () => await _service.LoginAsync(request);
            await act.Should().ThrowAsync<ValidationException>()
                .WithMessage("Mật khẩu không chính xác.");
        }

        // BUG-03 Test Verification: Allows 1-character FullName
        [Fact]
        public async Task UpdateProfileAsync_OneCharFullName_Succeeds()
        {
            var user = new User
            {
                Email = "profile@owlfin.vn",
                FullName = "Old Name",
                PasswordHash = "hash"
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var result = await _service.UpdateProfileAsync(user.Id, new UpdateProfileDto { FullName = "A" });
            result.Should().Be("A");
        }

        // BUG-04 Test Verification: Allows NewPassword identical to OldPassword
        [Fact]
        public async Task ChangePasswordAsync_IdenticalNewPassword_Succeeds()
        {
            var rawPass = "password123";
            var user = new User
            {
                Email = "changepass@owlfin.vn",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(rawPass)
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var act = async () => await _service.ChangePasswordAsync(user.Id, new ChangePasswordDto
            {
                OldPassword = rawPass,
                NewPassword = rawPass
            });

            await act.Should().NotThrowAsync();
        }
    }
}
