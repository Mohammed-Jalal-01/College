using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CollegeAPI.Models.Entities;

public class AuditLog
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [ForeignKey("User")]
    public Guid UserId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Action { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string EntityType { get; set; } = string.Empty;

    public Guid? EntityId { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public string? Details { get; set; }

    public User User { get; set; } = null!;
}
