using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CollegeAPI.Data;
using CollegeAPI.Models.DTOs;

namespace CollegeAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UsersController> _logger;

    public UsersController(ApplicationDbContext context, ILogger<UsersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("search/{displayId}")]
    public async Task<IActionResult> SearchByDisplayId(string displayId)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.Student)
                    .ThenInclude(s => s.Branch)
                .Include(u => u.Student)
                    .ThenInclude(s => s.StudyType)
                .Include(u => u.Student)
                    .ThenInclude(s => s.Stage)
                .FirstOrDefaultAsync(u => u.DisplayId == displayId);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var result = new UserSearchResultDto
            {
                Id = user.Id,
                DisplayId = user.DisplayId,
                ProfileName = user.ProfileName,
                UserType = user.UserType,
                StudentInfo = user.Student != null ? new StudentProfileDto
                {
                    Gender = user.Student.Gender,
                    BranchId = user.Student.BranchId,
                    BranchName = user.Student.Branch?.NameEn ?? "",
                    StudyTypeId = user.Student.StudyTypeId,
                    StudyTypeName = user.Student.StudyType?.NameEn ?? "",
                    StageId = user.Student.StageId,
                    StageName = user.Student.Stage?.NameEn ?? ""
                } : null
            };

            _logger.LogInformation("User search successful for DisplayId: {DisplayId}", displayId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching for user with DisplayId: {DisplayId}", displayId);
            return StatusCode(500, new { message = "An error occurred while searching for user" });
        }
    }

    [HttpGet("profile/{displayId}")]
    public async Task<IActionResult> GetProfile(string displayId)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.Student)
                    .ThenInclude(s => s.Branch)
                .Include(u => u.Student)
                    .ThenInclude(s => s.StudyType)
                .Include(u => u.Student)
                    .ThenInclude(s => s.Stage)
                .FirstOrDefaultAsync(u => u.DisplayId == displayId);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var result = new UserSearchResultDto
            {
                Id = user.Id,
                DisplayId = user.DisplayId,
                ProfileName = user.ProfileName,
                UserType = user.UserType,
                StudentInfo = user.Student != null ? new StudentProfileDto
                {
                    Gender = user.Student.Gender,
                    BranchId = user.Student.BranchId,
                    BranchName = user.Student.Branch?.NameEn ?? "",
                    StudyTypeId = user.Student.StudyTypeId,
                    StudyTypeName = user.Student.StudyType?.NameEn ?? "",
                    StageId = user.Student.StageId,
                    StageName = user.Student.Stage?.NameEn ?? ""
                } : null
            };

            _logger.LogInformation("Profile retrieved for DisplayId: {DisplayId}", displayId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving profile for DisplayId: {DisplayId}", displayId);
            return StatusCode(500, new { message = "An error occurred while retrieving profile" });
        }
    }
}
