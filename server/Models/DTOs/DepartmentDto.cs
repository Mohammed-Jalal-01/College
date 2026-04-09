using System.ComponentModel.DataAnnotations;

namespace CollegeAPI.Models.DTOs;

public class DepartmentDto
{
    public Guid Id { get; set; }
    public string NameEn { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public string DescriptionAr { get; set; } = string.Empty;
    public Guid CreatedBy { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateDepartmentDto
{
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
}

public class UpdateDepartmentDto
{
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
}
