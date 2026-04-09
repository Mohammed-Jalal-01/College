using System.ComponentModel.DataAnnotations;

namespace CollegeAPI.Models.DTOs;

public class LectureScheduleDto
{
    public Guid Id { get; set; }
    public Guid BranchId { get; set; }
    public string BranchNameEn { get; set; } = string.Empty;
    public string BranchNameAr { get; set; } = string.Empty;
    public Guid StudyTypeId { get; set; }
    public string StudyTypeNameEn { get; set; } = string.Empty;
    public string StudyTypeNameAr { get; set; } = string.Empty;
    public Guid StageId { get; set; }
    public string StageNameEn { get; set; } = string.Empty;
    public string StageNameAr { get; set; } = string.Empty;
    public int StageNumber { get; set; }
    public string Day { get; set; } = string.Empty;
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string SubjectNameEn { get; set; } = string.Empty;
    public string SubjectNameAr { get; set; } = string.Empty;
    public string InstructorName { get; set; } = string.Empty;
    public string? RoomNumber { get; set; }
    public Guid CreatedBy { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateLectureScheduleDto
{
    [Required]
    public Guid BranchId { get; set; }

    [Required]
    public Guid StudyTypeId { get; set; }

    [Required]
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
}

public class UpdateLectureScheduleDto
{
    [Required]
    public Guid BranchId { get; set; }

    [Required]
    public Guid StudyTypeId { get; set; }

    [Required]
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
}

public class LectureScheduleFilterDto
{
    public Guid? BranchId { get; set; }
    public Guid? StudyTypeId { get; set; }
    public Guid? StageId { get; set; }
}
