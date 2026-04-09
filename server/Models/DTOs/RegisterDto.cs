using System.ComponentModel.DataAnnotations;

namespace CollegeAPI.Models.DTOs;

public class RegisterDto
{
    [Required]
    [MaxLength(100)]
    public string ProfileName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [Compare("Password")]
    public string ConfirmPassword { get; set; } = string.Empty;

    [Required]
    public string UserType { get; set; } = string.Empty;
}
