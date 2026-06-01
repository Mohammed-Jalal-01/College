using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CollegeAPI.Data;
using CollegeAPI.Models.DTOs;

namespace CollegeAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
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
    [Authorize(Policy = "SuperAdminOnly")]
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
    [Authorize(Policy = "AdminOnly")]
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
    [Authorize(Policy = "SuperAdminOnly")]
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
    [Authorize(Policy = "SuperAdminOnly")]
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
    [Authorize(Policy = "SuperAdminOnly")]
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

    [HttpGet("dashboard-stats")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetDashboardStats()
    {
        try
        {
            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);

            var roleDistribution = await _context.Users
                .GroupBy(u => u.Role)
                .Select(g => new ChartDataItem { Name = g.Key, Value = g.Count() })
                .ToListAsync();

            var userTypeDistribution = await _context.Users
                .GroupBy(u => u.UserType)
                .Select(g => new ChartDataItem { Name = g.Key, Value = g.Count() })
                .ToListAsync();

            var studentsByGender = await _context.Students
                .GroupBy(s => s.Gender)
                .Select(g => new ChartDataItem { Name = g.Key, Value = g.Count() })
                .ToListAsync();

            var studentsByStudyType = await (
                from s in _context.Students
                join st in _context.StudyTypes on s.StudyTypeId equals st.Id
                group s by new { st.NameEn, st.NameAr } into g
                select new ChartDataItem
                {
                    Name = g.Key.NameEn,
                    NameAr = g.Key.NameAr,
                    Value = g.Count()
                }).ToListAsync();

            var contentDistribution = new List<ChartDataItem>
            {
                new() { Name = "News", Value = await _context.News.CountAsync() },
                new() { Name = "Activities", Value = await _context.Activities.CountAsync() },
                new() { Name = "Materials", Value = await _context.CourseMaterials.CountAsync() },
                new() { Name = "Grades", Value = await _context.Grades.CountAsync() }
            };

            var studentsPerBranch = await (
                from s in _context.Students
                join b in _context.Branches on s.BranchId equals b.Id
                group s by new { b.NameEn, b.NameAr } into g
                select new ChartDataItem
                {
                    Name = g.Key.NameEn,
                    NameAr = g.Key.NameAr,
                    Value = g.Count()
                }).ToListAsync();

            var studentsPerStage = await (
                from s in _context.Students
                join st in _context.Stages on s.StageId equals st.Id
                group s by new { st.NameEn, st.NameAr, st.StageNumber } into g
                orderby g.Key.StageNumber
                select new ChartDataItem
                {
                    Name = g.Key.NameEn,
                    NameAr = g.Key.NameAr,
                    Value = g.Count()
                }).ToListAsync();

            var materialsPerBranch = await (
                from m in _context.CourseMaterials
                join b in _context.Branches on m.BranchId equals b.Id
                group m by new { b.NameEn, b.NameAr } into g
                select new ChartDataItem
                {
                    Name = g.Key.NameEn,
                    NameAr = g.Key.NameAr,
                    Value = g.Count()
                }).ToListAsync();

            var schedulesPerDay = await _context.LectureSchedules
                .GroupBy(s => s.Day)
                .Select(g => new ChartDataItem { Name = g.Key, Value = g.Count() })
                .ToListAsync();

            var monthlyRegistrations = await _context.Users
                .Where(u => u.CreatedAt >= sixMonthsAgo)
                .GroupBy(u => new { u.CreatedAt.Year, u.CreatedAt.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Select(g => new ChartDataItem
                {
                    Name = $"{g.Key.Year}-{g.Key.Month:D2}",
                    Value = g.Count()
                })
                .ToListAsync();

            var newsPerMonth = await _context.News
                .Where(n => n.CreatedAt >= sixMonthsAgo)
                .GroupBy(n => new { n.CreatedAt.Year, n.CreatedAt.Month })
                .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
                .ToListAsync();

            var activitiesPerMonth = await _context.Activities
                .Where(a => a.CreatedAt >= sixMonthsAgo)
                .GroupBy(a => new { a.CreatedAt.Year, a.CreatedAt.Month })
                .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
                .ToListAsync();

            var allMonths = newsPerMonth.Select(x => (x.Year, x.Month))
                .Union(activitiesPerMonth.Select(x => (x.Year, x.Month)))
                .Distinct()
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToList();

            var contentPerMonth = allMonths.Select(m => new ChartDataItem
            {
                Name = $"{m.Year}-{m.Month:D2}",
                Value = (newsPerMonth.FirstOrDefault(n => n.Year == m.Year && n.Month == m.Month)?.Count ?? 0)
                    + (activitiesPerMonth.FirstOrDefault(a => a.Year == m.Year && a.Month == m.Month)?.Count ?? 0)
            }).ToList();

            var result = new DashboardStatsDto
            {
                RoleDistribution = roleDistribution,
                UserTypeDistribution = userTypeDistribution,
                StudentsByGender = studentsByGender,
                StudentsByStudyType = studentsByStudyType,
                ContentDistribution = contentDistribution,
                StudentsPerBranch = studentsPerBranch,
                StudentsPerStage = studentsPerStage,
                MaterialsPerBranch = materialsPerBranch,
                SchedulesPerDay = schedulesPerDay,
                MonthlyRegistrations = monthlyRegistrations,
                ContentPerMonth = contentPerMonth
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving dashboard stats");
            return StatusCode(500, new { message = "An error occurred while retrieving dashboard statistics" });
        }
    }

    [HttpGet("faculty-users")]
    [Authorize(Policy = "SuperAdminOnly")]
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
