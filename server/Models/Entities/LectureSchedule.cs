using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CollegeAPI.Models.Entities;

public class LectureSchedule
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
    public string Day { get; set; } = string.Empty;

    [Required]
    public TimeSpan StartTime { get; set; }

    [Required]
    public TimeSpan EndTime { get; set; }

    [Required]
    [MaxLength(200)]
    public string SubjectNameEn { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string SubjectNameAr { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string InstructorName { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? RoomNumber { get; set; }

    [ForeignKey("CreatedByUser")]
    public Guid CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Branch Branch { get; set; } = null!;
    public StudyType StudyType { get; set; } = null!;
    public Stage Stage { get; set; } = null!;
    public User CreatedByUser { get; set; } = null!;
}
