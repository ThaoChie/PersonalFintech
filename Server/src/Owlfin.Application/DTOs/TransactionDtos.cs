using System.ComponentModel.DataAnnotations;

namespace Owlfin.Application.DTOs
{
    public class CreateTransactionDto
    {
        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Số tiền phải lớn hơn 0")]
        public decimal Amount { get; set; }

        public DateTime Date { get; set; } = DateTime.UtcNow;

        [Required]
        public int JarId { get; set; } 
    }

    public class TransactionDto
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public int JarId { get; set; }
        public string JarName { get; set; } = string.Empty;
    }
}
