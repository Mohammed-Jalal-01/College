using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CollegeAPI.Models.Entities;

public class Department
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string NameEn { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string NameAr { get; set; } = string.Empty;

    [Required]
    public string DescriptionEn { get; set; } = string.Empty;

    [Required]
    public string DescriptionAr { get; set; } = string.Empty;

    [ForeignKey("CreatedByUser")]
    public Guid CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User CreatedByUser { get; set; } = null!;
}
