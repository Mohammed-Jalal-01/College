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
public class CourseMaterialsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;
    private readonly ILogger<CourseMaterialsController> _logger;

    public CourseMaterialsController(
        ApplicationDbContext context,
        IFileStorageService fileStorageService,
        ILogger<CourseMaterialsController> logger)
    {
        _context = context;
        _fileStorageService = fileStorageService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] CourseMaterialFilterDto? filter)
    {
        try
        {
            var query = _context.CourseMaterials
                .Include(cm => cm.Branch)
                .Include(cm => cm.StudyType)
                .Include(cm => cm.Stage)
                .Include(cm => cm.UploadedByUser)
                .AsQueryable();

            if (filter != null)
            {
                if (filter.BranchId.HasValue)
                {
                    query = query.Where(cm => cm.BranchId == filter.BranchId.Value);
                }

                if (filter.StudyTypeId.HasValue)
                {
                    query = query.Where(cm => cm.StudyTypeId == filter.StudyTypeId.Value);
                }

                if (filter.StageId.HasValue)
                {
                    query = query.Where(cm => cm.StageId == filter.StageId.Value);
                }

                if (!string.IsNullOrEmpty(filter.Course))
                {
                    query = query.Where(cm => cm.Course == filter.Course);
                }
            }

            var materials = await query
                .OrderByDescending(cm => cm.CreatedAt)
                .Select(cm => new CourseMaterialDto
                {
                    Id = cm.Id,
                    BranchId = cm.BranchId,
                    BranchNameEn = cm.Branch.NameEn,
                    BranchNameAr = cm.Branch.NameAr,
                    StudyTypeId = cm.StudyTypeId,
                    StudyTypeNameEn = cm.StudyType.NameEn,
                    StudyTypeNameAr = cm.StudyType.NameAr,
                    StageId = cm.StageId,
                    StageNameEn = cm.Stage.NameEn,
                    StageNameAr = cm.Stage.NameAr,
                    StageNumber = cm.Stage.StageNumber,
                    Course = cm.Course,
                    TitleEn = cm.TitleEn,
                    TitleAr = cm.TitleAr,
                    DescriptionEn = cm.DescriptionEn,
                    DescriptionAr = cm.DescriptionAr,
                    FileUrl = cm.FileUrl,
                    FileType = cm.FileType,
                    UploadedBy = cm.UploadedBy,
                    UploadedByName = cm.UploadedByUser.ProfileName,
                    CreatedAt = cm.CreatedAt,
                    UpdatedAt = cm.UpdatedAt
                })
                .ToListAsync();

            return Ok(materials);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving course materials");
            return StatusCode(500, new { message = "An error occurred while retrieving course materials" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var material = await _context.CourseMaterials
                .Include(cm => cm.Branch)
                .Include(cm => cm.StudyType)
                .Include(cm => cm.Stage)
                .Include(cm => cm.UploadedByUser)
                .Where(cm => cm.Id == id)
                .Select(cm => new CourseMaterialDto
                {
                    Id = cm.Id,
                    BranchId = cm.BranchId,
                    BranchNameEn = cm.Branch.NameEn,
                    BranchNameAr = cm.Branch.NameAr,
                    StudyTypeId = cm.StudyTypeId,
                    StudyTypeNameEn = cm.StudyType.NameEn,
                    StudyTypeNameAr = cm.StudyType.NameAr,
                    StageId = cm.StageId,
                    StageNameEn = cm.Stage.NameEn,
                    StageNameAr = cm.Stage.NameAr,
                    StageNumber = cm.Stage.StageNumber,
                    Course = cm.Course,
                    TitleEn = cm.TitleEn,
                    TitleAr = cm.TitleAr,
                    DescriptionEn = cm.DescriptionEn,
                    DescriptionAr = cm.DescriptionAr,
                    FileUrl = cm.FileUrl,
                    FileType = cm.FileType,
                    UploadedBy = cm.UploadedBy,
                    UploadedByName = cm.UploadedByUser.ProfileName,
                    CreatedAt = cm.CreatedAt,
                    UpdatedAt = cm.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (material == null)
            {
                return NotFound(new { message = "Course material not found" });
            }

            return Ok(material);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving course material with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving course material" });
        }
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromForm] CreateCourseMaterialDto createDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user token" });
            }

            if (createDto.File == null || createDto.File.Length == 0)
            {
                return BadRequest(new { message = "File is required" });
            }

            var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".zip", ".rar" };
            var fileExtension = Path.GetExtension(createDto.File.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest(new { message = "Invalid file type. Allowed types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP, RAR" });
            }

            if (createDto.File.Length > 50 * 1024 * 1024)
            {
                return BadRequest(new { message = "File size must not exceed 50MB" });
            }

            var fileUrl = await _fileStorageService.SaveFileAsync(createDto.File, "course-materials");

            var material = new CourseMaterial
            {
                Id = Guid.NewGuid(),
                BranchId = createDto.BranchId,
                StudyTypeId = createDto.StudyTypeId,
                StageId = createDto.StageId,
                Course = createDto.Course,
                TitleEn = createDto.TitleEn,
                TitleAr = createDto.TitleAr,
                DescriptionEn = createDto.DescriptionEn,
                DescriptionAr = createDto.DescriptionAr,
                FileUrl = fileUrl,
                FileType = fileExtension.TrimStart('.'),
                UploadedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.CourseMaterials.Add(material);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Course material created with ID: {Id} by user: {UserId}", material.Id, userId);

            var materialDto = await _context.CourseMaterials
                .Include(cm => cm.Branch)
                .Include(cm => cm.StudyType)
                .Include(cm => cm.Stage)
                .Include(cm => cm.UploadedByUser)
                .Where(cm => cm.Id == material.Id)
                .Select(cm => new CourseMaterialDto
                {
                    Id = cm.Id,
                    BranchId = cm.BranchId,
                    BranchNameEn = cm.Branch.NameEn,
                    BranchNameAr = cm.Branch.NameAr,
                    StudyTypeId = cm.StudyTypeId,
                    StudyTypeNameEn = cm.StudyType.NameEn,
                    StudyTypeNameAr = cm.StudyType.NameAr,
                    StageId = cm.StageId,
                    StageNameEn = cm.Stage.NameEn,
                    StageNameAr = cm.Stage.NameAr,
                    StageNumber = cm.Stage.StageNumber,
                    Course = cm.Course,
                    TitleEn = cm.TitleEn,
                    TitleAr = cm.TitleAr,
                    DescriptionEn = cm.DescriptionEn,
                    DescriptionAr = cm.DescriptionAr,
                    FileUrl = cm.FileUrl,
                    FileType = cm.FileType,
                    UploadedBy = cm.UploadedBy,
                    UploadedByName = cm.UploadedByUser.ProfileName,
                    CreatedAt = cm.CreatedAt,
                    UpdatedAt = cm.UpdatedAt
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction(nameof(GetById), new { id = material.Id }, materialDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating course material");
            return StatusCode(500, new { message = "An error occurred while creating course material" });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(Guid id, [FromForm] UpdateCourseMaterialDto updateDto)
    {
        try
        {
            var material = await _context.CourseMaterials.FindAsync(id);
            if (material == null)
            {
                return NotFound(new { message = "Course material not found" });
            }

            if (updateDto.File != null && updateDto.File.Length > 0)
            {
                var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".zip", ".rar" };
                var fileExtension = Path.GetExtension(updateDto.File.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new { message = "Invalid file type. Allowed types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP, RAR" });
                }

                if (updateDto.File.Length > 50 * 1024 * 1024)
                {
                    return BadRequest(new { message = "File size must not exceed 50MB" });
                }

                await _fileStorageService.DeleteFileAsync(material.FileUrl);

                var fileUrl = await _fileStorageService.SaveFileAsync(updateDto.File, "course-materials");
                material.FileUrl = fileUrl;
                material.FileType = fileExtension.TrimStart('.');
            }

            material.BranchId = updateDto.BranchId;
            material.StudyTypeId = updateDto.StudyTypeId;
            material.StageId = updateDto.StageId;
            material.Course = updateDto.Course;
            material.TitleEn = updateDto.TitleEn;
            material.TitleAr = updateDto.TitleAr;
            material.DescriptionEn = updateDto.DescriptionEn;
            material.DescriptionAr = updateDto.DescriptionAr;
            material.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation("Course material updated with ID: {Id} by user: {UserId}", id, userIdClaim);

            var materialDto = await _context.CourseMaterials
                .Include(cm => cm.Branch)
                .Include(cm => cm.StudyType)
                .Include(cm => cm.Stage)
                .Include(cm => cm.UploadedByUser)
                .Where(cm => cm.Id == id)
                .Select(cm => new CourseMaterialDto
                {
                    Id = cm.Id,
                    BranchId = cm.BranchId,
                    BranchNameEn = cm.Branch.NameEn,
                    BranchNameAr = cm.Branch.NameAr,
                    StudyTypeId = cm.StudyTypeId,
                    StudyTypeNameEn = cm.StudyType.NameEn,
                    StudyTypeNameAr = cm.StudyType.NameAr,
                    StageId = cm.StageId,
                    StageNameEn = cm.Stage.NameEn,
                    StageNameAr = cm.Stage.NameAr,
                    StageNumber = cm.Stage.StageNumber,
                    Course = cm.Course,
                    TitleEn = cm.TitleEn,
                    TitleAr = cm.TitleAr,
                    DescriptionEn = cm.DescriptionEn,
                    DescriptionAr = cm.DescriptionAr,
                    FileUrl = cm.FileUrl,
                    FileType = cm.FileType,
                    UploadedBy = cm.UploadedBy,
                    UploadedByName = cm.UploadedByUser.ProfileName,
                    CreatedAt = cm.CreatedAt,
                    UpdatedAt = cm.UpdatedAt
                })
                .FirstOrDefaultAsync();

            return Ok(materialDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating course material with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while updating course material" });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var material = await _context.CourseMaterials.FindAsync(id);
            if (material == null)
            {
                return NotFound(new { message = "Course material not found" });
            }

            await _fileStorageService.DeleteFileAsync(material.FileUrl);

            _context.CourseMaterials.Remove(material);
            await _context.SaveChangesAsync();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation("Course material deleted with ID: {Id} by user: {UserId}", id, userIdClaim);

            return Ok(new { message = "Course material deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting course material with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while deleting course material" });
        }
    }
}
