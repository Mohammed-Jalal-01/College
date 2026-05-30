using System.ComponentModel.DataAnnotations;

namespace CollegeAPI.Models.DTOs;

public class GradeDto
{
    public Guid Id { get; set; }
    public string SubjectName { get; set; } = string.Empty;
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
    public string FileUrl { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public Guid UploadedBy { get; set; }
    public string UploadedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateGradeDto
{
    [Required]
    [MaxLength(200)]
    public string SubjectName { get; set; } = string.Empty;

    [Required]
    public Guid BranchId { get; set; }

    [Required]
    public Guid StudyTypeId { get; set; }

    [Required]
    public Guid StageId { get; set; }

    [Required]
    public IFormFile File { get; set; } = null!;
}

public class UpdateGradeDto
{
    [Required]
    [MaxLength(200)]
    public string SubjectName { get; set; } = string.Empty;

    [Required]
    public Guid BranchId { get; set; }

    [Required]
    public Guid StudyTypeId { get; set; }

    [Required]
    public Guid StageId { get; set; }

    public IFormFile? File { get; set; }
}

public class GradeFilterDto
{
    public Guid? BranchId { get; set; }
    public Guid? StudyTypeId { get; set; }
    public Guid? StageId { get; set; }
}
