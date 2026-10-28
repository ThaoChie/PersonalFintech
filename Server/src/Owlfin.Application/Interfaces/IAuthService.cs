using Owlfin.Application.DTOs;

namespace Owlfin.Application.Interfaces
{
    public interface IAuthService
    {
        Task RegisterAsync(RegisterDto request);
        Task<UserDto> LoginAsync(LoginDto request);
        Task<UserDto?> GetProfileAsync(int userId);
        Task<string> UpdateProfileAsync(int userId, UpdateProfileDto request);
        Task ChangePasswordAsync(int userId, ChangePasswordDto request);
    }
}
