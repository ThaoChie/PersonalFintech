using System.ComponentModel.DataAnnotations;

namespace Owlfin.Application.DTOs
{
    public class RegisterDto
    {
        public string? FullName { get; set; }
        public string? Username { get; set; }

        [Required(ErrorMessage = "Email không được để trống")]
        [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginDto
    {
        [Required(ErrorMessage = "Email không được để trống")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        public string Password { get; set; } = string.Empty;
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public int AllocationDay { get; set; } = 1;
        public DateTime CreatedAt { get; set; }
        public string Token { get; set; } = string.Empty;
    }

    public class UpdateProfileDto
    {
        [Required]
        public string FullName { get; set; } = string.Empty;
        public int? AllocationDay { get; set; }
    }

    public class ChangePasswordDto
    {
        [Required]
        public string OldPassword { get; set; } = string.Empty;

        [Required]
        public string NewPassword { get; set; } = string.Empty;
    }
}
