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
public class AboutCollegeController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;
    private readonly ILogger<AboutCollegeController> _logger;

    public AboutCollegeController(ApplicationDbContext context, IFileStorageService fileStorageService, ILogger<AboutCollegeController> logger)
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
            var items = await _context.AboutCollege
                .Include(a => a.UpdatedByUser)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new AboutCollegeDto
                {
                    Id = a.Id,
                    ContentEn = a.ContentEn,
                    ContentAr = a.ContentAr,
                    ImageUrl = a.ImageUrl,
                    UpdatedBy = a.UpdatedBy,
                    UpdatedByName = a.UpdatedByUser.ProfileName,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                })
                .ToListAsync();

            return Ok(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving about college information");
            return StatusCode(500, new { message = "An error occurred while retrieving about college information" });
        }
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromForm] CreateAboutCollegeDto createDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user token" });
            }

            string? imageUrl = null;
            if (createDto.Image != null && createDto.Image.Length > 0)
            {
                imageUrl = await _fileStorageService.SaveFileAsync(createDto.Image, "images");
            }

            var aboutCollege = new AboutCollege
            {
                Id = Guid.NewGuid(),
                ContentEn = createDto.Content,
                ContentAr = createDto.Content,
                ImageUrl = imageUrl,
                UpdatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.AboutCollege.Add(aboutCollege);
            await _context.SaveChangesAsync();

            _logger.LogInformation("About college post created with ID: {Id} by user: {UserId}", aboutCollege.Id, userId);

            var dto = await _context.AboutCollege
                .Include(a => a.UpdatedByUser)
                .Where(a => a.Id == aboutCollege.Id)
                .Select(a => new AboutCollegeDto
                {
                    Id = a.Id,
                    ContentEn = a.ContentEn,
                    ContentAr = a.ContentAr,
                    ImageUrl = a.ImageUrl,
                    UpdatedBy = a.UpdatedBy,
                    UpdatedByName = a.UpdatedByUser.ProfileName,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction(nameof(GetAll), new { id = aboutCollege.Id }, dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating about college post");
            return StatusCode(500, new { message = "An error occurred while creating about college post" });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(Guid id, [FromForm] UpdateAboutCollegeDto updateDto)
    {
        try
        {
            var aboutCollege = await _context.AboutCollege.FindAsync(id);
            if (aboutCollege == null)
            {
                return NotFound(new { message = "About college post not found" });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user token" });
            }

            if (updateDto.Image != null && updateDto.Image.Length > 0)
            {
                if (!string.IsNullOrEmpty(aboutCollege.ImageUrl))
                {
                    await _fileStorageService.DeleteFileAsync(aboutCollege.ImageUrl);
                }
                aboutCollege.ImageUrl = await _fileStorageService.SaveFileAsync(updateDto.Image, "images");
            }

            aboutCollege.ContentEn = updateDto.Content;
            aboutCollege.ContentAr = updateDto.Content;
            aboutCollege.UpdatedBy = userId;
            aboutCollege.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("About college post updated with ID: {Id} by user: {UserId}", id, userId);

            var dto = await _context.AboutCollege
                .Include(a => a.UpdatedByUser)
                .Where(a => a.Id == id)
                .Select(a => new AboutCollegeDto
                {
                    Id = a.Id,
                    ContentEn = a.ContentEn,
                    ContentAr = a.ContentAr,
                    ImageUrl = a.ImageUrl,
                    UpdatedBy = a.UpdatedBy,
                    UpdatedByName = a.UpdatedByUser.ProfileName,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                })
                .FirstOrDefaultAsync();

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating about college post with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while updating about college post" });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var aboutCollege = await _context.AboutCollege.FindAsync(id);
            if (aboutCollege == null)
            {
                return NotFound(new { message = "About college post not found" });
            }

            if (!string.IsNullOrEmpty(aboutCollege.ImageUrl))
            {
                await _fileStorageService.DeleteFileAsync(aboutCollege.ImageUrl);
            }

            _context.AboutCollege.Remove(aboutCollege);
            await _context.SaveChangesAsync();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation("About college post deleted with ID: {Id} by user: {UserId}", id, userIdClaim);

            return Ok(new { message = "About college post deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting about college post with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while deleting about college post" });
        }
    }
}
