using System.ComponentModel.DataAnnotations;

namespace CollegeAPI.Models.DTOs;

public class ActivityDto
{
    public Guid Id { get; set; }
    public string TitleEn { get; set; } = string.Empty;
    public string TitleAr { get; set; } = string.Empty;
    public string ContentEn { get; set; } = string.Empty;
    public string ContentAr { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public Guid CreatedBy { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateActivityDto
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

    [Required]
    public DateTime Date { get; set; }
}

public class UpdateActivityDto
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

    [Required]
    public DateTime Date { get; set; }
}
