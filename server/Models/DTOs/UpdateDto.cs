using System.ComponentModel.DataAnnotations;

namespace CollegeAPI.Models.DTOs;

public class UpdateDto
{
    public Guid Id { get; set; }
    public string TitleEn { get; set; } = string.Empty;
    public string TitleAr { get; set; } = string.Empty;
    public string ContentEn { get; set; } = string.Empty;
    public string ContentAr { get; set; } = string.Empty;
    public Guid CreatedBy { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateUpdateDto
{
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
}

public class UpdateUpdateDto
{
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
}
