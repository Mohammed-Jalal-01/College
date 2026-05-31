using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CollegeAPI.Data;
using CollegeAPI.Models.DTOs;
using CollegeAPI.Models.Entities;
using CollegeAPI.Services;

namespace CollegeAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ActivitiesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;
    private readonly ILogger<ActivitiesController> _logger;

    public ActivitiesController(ApplicationDbContext context, IFileStorageService fileStorageService, ILogger<ActivitiesController> logger)
    {
        _context = context;
        _fileStorageService = fileStorageService;
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
                    ImageUrl = a.ImageUrl,
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
                    ImageUrl = a.ImageUrl,
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
    public async Task<IActionResult> Create([FromForm] CreateActivityDto createActivityDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user token" });
            }

            string? imageUrl = null;
            if (createActivityDto.Image != null && createActivityDto.Image.Length > 0)
            {
                imageUrl = await _fileStorageService.SaveFileAsync(createActivityDto.Image, "images");
            }

            var activity = new Activity
            {
                Id = Guid.NewGuid(),
                TitleEn = createActivityDto.Title,
                TitleAr = createActivityDto.Title,
                ContentEn = createActivityDto.Content,
                ContentAr = createActivityDto.Content,
                Date = createActivityDto.Date == default ? DateTime.UtcNow : DateTime.SpecifyKind(createActivityDto.Date, DateTimeKind.Utc),
                ImageUrl = imageUrl,
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
                    ImageUrl = a.ImageUrl,
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
    public async Task<IActionResult> Update(Guid id, [FromForm] UpdateActivityDto updateActivityDto)
    {
        try
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null)
            {
                return NotFound(new { message = "Activity not found" });
            }

            if (updateActivityDto.Image != null && updateActivityDto.Image.Length > 0)
            {
                if (!string.IsNullOrEmpty(activity.ImageUrl))
                {
                    await _fileStorageService.DeleteFileAsync(activity.ImageUrl);
                }
                activity.ImageUrl = await _fileStorageService.SaveFileAsync(updateActivityDto.Image, "images");
            }

            activity.TitleEn = updateActivityDto.Title;
            activity.TitleAr = updateActivityDto.Title;
            activity.ContentEn = updateActivityDto.Content;
            activity.ContentAr = updateActivityDto.Content;
            activity.Date = updateActivityDto.Date == default ? activity.Date : DateTime.SpecifyKind(updateActivityDto.Date, DateTimeKind.Utc);
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
                    ImageUrl = a.ImageUrl,
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

            if (!string.IsNullOrEmpty(activity.ImageUrl))
            {
                await _fileStorageService.DeleteFileAsync(activity.ImageUrl);
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
