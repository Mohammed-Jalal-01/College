using System.ComponentModel.DataAnnotations;

namespace CollegeAPI.Models.DTOs;

public class StudentInfoDto
{
    [Required]
    public string Gender { get; set; } = string.Empty;

    [Required]
    public Guid BranchId { get; set; }

    [Required]
    public Guid StudyTypeId { get; set; }

    [Required]
    public Guid StageId { get; set; }
}
