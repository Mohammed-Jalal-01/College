using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CollegeAPI.Models.Entities;

public class Grade
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string SubjectName { get; set; } = string.Empty;

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
    [MaxLength(500)]
    public string FileUrl { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string FileType { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string OriginalFileName { get; set; } = string.Empty;

    [ForeignKey("UploadedByUser")]
    public Guid UploadedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Branch Branch { get; set; } = null!;
    public StudyType StudyType { get; set; } = null!;
    public Stage Stage { get; set; } = null!;
    public User UploadedByUser { get; set; } = null!;
}
