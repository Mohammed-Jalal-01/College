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
public class NewsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<NewsController> _logger;

    public NewsController(ApplicationDbContext context, ILogger<NewsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var news = await _context.News
                .Include(n => n.CreatedByUser)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NewsDto
                {
                    Id = n.Id,
                    TitleEn = n.TitleEn,
                    TitleAr = n.TitleAr,
                    ContentEn = n.ContentEn,
                    ContentAr = n.ContentAr,
                    IsFeatured = n.IsFeatured,
                    CreatedBy = n.CreatedBy,
                    CreatedByName = n.CreatedByUser.ProfileName,
                    CreatedAt = n.CreatedAt,
                    UpdatedAt = n.UpdatedAt
                })
                .ToListAsync();

            return Ok(news);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving news");
            return StatusCode(500, new { message = "An error occurred while retrieving news" });
        }
    }

    [HttpGet("featured")]
    public async Task<IActionResult> GetFeatured()
    {
        try
        {
            var featuredNews = await _context.News
                .Include(n => n.CreatedByUser)
                .Where(n => n.IsFeatured)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NewsDto
                {
                    Id = n.Id,
                    TitleEn = n.TitleEn,
                    TitleAr = n.TitleAr,
                    ContentEn = n.ContentEn,
                    ContentAr = n.ContentAr,
                    IsFeatured = n.IsFeatured,
                    CreatedBy = n.CreatedBy,
                    CreatedByName = n.CreatedByUser.ProfileName,
                    CreatedAt = n.CreatedAt,
                    UpdatedAt = n.UpdatedAt
                })
                .ToListAsync();

            return Ok(featuredNews);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving featured news");
            return StatusCode(500, new { message = "An error occurred while retrieving featured news" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var news = await _context.News
                .Include(n => n.CreatedByUser)
                .Where(n => n.Id == id)
                .Select(n => new NewsDto
                {
                    Id = n.Id,
                    TitleEn = n.TitleEn,
                    TitleAr = n.TitleAr,
                    ContentEn = n.ContentEn,
                    ContentAr = n.ContentAr,
                    IsFeatured = n.IsFeatured,
                    CreatedBy = n.CreatedBy,
                    CreatedByName = n.CreatedByUser.ProfileName,
                    CreatedAt = n.CreatedAt,
                    UpdatedAt = n.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (news == null)
            {
                return NotFound(new { message = "News not found" });
            }

            return Ok(news);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving news with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving news" });
        }
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] CreateNewsDto createNewsDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user token" });
            }

            var news = new News
            {
                Id = Guid.NewGuid(),
                TitleEn = createNewsDto.TitleEn,
                TitleAr = createNewsDto.TitleAr,
                ContentEn = createNewsDto.ContentEn,
                ContentAr = createNewsDto.ContentAr,
                IsFeatured = createNewsDto.IsFeatured,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.News.Add(news);
            await _context.SaveChangesAsync();

            _logger.LogInformation("News created with ID: {Id} by user: {UserId}", news.Id, userId);

            var newsDto = await _context.News
                .Include(n => n.CreatedByUser)
                .Where(n => n.Id == news.Id)
                .Select(n => new NewsDto
                {
                    Id = n.Id,
                    TitleEn = n.TitleEn,
                    TitleAr = n.TitleAr,
                    ContentEn = n.ContentEn,
                    ContentAr = n.ContentAr,
                    IsFeatured = n.IsFeatured,
                    CreatedBy = n.CreatedBy,
                    CreatedByName = n.CreatedByUser.ProfileName,
                    CreatedAt = n.CreatedAt,
                    UpdatedAt = n.UpdatedAt
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction(nameof(GetById), new { id = news.Id }, newsDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating news");
            return StatusCode(500, new { message = "An error occurred while creating news" });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateNewsDto updateNewsDto)
    {
        try
        {
            var news = await _context.News.FindAsync(id);
            if (news == null)
            {
                return NotFound(new { message = "News not found" });
            }

            news.TitleEn = updateNewsDto.TitleEn;
            news.TitleAr = updateNewsDto.TitleAr;
            news.ContentEn = updateNewsDto.ContentEn;
            news.ContentAr = updateNewsDto.ContentAr;
            news.IsFeatured = updateNewsDto.IsFeatured;
            news.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation("News updated with ID: {Id} by user: {UserId}", id, userIdClaim);

            var newsDto = await _context.News
                .Include(n => n.CreatedByUser)
                .Where(n => n.Id == id)
                .Select(n => new NewsDto
                {
                    Id = n.Id,
                    TitleEn = n.TitleEn,
                    TitleAr = n.TitleAr,
                    ContentEn = n.ContentEn,
                    ContentAr = n.ContentAr,
                    IsFeatured = n.IsFeatured,
                    CreatedBy = n.CreatedBy,
                    CreatedByName = n.CreatedByUser.ProfileName,
                    CreatedAt = n.CreatedAt,
                    UpdatedAt = n.UpdatedAt
                })
                .FirstOrDefaultAsync();

            return Ok(newsDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating news with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while updating news" });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var news = await _context.News.FindAsync(id);
            if (news == null)
            {
                return NotFound(new { message = "News not found" });
            }

            _context.News.Remove(news);
            await _context.SaveChangesAsync();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation("News deleted with ID: {Id} by user: {UserId}", id, userIdClaim);

            return Ok(new { message = "News deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting news with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while deleting news" });
        }
    }
}
