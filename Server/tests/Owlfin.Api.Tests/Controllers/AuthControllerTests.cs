using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Owlfin.Api.Controllers;
using Owlfin.Application.Common.Interfaces;
using Owlfin.Application.DTOs;
using Owlfin.Application.Interfaces;
using Xunit;

namespace Owlfin.Api.Tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly Mock<ICurrentUserService> _currentUserServiceMock;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            _authServiceMock = new Mock<IAuthService>();
            _currentUserServiceMock = new Mock<ICurrentUserService>();
            _controller = new AuthController(_authServiceMock.Object, _currentUserServiceMock.Object);
        }

        [Fact]
        public async Task Register_ValidDto_ReturnsOkWithSuccessMessage()
        {
            var dto = new RegisterDto { Email = "user@test.com", Password = "password123" };
            _authServiceMock.Setup(s => s.RegisterAsync(dto)).Returns(Task.CompletedTask);

            var result = await _controller.Register(dto);

            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task Login_ValidCredentials_ReturnsOkWithToken()
        {
            var dto = new LoginDto { Email = "user@test.com", Password = "password123" };
            var expectedUser = new UserDto { Id = 1, Email = "user@test.com", Token = "jwt_token" };
            _authServiceMock.Setup(s => s.LoginAsync(dto)).ReturnsAsync(expectedUser);

            var result = await _controller.Login(dto);

            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(200);
        }

        [Theory]
        [InlineData("mysql-31de94ee-jarapp.a.aivencloud.com;Port=26909;Database=defaultdb;User=avnadmin;Password=secret",
                    "Server=mysql-31de94ee-jarapp.a.aivencloud.com;Port=26909;Database=defaultdb;User=avnadmin;Password=secret;SslMode=Required;")]
        [InlineData("Server=mysql-31de94ee-jarapp.a.aivencloud.com;Port=26909;Database=defaultdb;User=avnadmin;Password=secret",
                    "Server=mysql-31de94ee-jarapp.a.aivencloud.com;Port=26909;Database=defaultdb;User=avnadmin;Password=secret;SslMode=Required;")]
        [InlineData("\"mysql-31de94ee-jarapp.a.aivencloud.com;Port=26909;Database=defaultdb;User=avnadmin;Password=secret\"",
                    "Server=mysql-31de94ee-jarapp.a.aivencloud.com;Port=26909;Database=defaultdb;User=avnadmin;Password=secret;SslMode=Required;")]
        [InlineData("mysql://avnadmin:secret@mysql-31de94ee-jarapp.a.aivencloud.com:26909/defaultdb",
                    "Server=mysql-31de94ee-jarapp.a.aivencloud.com;Port=26909;Database=defaultdb;User=avnadmin;Password=secret;SslMode=Required;")]
        public void NormalizeConnectionString_HandlesMissingServerPrefixAndAivenUri(string input, string expected)
        {
            var result = Owlfin.Infrastructure.DependencyInjection.NormalizeConnectionString(input);
            result.Should().Be(expected);
        }
    }
}
