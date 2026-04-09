using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CollegeAPI.Data;
using CollegeAPI.Models.DTOs;

namespace CollegeAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdminOnly")]
public class UserManagementController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UserManagementController> _logger;

    public UserManagementController(ApplicationDbContext context, ILogger<UserManagementController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        try
        {
            var users = await _context.Users
                .Include(u => u.Student)
                    .ThenInclude(s => s!.Branch)
                .Include(u => u.Student)
                    .ThenInclude(s => s!.StudyType)
                .Include(u => u.Student)
                    .ThenInclude(s => s!.Stage)
                .Include(u => u.Faculty)
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new UserListDto
                {
                    Id = u.Id,
                    DisplayId = u.DisplayId,
                    ProfileName = u.ProfileName,
                    Email = u.Email,
                    UserType = u.UserType,
                    Role = u.Role,
                    CreatedAt = u.CreatedAt,
                    StudentInfo = u.Student != null ? new UserStudentInfoDto
                    {
                        Gender = u.Student.Gender,
                        BranchNameEn = u.Student.Branch.NameEn,
                        BranchNameAr = u.Student.Branch.NameAr,
                        StudyTypeNameEn = u.Student.StudyType.NameEn,
                        StudyTypeNameAr = u.Student.StudyType.NameAr,
                        StageNameEn = u.Student.Stage.NameEn,
                        StageNameAr = u.Student.Stage.NameAr,
                        StageNumber = u.Student.Stage.StageNumber
                    } : null,
                    FacultyInfo = u.Faculty != null ? new UserFacultyInfoDto
                    {
                        Department = u.Faculty.Department,
                        Position = u.Faculty.Position
                    } : null
                })
                .ToListAsync();

            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users");
            return StatusCode(500, new { message = "An error occurred while retrieving users" });
        }
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetUserStats()
    {
        try
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalStudents = await _context.Users.CountAsync(u => u.UserType == "Student");
            var totalFaculty = await _context.Users.CountAsync(u => u.UserType == "Faculty");
            var totalAdmins = await _context.Users.CountAsync(u => u.Role == "Admin");
            var totalSuperAdmins = await _context.Users.CountAsync(u => u.Role == "SuperAdmin");

            var stats = new UserStatsDto
            {
                TotalUsers = totalUsers,
                TotalStudents = totalStudents,
                TotalFaculty = totalFaculty,
                TotalAdmins = totalAdmins,
                TotalSuperAdmins = totalSuperAdmins
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user stats");
            return StatusCode(500, new { message = "An error occurred while retrieving user stats" });
        }
    }

    [HttpPost("promote-to-admin")]
    public async Task<IActionResult> PromoteToAdmin([FromBody] PromoteToAdminDto dto)
    {
        try
        {
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (user.UserType != "Faculty")
            {
                return BadRequest(new { message = "Only faculty members can be promoted to admin" });
            }

            if (user.Role == "Admin" || user.Role == "SuperAdmin")
            {
                return BadRequest(new { message = "User is already an admin or super admin" });
            }

            user.Role = "Admin";
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var superAdminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation("User {UserId} promoted to Admin by SuperAdmin {SuperAdminId}", dto.UserId, superAdminId);

            return Ok(new { message = "User promoted to admin successfully", userId = user.Id, role = user.Role });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error promoting user to admin");
            return StatusCode(500, new { message = "An error occurred while promoting user" });
        }
    }

    [HttpPost("demote-to-regular")]
    public async Task<IActionResult> DemoteToRegular([FromBody] DemoteToRegularDto dto)
    {
        try
        {
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (user.Role == "SuperAdmin")
            {
                return BadRequest(new { message = "Cannot demote a super admin. Transfer super admin role first." });
            }

            if (user.Role == "Regular")
            {
                return BadRequest(new { message = "User is already a regular user" });
            }

            user.Role = "Regular";
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var superAdminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation("User {UserId} demoted to Regular by SuperAdmin {SuperAdminId}", dto.UserId, superAdminId);

            return Ok(new { message = "User demoted to regular successfully", userId = user.Id, role = user.Role });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error demoting user to regular");
            return StatusCode(500, new { message = "An error occurred while demoting user" });
        }
    }

    [HttpPost("transfer-superadmin")]
    public async Task<IActionResult> TransferSuperAdmin([FromBody] TransferSuperAdminDto dto)
    {
        try
        {
            var currentSuperAdminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentSuperAdminId) || !Guid.TryParse(currentSuperAdminId, out var currentSuperAdminGuid))
            {
                return Unauthorized(new { message = "Invalid super admin token" });
            }

            var currentSuperAdmin = await _context.Users.FindAsync(currentSuperAdminGuid);
            if (currentSuperAdmin == null)
            {
                return NotFound(new { message = "Current super admin not found" });
            }

            var newSuperAdmin = await _context.Users.FindAsync(dto.NewSuperAdminId);
            if (newSuperAdmin == null)
            {
                return NotFound(new { message = "New super admin user not found" });
            }

            if (newSuperAdmin.UserType != "Faculty")
            {
                return BadRequest(new { message = "Only faculty members can be super admin" });
            }

            if (newSuperAdmin.Id == currentSuperAdminGuid)
            {
                return BadRequest(new { message = "You are already the super admin" });
            }

            currentSuperAdmin.Role = "Admin";
            currentSuperAdmin.UpdatedAt = DateTime.UtcNow;

            newSuperAdmin.Role = "SuperAdmin";
            newSuperAdmin.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "SuperAdmin role transferred from {OldSuperAdminId} to {NewSuperAdminId}", 
                currentSuperAdminGuid, 
                dto.NewSuperAdminId
            );

            return Ok(new 
            { 
                message = "Super admin role transferred successfully", 
                oldSuperAdminId = currentSuperAdminGuid,
                newSuperAdminId = dto.NewSuperAdminId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error transferring super admin role");
            return StatusCode(500, new { message = "An error occurred while transferring super admin role" });
        }
    }

    [HttpGet("faculty-users")]
    public async Task<IActionResult> GetFacultyUsers()
    {
        try
        {
            var facultyUsers = await _context.Users
                .Where(u => u.UserType == "Faculty")
                .OrderBy(u => u.ProfileName)
                .Select(u => new
                {
                    u.Id,
                    u.DisplayId,
                    u.ProfileName,
                    u.Email,
                    u.Role
                })
                .ToListAsync();

            return Ok(facultyUsers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving faculty users");
            return StatusCode(500, new { message = "An error occurred while retrieving faculty users" });
        }
    }
}
