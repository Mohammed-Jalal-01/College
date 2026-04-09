using CollegeAPI.Models.DTOs;
using CollegeAPI.Models.Entities;
using CollegeAPI.Repositories;
using CollegeAPI.Validators;

namespace CollegeAPI.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;
    private readonly IDisplayIdGenerator _displayIdGenerator;
    private readonly ILoginAttemptService _loginAttemptService;

    public AuthService(IUserRepository userRepository, ITokenService tokenService, IDisplayIdGenerator displayIdGenerator, ILoginAttemptService loginAttemptService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
        _displayIdGenerator = displayIdGenerator;
        _loginAttemptService = loginAttemptService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
    {
        var existingUser = await _userRepository.GetByEmailAsync(registerDto.Email);
        if (existingUser != null)
        {
            throw new InvalidOperationException("Email already exists");
        }

        if (registerDto.UserType != "Student" && registerDto.UserType != "Faculty")
        {
            throw new InvalidOperationException("Invalid user type");
        }

        var passwordValidation = PasswordValidator.ValidatePassword(registerDto.Password);
        if (!passwordValidation.IsValid)
        {
            throw new InvalidOperationException($"Password validation failed: {string.Join(", ", passwordValidation.Errors)}");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);
        var displayId = await _displayIdGenerator.GenerateUniqueDisplayIdAsync();

        var user = new User
        {
            Id = Guid.NewGuid(),
            DisplayId = displayId,
            ProfileName = registerDto.ProfileName,
            Email = registerDto.Email,
            PasswordHash = passwordHash,
            UserType = registerDto.UserType,
            Role = "Regular",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _userRepository.CreateAsync(user);

        if (registerDto.UserType == "Faculty")
        {
            var faculty = new Faculty
            {
                Id = Guid.NewGuid(),
                UserId = user.Id
            };
            await _userRepository.CreateFacultyAsync(faculty);
        }

        var token = _tokenService.GenerateToken(user);

        return new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            ProfileName = user.ProfileName,
            DisplayId = user.DisplayId,
            UserType = user.UserType,
            Role = user.Role,
            UserId = user.Id,
            RequiresStudentInfo = registerDto.UserType == "Student"
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
        if (await _loginAttemptService.IsAccountLockedAsync(loginDto.Email))
        {
            throw new UnauthorizedAccessException("Account is locked due to too many failed login attempts. Please try again in 30 minutes.");
        }

        var user = await _userRepository.GetByEmailAsync(loginDto.Email);
        if (user == null)
        {
            await _loginAttemptService.RecordFailedLoginAttemptAsync(loginDto.Email);
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            await _loginAttemptService.RecordFailedLoginAttemptAsync(loginDto.Email);
            var attempts = await _loginAttemptService.GetFailedLoginAttemptsAsync(loginDto.Email);
            var remainingAttempts = 5 - attempts;
            
            if (remainingAttempts > 0)
            {
                throw new UnauthorizedAccessException($"Invalid email or password. {remainingAttempts} attempts remaining before account lockout.");
            }
            
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        await _loginAttemptService.ResetFailedLoginAttemptsAsync(loginDto.Email);

        var token = _tokenService.GenerateToken(user);

        var requiresStudentInfo = false;
        if (user.UserType == "Student")
        {
            var student = await _userRepository.GetStudentByUserIdAsync(user.Id);
            requiresStudentInfo = student == null;
        }

        return new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            ProfileName = user.ProfileName,
            DisplayId = user.DisplayId,
            UserType = user.UserType,
            Role = user.Role,
            UserId = user.Id,
            RequiresStudentInfo = requiresStudentInfo
        };
    }

    public async Task<bool> AddStudentInfoAsync(Guid userId, StudentInfoDto studentInfoDto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null || user.UserType != "Student")
        {
            throw new InvalidOperationException("User not found or not a student");
        }

        var existingStudent = await _userRepository.GetStudentByUserIdAsync(userId);
        if (existingStudent != null)
        {
            throw new InvalidOperationException("Student info already exists");
        }

        var student = new Student
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Gender = studentInfoDto.Gender,
            BranchId = studentInfoDto.BranchId,
            StudyTypeId = studentInfoDto.StudyTypeId,
            StageId = studentInfoDto.StageId
        };

        await _userRepository.CreateStudentAsync(student);
        return true;
    }

    public async Task<bool> DeleteAccountAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        await _userRepository.DeleteAsync(userId);
        return true;
    }
}
