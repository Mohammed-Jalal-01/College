using System.ComponentModel.DataAnnotations;

namespace CollegeAPI.Models.Entities;

public class StudyType
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string NameEn { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string NameAr { get; set; } = string.Empty;

    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<LectureSchedule> LectureSchedules { get; set; } = new List<LectureSchedule>();
    public ICollection<CourseMaterial> CourseMaterials { get; set; } = new List<CourseMaterial>();
}
