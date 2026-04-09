using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CollegeAPI.Models.Entities;

public class News
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string TitleEn { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string TitleAr { get; set; } = string.Empty;

    [Required]
    public string ContentEn { get; set; } = string.Empty;

    [Required]
    public string ContentAr { get; set; } = string.Empty;

    public bool IsFeatured { get; set; } = false;

    [ForeignKey("CreatedByUser")]
    public Guid CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User CreatedByUser { get; set; } = null!;
}
