namespace CollegeAPI.Models.DTOs;

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ProfileName { get; set; } = string.Empty;
    public string DisplayId { get; set; } = string.Empty;
    public string UserType { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public bool RequiresStudentInfo { get; set; } = false;
}
