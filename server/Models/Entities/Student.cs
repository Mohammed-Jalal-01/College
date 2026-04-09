using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CollegeAPI.Models.Entities;

public class Student
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [ForeignKey("User")]
    public Guid UserId { get; set; }

    [Required]
    [MaxLength(20)]
    public string Gender { get; set; } = string.Empty;

    [Required]
    [ForeignKey("Branch")]
    public Guid BranchId { get; set; }

    [Required]
    [ForeignKey("StudyType")]
    public Guid StudyTypeId { get; set; }

    [Required]
    [ForeignKey("Stage")]
    public Guid StageId { get; set; }

    public User User { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public StudyType StudyType { get; set; } = null!;
    public Stage Stage { get; set; } = null!;
}
