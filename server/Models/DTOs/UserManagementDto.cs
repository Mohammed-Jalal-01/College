using System.ComponentModel.DataAnnotations;

namespace CollegeAPI.Models.DTOs;

public class UserListDto
{
    public Guid Id { get; set; }
    public string DisplayId { get; set; } = string.Empty;
    public string ProfileName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string UserType { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public UserStudentInfoDto? StudentInfo { get; set; }
    public UserFacultyInfoDto? FacultyInfo { get; set; }
}

public class UserStudentInfoDto
{
    public string Gender { get; set; } = string.Empty;
    public string BranchNameEn { get; set; } = string.Empty;
    public string BranchNameAr { get; set; } = string.Empty;
    public string StudyTypeNameEn { get; set; } = string.Empty;
    public string StudyTypeNameAr { get; set; } = string.Empty;
    public string StageNameEn { get; set; } = string.Empty;
    public string StageNameAr { get; set; } = string.Empty;
    public int StageNumber { get; set; }
}

public class UserFacultyInfoDto
{
    public string? Department { get; set; }
    public string? Position { get; set; }
}

public class PromoteToAdminDto
{
    [Required]
    public Guid UserId { get; set; }
}

public class DemoteToRegularDto
{
    [Required]
    public Guid UserId { get; set; }
}

public class TransferSuperAdminDto
{
    [Required]
    public Guid NewSuperAdminId { get; set; }
}

public class UserStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalStudents { get; set; }
    public int TotalFaculty { get; set; }
    public int TotalAdmins { get; set; }
    public int TotalSuperAdmins { get; set; }
}
