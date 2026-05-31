using System.ComponentModel.DataAnnotations;

namespace CollegeAPI.Models.DTOs;

public class AboutCollegeDto
{
    public Guid Id { get; set; }
    public string ContentEn { get; set; } = string.Empty;
    public string ContentAr { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public Guid UpdatedBy { get; set; }
    public string UpdatedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateAboutCollegeDto
{
    [Required]
    public string Content { get; set; } = string.Empty;

    public IFormFile? Image { get; set; }
}

public class UpdateAboutCollegeDto
{
    [Required]
    public string Content { get; set; } = string.Empty;

    public IFormFile? Image { get; set; }
}
