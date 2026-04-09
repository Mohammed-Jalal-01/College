using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CollegeAPI.Data;
using CollegeAPI.Models.DTOs;
using CollegeAPI.Models.Entities;

namespace CollegeAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AboutCollegeController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AboutCollegeController> _logger;

    public AboutCollegeController(ApplicationDbContext context, ILogger<AboutCollegeController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try
        {
            var aboutCollege = await _context.AboutCollege
                .Include(a => a.UpdatedByUser)
                .OrderByDescending(a => a.UpdatedAt)
                .Select(a => new AboutCollegeDto
                {
                    Id = a.Id,
                    ContentEn = a.ContentEn,
                    ContentAr = a.ContentAr,
                    UpdatedBy = a.UpdatedBy,
                    UpdatedByName = a.UpdatedByUser.ProfileName,
                    UpdatedAt = a.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (aboutCollege == null)
            {
                return Ok(new AboutCollegeDto
                {
                    ContentEn = "",
                    ContentAr = "",
                    UpdatedByName = "",
                    UpdatedAt = DateTime.UtcNow
                });
            }

            return Ok(aboutCollege);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving about college information");
            return StatusCode(500, new { message = "An error occurred while retrieving about college information" });
        }
    }

    [HttpPut]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update([FromBody] UpdateAboutCollegeDto updateAboutCollegeDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user token" });
            }

            var aboutCollege = await _context.AboutCollege.FirstOrDefaultAsync();

            if (aboutCollege == null)
            {
                aboutCollege = new AboutCollege
                {
                    Id = Guid.NewGuid(),
                    ContentEn = updateAboutCollegeDto.ContentEn,
                    ContentAr = updateAboutCollegeDto.ContentAr,
                    UpdatedBy = userId,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.AboutCollege.Add(aboutCollege);
            }
            else
            {
                aboutCollege.ContentEn = updateAboutCollegeDto.ContentEn;
                aboutCollege.ContentAr = updateAboutCollegeDto.ContentAr;
                aboutCollege.UpdatedBy = userId;
                aboutCollege.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("About college information updated by user: {UserId}", userId);

            var aboutCollegeDto = await _context.AboutCollege
                .Include(a => a.UpdatedByUser)
                .Where(a => a.Id == aboutCollege.Id)
                .Select(a => new AboutCollegeDto
                {
                    Id = a.Id,
                    ContentEn = a.ContentEn,
                    ContentAr = a.ContentAr,
                    UpdatedBy = a.UpdatedBy,
                    UpdatedByName = a.UpdatedByUser.ProfileName,
                    UpdatedAt = a.UpdatedAt
                })
                .FirstOrDefaultAsync();

            return Ok(aboutCollegeDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating about college information");
            return StatusCode(500, new { message = "An error occurred while updating about college information" });
        }
    }
}
