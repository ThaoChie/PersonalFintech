using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Owlfin.Domain.Common;

namespace Owlfin.Domain.Entities
{
    public class User : BaseEntity
    {
        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        // Ngày phân bổ cố định (Ngày T) của chu kỳ tài chính (1 - 31), mặc định ngày 1
        public int AllocationDay { get; set; } = 1;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Jar> Jars { get; set; } = new List<Jar>();
    }
}
