using System.ComponentModel.DataAnnotations;

namespace Owlfin.Application.DTOs
{
    public class CreateJarDto
    {
        [Required(ErrorMessage = "Tên hũ không được để trống")]
        public string Name { get; set; } = string.Empty;

        [Range(0, 100, ErrorMessage = "Phần trăm phải từ 0 đến 100")]
        public double TargetPercentage { get; set; }
    }

    public class UpdateJarDto
    {
        public string Name { get; set; } = string.Empty;
        public double TargetPercentage { get; set; }
    }

    public class JarDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double TargetPercentage { get; set; }
        public decimal Balance { get; set; }
    }
}
