using System.ComponentModel.DataAnnotations;

namespace CollegeAPI.Models.DTOs;

public class CourseMaterialDto
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
    public string Course { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string TitleAr { get; set; } = string.Empty;
    public string? DescriptionEn { get; set; }
    public string? DescriptionAr { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public Guid UploadedBy { get; set; }
    public string UploadedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateCourseMaterialDto
{
    [Required]
    public Guid BranchId { get; set; }

    [Required]
    public Guid StudyTypeId { get; set; }

    [Required]
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
    public IFormFile File { get; set; } = null!;
}

public class UpdateCourseMaterialDto
{
    [Required]
    public Guid BranchId { get; set; }

    [Required]
    public Guid StudyTypeId { get; set; }

    [Required]
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

    public IFormFile? File { get; set; }
}

public class CourseMaterialFilterDto
{
    public Guid? BranchId { get; set; }
    public Guid? StudyTypeId { get; set; }
    public Guid? StageId { get; set; }
    public string? Course { get; set; }
}
