using System.ComponentModel.DataAnnotations;

namespace CollegeAPI.Models.DTOs;

public class AboutCollegeDto
{
    public Guid Id { get; set; }
    public string ContentEn { get; set; } = string.Empty;
    public string ContentAr { get; set; } = string.Empty;
    public Guid UpdatedBy { get; set; }
    public string UpdatedByName { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
}

public class UpdateAboutCollegeDto
{
    [Required]
    public string ContentEn { get; set; } = string.Empty;

    [Required]
    public string ContentAr { get; set; } = string.Empty;
}
