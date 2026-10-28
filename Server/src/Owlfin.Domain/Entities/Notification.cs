using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Owlfin.Domain.Common;

namespace Owlfin.Domain.Entities
{
    public class Notification : BaseEntity
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Message { get; set; } = string.Empty;

        // Loại thông báo: "anomaly" | "info" | "warning"
        [MaxLength(50)]
        public string Type { get; set; } = "info";

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")]
        [JsonIgnore]
        public User? User { get; set; }
    }
}
