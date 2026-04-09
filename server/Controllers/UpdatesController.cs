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
public class UpdatesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UpdatesController> _logger;

    public UpdatesController(ApplicationDbContext context, ILogger<UpdatesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var updates = await _context.Updates
                .Include(u => u.CreatedByUser)
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new UpdateDto
                {
                    Id = u.Id,
                    TitleEn = u.TitleEn,
                    TitleAr = u.TitleAr,
                    ContentEn = u.ContentEn,
                    ContentAr = u.ContentAr,
                    CreatedBy = u.CreatedBy,
                    CreatedByName = u.CreatedByUser.ProfileName,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt
                })
                .ToListAsync();

            return Ok(updates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving updates");
            return StatusCode(500, new { message = "An error occurred while retrieving updates" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var update = await _context.Updates
                .Include(u => u.CreatedByUser)
                .Where(u => u.Id == id)
                .Select(u => new UpdateDto
                {
                    Id = u.Id,
                    TitleEn = u.TitleEn,
                    TitleAr = u.TitleAr,
                    ContentEn = u.ContentEn,
                    ContentAr = u.ContentAr,
                    CreatedBy = u.CreatedBy,
                    CreatedByName = u.CreatedByUser.ProfileName,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (update == null)
            {
                return NotFound(new { message = "Update not found" });
            }

            return Ok(update);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving update with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving update" });
        }
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] CreateUpdateDto createUpdateDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user token" });
            }

            var update = new Update
            {
                Id = Guid.NewGuid(),
                TitleEn = createUpdateDto.TitleEn,
                TitleAr = createUpdateDto.TitleAr,
                ContentEn = createUpdateDto.ContentEn,
                ContentAr = createUpdateDto.ContentAr,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Updates.Add(update);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Update created with ID: {Id} by user: {UserId}", update.Id, userId);

            var updateDto = await _context.Updates
                .Include(u => u.CreatedByUser)
                .Where(u => u.Id == update.Id)
                .Select(u => new UpdateDto
                {
                    Id = u.Id,
                    TitleEn = u.TitleEn,
                    TitleAr = u.TitleAr,
                    ContentEn = u.ContentEn,
                    ContentAr = u.ContentAr,
                    CreatedBy = u.CreatedBy,
                    CreatedByName = u.CreatedByUser.ProfileName,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction(nameof(GetById), new { id = update.Id }, updateDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating update");
            return StatusCode(500, new { message = "An error occurred while creating update" });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUpdateDto updateUpdateDto)
    {
        try
        {
            var update = await _context.Updates.FindAsync(id);
            if (update == null)
            {
                return NotFound(new { message = "Update not found" });
            }

            update.TitleEn = updateUpdateDto.TitleEn;
            update.TitleAr = updateUpdateDto.TitleAr;
            update.ContentEn = updateUpdateDto.ContentEn;
            update.ContentAr = updateUpdateDto.ContentAr;
            update.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation("Update updated with ID: {Id} by user: {UserId}", id, userIdClaim);

            var updateDto = await _context.Updates
                .Include(u => u.CreatedByUser)
                .Where(u => u.Id == id)
                .Select(u => new UpdateDto
                {
                    Id = u.Id,
                    TitleEn = u.TitleEn,
                    TitleAr = u.TitleAr,
                    ContentEn = u.ContentEn,
                    ContentAr = u.ContentAr,
                    CreatedBy = u.CreatedBy,
                    CreatedByName = u.CreatedByUser.ProfileName,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt
                })
                .FirstOrDefaultAsync();

            return Ok(updateDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating update with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while updating update" });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var update = await _context.Updates.FindAsync(id);
            if (update == null)
            {
                return NotFound(new { message = "Update not found" });
            }

            _context.Updates.Remove(update);
            await _context.SaveChangesAsync();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation("Update deleted with ID: {Id} by user: {UserId}", id, userIdClaim);

            return Ok(new { message = "Update deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting update with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while deleting update" });
        }
    }
}
