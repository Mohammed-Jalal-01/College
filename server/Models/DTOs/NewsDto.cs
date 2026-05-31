using System.ComponentModel.DataAnnotations;

namespace CollegeAPI.Models.DTOs;

public class NewsDto
{
    public Guid Id { get; set; }
    public string TitleEn { get; set; } = string.Empty;
    public string TitleAr { get; set; } = string.Empty;
    public string ContentEn { get; set; } = string.Empty;
    public string ContentAr { get; set; } = string.Empty;
    public bool IsFeatured { get; set; }
    public string? ImageUrl { get; set; }
    public Guid CreatedBy { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateNewsDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    public bool IsFeatured { get; set; } = true;

    public IFormFile? Image { get; set; }
}

public class UpdateNewsDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    public bool IsFeatured { get; set; } = true;

    public IFormFile? Image { get; set; }
}
