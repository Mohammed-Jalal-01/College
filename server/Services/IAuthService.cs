using CollegeAPI.Models.DTOs;

namespace CollegeAPI.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    Task<bool> AddStudentInfoAsync(Guid userId, StudentInfoDto studentInfoDto);
    Task<bool> DeleteAccountAsync(Guid userId);
}
