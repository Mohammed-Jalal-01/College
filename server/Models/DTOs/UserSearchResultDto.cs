namespace CollegeAPI.Models.DTOs;

public class UserSearchResultDto
{
    public Guid Id { get; set; }
    public string DisplayId { get; set; } = string.Empty;
    public string ProfileName { get; set; } = string.Empty;
    public string UserType { get; set; } = string.Empty;
    public StudentProfileDto? StudentInfo { get; set; }
}

public class StudentProfileDto
{
    public string Gender { get; set; } = string.Empty;
    public Guid BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public Guid StudyTypeId { get; set; }
    public string StudyTypeName { get; set; } = string.Empty;
    public Guid StageId { get; set; }
    public string StageName { get; set; } = string.Empty;
}
