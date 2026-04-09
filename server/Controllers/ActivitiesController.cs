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
public class ActivitiesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ActivitiesController> _logger;

    public ActivitiesController(ApplicationDbContext context, ILogger<ActivitiesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var activities = await _context.Activities
                .Include(a => a.CreatedByUser)
                .OrderByDescending(a => a.Date)
                .Select(a => new ActivityDto
                {
                    Id = a.Id,
                    TitleEn = a.TitleEn,
                    TitleAr = a.TitleAr,
                    ContentEn = a.ContentEn,
                    ContentAr = a.ContentAr,
                    Date = a.Date,
                    CreatedBy = a.CreatedBy,
                    CreatedByName = a.CreatedByUser.ProfileName,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                })
                .ToListAsync();

            return Ok(activities);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving activities");
            return StatusCode(500, new { message = "An error occurred while retrieving activities" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var activity = await _context.Activities
                .Include(a => a.CreatedByUser)
                .Where(a => a.Id == id)
                .Select(a => new ActivityDto
                {
                    Id = a.Id,
                    TitleEn = a.TitleEn,
                    TitleAr = a.TitleAr,
                    ContentEn = a.ContentEn,
                    ContentAr = a.ContentAr,
                    Date = a.Date,
                    CreatedBy = a.CreatedBy,
                    CreatedByName = a.CreatedByUser.ProfileName,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (activity == null)
            {
                return NotFound(new { message = "Activity not found" });
            }

            return Ok(activity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving activity with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving activity" });
        }
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] CreateActivityDto createActivityDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user token" });
            }

            var activity = new Activity
            {
                Id = Guid.NewGuid(),
                TitleEn = createActivityDto.TitleEn,
                TitleAr = createActivityDto.TitleAr,
                ContentEn = createActivityDto.ContentEn,
                ContentAr = createActivityDto.ContentAr,
                Date = createActivityDto.Date,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Activities.Add(activity);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Activity created with ID: {Id} by user: {UserId}", activity.Id, userId);

            var activityDto = await _context.Activities
                .Include(a => a.CreatedByUser)
                .Where(a => a.Id == activity.Id)
                .Select(a => new ActivityDto
                {
                    Id = a.Id,
                    TitleEn = a.TitleEn,
                    TitleAr = a.TitleAr,
                    ContentEn = a.ContentEn,
                    ContentAr = a.ContentAr,
                    Date = a.Date,
                    CreatedBy = a.CreatedBy,
                    CreatedByName = a.CreatedByUser.ProfileName,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction(nameof(GetById), new { id = activity.Id }, activityDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating activity");
            return StatusCode(500, new { message = "An error occurred while creating activity" });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateActivityDto updateActivityDto)
    {
        try
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null)
            {
                return NotFound(new { message = "Activity not found" });
            }

            activity.TitleEn = updateActivityDto.TitleEn;
            activity.TitleAr = updateActivityDto.TitleAr;
            activity.ContentEn = updateActivityDto.ContentEn;
            activity.ContentAr = updateActivityDto.ContentAr;
            activity.Date = updateActivityDto.Date;
            activity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation("Activity updated with ID: {Id} by user: {UserId}", id, userIdClaim);

            var activityDto = await _context.Activities
                .Include(a => a.CreatedByUser)
                .Where(a => a.Id == id)
                .Select(a => new ActivityDto
                {
                    Id = a.Id,
                    TitleEn = a.TitleEn,
                    TitleAr = a.TitleAr,
                    ContentEn = a.ContentEn,
                    ContentAr = a.ContentAr,
                    Date = a.Date,
                    CreatedBy = a.CreatedBy,
                    CreatedByName = a.CreatedByUser.ProfileName,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                })
                .FirstOrDefaultAsync();

            return Ok(activityDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating activity with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while updating activity" });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null)
            {
                return NotFound(new { message = "Activity not found" });
            }

            _context.Activities.Remove(activity);
            await _context.SaveChangesAsync();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation("Activity deleted with ID: {Id} by user: {UserId}", id, userIdClaim);

            return Ok(new { message = "Activity deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting activity with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while deleting activity" });
        }
    }
}
