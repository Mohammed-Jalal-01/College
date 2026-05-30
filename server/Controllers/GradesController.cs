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
public class GradesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;
    private readonly ILogger<GradesController> _logger;

    private static readonly string[] AllowedExtensions =
    {
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".ods",
        ".ppt", ".pptx", ".png", ".jpg", ".jpeg", ".txt", ".zip", ".rar"
    };

    public GradesController(
        ApplicationDbContext context,
        IFileStorageService fileStorageService,
        ILogger<GradesController> logger)
    {
        _context = context;
        _fileStorageService = fileStorageService;
        _logger = logger;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll([FromQuery] GradeFilterDto? filter)
    {
        try
        {
            var query = _context.Grades
                .Include(g => g.Branch)
                .Include(g => g.StudyType)
                .Include(g => g.Stage)
                .Include(g => g.UploadedByUser)
                .AsQueryable();

            if (filter != null)
            {
                if (filter.BranchId.HasValue)
                {
                    query = query.Where(g => g.BranchId == filter.BranchId.Value);
                }

                if (filter.StudyTypeId.HasValue)
                {
                    query = query.Where(g => g.StudyTypeId == filter.StudyTypeId.Value);
                }

                if (filter.StageId.HasValue)
                {
                    query = query.Where(g => g.StageId == filter.StageId.Value);
                }
            }

            var grades = await query
                .OrderByDescending(g => g.CreatedAt)
                .Select(g => new GradeDto
                {
                    Id = g.Id,
                    SubjectName = g.SubjectName,
                    BranchId = g.BranchId,
                    BranchNameEn = g.Branch.NameEn,
                    BranchNameAr = g.Branch.NameAr,
                    StudyTypeId = g.StudyTypeId,
                    StudyTypeNameEn = g.StudyType.NameEn,
                    StudyTypeNameAr = g.StudyType.NameAr,
                    StageId = g.StageId,
                    StageNameEn = g.Stage.NameEn,
                    StageNameAr = g.Stage.NameAr,
                    StageNumber = g.Stage.StageNumber,
                    FileUrl = g.FileUrl,
                    FileType = g.FileType,
                    OriginalFileName = g.OriginalFileName,
                    UploadedBy = g.UploadedBy,
                    UploadedByName = g.UploadedByUser.ProfileName,
                    CreatedAt = g.CreatedAt,
                    UpdatedAt = g.UpdatedAt
                })
                .ToListAsync();

            return Ok(grades);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving grades");
            return StatusCode(500, new { message = "An error occurred while retrieving grades" });
        }
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var grade = await _context.Grades
                .Include(g => g.Branch)
                .Include(g => g.StudyType)
                .Include(g => g.Stage)
                .Include(g => g.UploadedByUser)
                .Where(g => g.Id == id)
                .Select(g => new GradeDto
                {
                    Id = g.Id,
                    SubjectName = g.SubjectName,
                    BranchId = g.BranchId,
                    BranchNameEn = g.Branch.NameEn,
                    BranchNameAr = g.Branch.NameAr,
                    StudyTypeId = g.StudyTypeId,
                    StudyTypeNameEn = g.StudyType.NameEn,
                    StudyTypeNameAr = g.StudyType.NameAr,
                    StageId = g.StageId,
                    StageNameEn = g.Stage.NameEn,
                    StageNameAr = g.Stage.NameAr,
                    StageNumber = g.Stage.StageNumber,
                    FileUrl = g.FileUrl,
                    FileType = g.FileType,
                    OriginalFileName = g.OriginalFileName,
                    UploadedBy = g.UploadedBy,
                    UploadedByName = g.UploadedByUser.ProfileName,
                    CreatedAt = g.CreatedAt,
                    UpdatedAt = g.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (grade == null)
            {
                return NotFound(new { message = "Grade not found" });
            }

            return Ok(grade);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving grade with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving grade" });
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromForm] CreateGradeDto createDto)
    {
        try
        {
            if (!IsFacultyOrAdmin())
            {
                return Forbid();
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user token" });
            }

            if (createDto.File == null || createDto.File.Length == 0)
            {
                return BadRequest(new { message = "File is required" });
            }

            var fileExtension = Path.GetExtension(createDto.File.FileName).ToLowerInvariant();

            if (!AllowedExtensions.Contains(fileExtension))
            {
                return BadRequest(new { message = $"Invalid file type. Allowed types: {string.Join(", ", AllowedExtensions.Select(e => e.TrimStart('.')).ToArray())}" });
            }

            if (createDto.File.Length > 50 * 1024 * 1024)
            {
                return BadRequest(new { message = "File size must not exceed 50MB" });
            }

            var fileUrl = await _fileStorageService.SaveFileAsync(createDto.File, "grades");

            var grade = new Grade
            {
                Id = Guid.NewGuid(),
                SubjectName = createDto.SubjectName.Trim(),
                BranchId = createDto.BranchId,
                StudyTypeId = createDto.StudyTypeId,
                StageId = createDto.StageId,
                FileUrl = fileUrl,
                FileType = fileExtension.TrimStart('.'),
                OriginalFileName = createDto.File.FileName,
                UploadedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Grades.Add(grade);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Grade created with ID: {Id} by user: {UserId}", grade.Id, userId);

            var gradeDto = await _context.Grades
                .Include(g => g.Branch)
                .Include(g => g.StudyType)
                .Include(g => g.Stage)
                .Include(g => g.UploadedByUser)
                .Where(g => g.Id == grade.Id)
                .Select(g => new GradeDto
                {
                    Id = g.Id,
                    SubjectName = g.SubjectName,
                    BranchId = g.BranchId,
                    BranchNameEn = g.Branch.NameEn,
                    BranchNameAr = g.Branch.NameAr,
                    StudyTypeId = g.StudyTypeId,
                    StudyTypeNameEn = g.StudyType.NameEn,
                    StudyTypeNameAr = g.StudyType.NameAr,
                    StageId = g.StageId,
                    StageNameEn = g.Stage.NameEn,
                    StageNameAr = g.Stage.NameAr,
                    StageNumber = g.Stage.StageNumber,
                    FileUrl = g.FileUrl,
                    FileType = g.FileType,
                    OriginalFileName = g.OriginalFileName,
                    UploadedBy = g.UploadedBy,
                    UploadedByName = g.UploadedByUser.ProfileName,
                    CreatedAt = g.CreatedAt,
                    UpdatedAt = g.UpdatedAt
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction(nameof(GetById), new { id = grade.Id }, gradeDto);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Grade file validation failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating grade");
            return StatusCode(500, new { message = "An error occurred while creating grade" });
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromForm] UpdateGradeDto updateDto)
    {
        try
        {
            if (!IsFacultyOrAdmin())
            {
                return Forbid();
            }

            var grade = await _context.Grades.FindAsync(id);
            if (grade == null)
            {
                return NotFound(new { message = "Grade not found" });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user token" });
            }

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (grade.UploadedBy != userId && userRole != "Admin" && userRole != "SuperAdmin")
            {
                return Forbid();
            }

            if (updateDto.File != null && updateDto.File.Length > 0)
            {
                var fileExtension = Path.GetExtension(updateDto.File.FileName).ToLowerInvariant();

                if (!AllowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new { message = $"Invalid file type. Allowed types: {string.Join(", ", AllowedExtensions.Select(e => e.TrimStart('.')).ToArray())}" });
                }

                if (updateDto.File.Length > 50 * 1024 * 1024)
                {
                    return BadRequest(new { message = "File size must not exceed 50MB" });
                }

                await _fileStorageService.DeleteFileAsync(grade.FileUrl);

                var fileUrl = await _fileStorageService.SaveFileAsync(updateDto.File, "grades");
                grade.FileUrl = fileUrl;
                grade.FileType = fileExtension.TrimStart('.');
                grade.OriginalFileName = updateDto.File.FileName;
            }

            grade.SubjectName = updateDto.SubjectName.Trim();
            grade.BranchId = updateDto.BranchId;
            grade.StudyTypeId = updateDto.StudyTypeId;
            grade.StageId = updateDto.StageId;
            grade.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Grade updated with ID: {Id} by user: {UserId}", id, userId);

            var gradeDto = await _context.Grades
                .Include(g => g.Branch)
                .Include(g => g.StudyType)
                .Include(g => g.Stage)
                .Include(g => g.UploadedByUser)
                .Where(g => g.Id == id)
                .Select(g => new GradeDto
                {
                    Id = g.Id,
                    SubjectName = g.SubjectName,
                    BranchId = g.BranchId,
                    BranchNameEn = g.Branch.NameEn,
                    BranchNameAr = g.Branch.NameAr,
                    StudyTypeId = g.StudyTypeId,
                    StudyTypeNameEn = g.StudyType.NameEn,
                    StudyTypeNameAr = g.StudyType.NameAr,
                    StageId = g.StageId,
                    StageNameEn = g.Stage.NameEn,
                    StageNameAr = g.Stage.NameAr,
                    StageNumber = g.Stage.StageNumber,
                    FileUrl = g.FileUrl,
                    FileType = g.FileType,
                    OriginalFileName = g.OriginalFileName,
                    UploadedBy = g.UploadedBy,
                    UploadedByName = g.UploadedByUser.ProfileName,
                    CreatedAt = g.CreatedAt,
                    UpdatedAt = g.UpdatedAt
                })
                .FirstOrDefaultAsync();

            return Ok(gradeDto);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Grade file validation failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating grade with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while updating grade" });
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            if (!IsFacultyOrAdmin())
            {
                return Forbid();
            }

            var grade = await _context.Grades.FindAsync(id);
            if (grade == null)
            {
                return NotFound(new { message = "Grade not found" });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user token" });
            }

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (grade.UploadedBy != userId && userRole != "Admin" && userRole != "SuperAdmin")
            {
                return Forbid();
            }

            await _fileStorageService.DeleteFileAsync(grade.FileUrl);

            _context.Grades.Remove(grade);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Grade deleted with ID: {Id} by user: {UserId}", id, userId);

            return Ok(new { message = "Grade deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting grade with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while deleting grade" });
        }
    }

    private bool IsFacultyOrAdmin()
    {
        var userType = User.FindFirst("UserType")?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        return userType == "Faculty" || userRole == "Admin" || userRole == "SuperAdmin";
    }
}
