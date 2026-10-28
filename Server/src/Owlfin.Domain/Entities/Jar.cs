using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Owlfin.Domain.Common;

namespace Owlfin.Domain.Entities
{
    public class Jar : BaseEntity
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public decimal Balance { get; set; } = 0;

        public double Percent { get; set; } = 0; // % phân bổ (VD: 55, 10...)
        public decimal Goal { get; set; } = 0;   // Mục tiêu tiết kiệm (VD: 50 triệu)

        public int UserId { get; set; }
        
        [JsonIgnore]
        public User? User { get; set; }

        [JsonIgnore]
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

        [NotMapped]
        public decimal DailyBudget { get; set; }

        [NotMapped]
        public int RemainingDaysInCycle { get; set; }
    }
}
