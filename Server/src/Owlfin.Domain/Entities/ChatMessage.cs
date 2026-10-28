using System.ComponentModel.DataAnnotations;
using Owlfin.Domain.Common;

namespace Owlfin.Domain.Entities
{
    public class ChatMessage : BaseEntity
    {
        public int UserId { get; set; }

        public string Role { get; set; } = "user"; // "user" hoặc "model" (bot)
        
        public string Content { get; set; } = string.Empty;
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
