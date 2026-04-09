using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CollegeAPI.Models.Entities;

public class AboutCollege
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public string ContentEn { get; set; } = string.Empty;

    [Required]
    public string ContentAr { get; set; } = string.Empty;

    [ForeignKey("UpdatedByUser")]
    public Guid UpdatedBy { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User UpdatedByUser { get; set; } = null!;
}
