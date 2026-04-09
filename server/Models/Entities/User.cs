using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CollegeAPI.Models.Entities;

public class User
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string DisplayId { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string ProfileName { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string UserType { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Role { get; set; } = "Regular";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Student? Student { get; set; }
    public Faculty? Faculty { get; set; }
}
