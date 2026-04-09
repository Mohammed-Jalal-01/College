using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CollegeAPI.Models.Entities;

public class CourseMaterial
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [ForeignKey("Branch")]
    public Guid BranchId { get; set; }

    [Required]
    [ForeignKey("StudyType")]
    public Guid StudyTypeId { get; set; }

    [Required]
    [ForeignKey("Stage")]
    public Guid StageId { get; set; }

    [Required]
    [MaxLength(20)]
    public string Course { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string TitleEn { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string TitleAr { get; set; } = string.Empty;

    public string? DescriptionEn { get; set; }

    public string? DescriptionAr { get; set; }

    [Required]
    [MaxLength(500)]
    public string FileUrl { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string FileType { get; set; } = string.Empty;

    [ForeignKey("UploadedByUser")]
    public Guid UploadedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Branch Branch { get; set; } = null!;
    public StudyType StudyType { get; set; } = null!;
    public Stage Stage { get; set; } = null!;
    public User UploadedByUser { get; set; } = null!;
}
