using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Owlfin.Domain.Common;

namespace Owlfin.Domain.Entities
{
    public class Transaction : BaseEntity
    {
        public int JarId { get; set; }

        public DateTime Date { get; set; }

        // Số tiền giao dịch: Số Âm (-) là Chi tiêu, Số Dương (+) là Thu nhập/Nạp tiền
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Amount { get; set; }

        [MaxLength(200)]
        public string Description { get; set; } = string.Empty;

        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

        [ForeignKey("JarId")]
        [JsonIgnore]
        public Jar? Jar { get; set; }
    }
}
