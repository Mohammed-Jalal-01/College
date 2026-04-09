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
public class LectureSchedulesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<LectureSchedulesController> _logger;

    public LectureSchedulesController(ApplicationDbContext context, ILogger<LectureSchedulesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] LectureScheduleFilterDto? filter)
    {
        try
        {
            var query = _context.LectureSchedules
                .Include(ls => ls.Branch)
                .Include(ls => ls.StudyType)
                .Include(ls => ls.Stage)
                .Include(ls => ls.CreatedByUser)
                .AsQueryable();

            if (filter != null)
            {
                if (filter.BranchId.HasValue)
                {
                    query = query.Where(ls => ls.BranchId == filter.BranchId.Value);
                }

                if (filter.StudyTypeId.HasValue)
                {
                    query = query.Where(ls => ls.StudyTypeId == filter.StudyTypeId.Value);
                }

                if (filter.StageId.HasValue)
                {
                    query = query.Where(ls => ls.StageId == filter.StageId.Value);
                }
            }

            var schedules = await query
                .OrderBy(ls => ls.Day)
                .ThenBy(ls => ls.StartTime)
                .Select(ls => new LectureScheduleDto
                {
                    Id = ls.Id,
                    BranchId = ls.BranchId,
                    BranchNameEn = ls.Branch.NameEn,
                    BranchNameAr = ls.Branch.NameAr,
                    StudyTypeId = ls.StudyTypeId,
                    StudyTypeNameEn = ls.StudyType.NameEn,
                    StudyTypeNameAr = ls.StudyType.NameAr,
                    StageId = ls.StageId,
                    StageNameEn = ls.Stage.NameEn,
                    StageNameAr = ls.Stage.NameAr,
                    StageNumber = ls.Stage.StageNumber,
                    Day = ls.Day,
                    StartTime = ls.StartTime,
                    EndTime = ls.EndTime,
                    SubjectNameEn = ls.SubjectNameEn,
                    SubjectNameAr = ls.SubjectNameAr,
                    InstructorName = ls.InstructorName,
                    RoomNumber = ls.RoomNumber,
                    CreatedBy = ls.CreatedBy,
                    CreatedByName = ls.CreatedByUser.ProfileName,
                    CreatedAt = ls.CreatedAt,
                    UpdatedAt = ls.UpdatedAt
                })
                .ToListAsync();

            return Ok(schedules);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving lecture schedules");
            return StatusCode(500, new { message = "An error occurred while retrieving lecture schedules" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var schedule = await _context.LectureSchedules
                .Include(ls => ls.Branch)
                .Include(ls => ls.StudyType)
                .Include(ls => ls.Stage)
                .Include(ls => ls.CreatedByUser)
                .Where(ls => ls.Id == id)
                .Select(ls => new LectureScheduleDto
                {
                    Id = ls.Id,
                    BranchId = ls.BranchId,
                    BranchNameEn = ls.Branch.NameEn,
                    BranchNameAr = ls.Branch.NameAr,
                    StudyTypeId = ls.StudyTypeId,
                    StudyTypeNameEn = ls.StudyType.NameEn,
                    StudyTypeNameAr = ls.StudyType.NameAr,
                    StageId = ls.StageId,
                    StageNameEn = ls.Stage.NameEn,
                    StageNameAr = ls.Stage.NameAr,
                    StageNumber = ls.Stage.StageNumber,
                    Day = ls.Day,
                    StartTime = ls.StartTime,
                    EndTime = ls.EndTime,
                    SubjectNameEn = ls.SubjectNameEn,
                    SubjectNameAr = ls.SubjectNameAr,
                    InstructorName = ls.InstructorName,
                    RoomNumber = ls.RoomNumber,
                    CreatedBy = ls.CreatedBy,
                    CreatedByName = ls.CreatedByUser.ProfileName,
                    CreatedAt = ls.CreatedAt,
                    UpdatedAt = ls.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (schedule == null)
            {
                return NotFound(new { message = "Lecture schedule not found" });
            }

            return Ok(schedule);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving lecture schedule with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving lecture schedule" });
        }
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] CreateLectureScheduleDto createDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user token" });
            }

            var schedule = new LectureSchedule
            {
                Id = Guid.NewGuid(),
                BranchId = createDto.BranchId,
                StudyTypeId = createDto.StudyTypeId,
                StageId = createDto.StageId,
                Day = createDto.Day,
                StartTime = createDto.StartTime,
                EndTime = createDto.EndTime,
                SubjectNameEn = createDto.SubjectNameEn,
                SubjectNameAr = createDto.SubjectNameAr,
                InstructorName = createDto.InstructorName,
                RoomNumber = createDto.RoomNumber,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.LectureSchedules.Add(schedule);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Lecture schedule created with ID: {Id} by user: {UserId}", schedule.Id, userId);

            var scheduleDto = await _context.LectureSchedules
                .Include(ls => ls.Branch)
                .Include(ls => ls.StudyType)
                .Include(ls => ls.Stage)
                .Include(ls => ls.CreatedByUser)
                .Where(ls => ls.Id == schedule.Id)
                .Select(ls => new LectureScheduleDto
                {
                    Id = ls.Id,
                    BranchId = ls.BranchId,
                    BranchNameEn = ls.Branch.NameEn,
                    BranchNameAr = ls.Branch.NameAr,
                    StudyTypeId = ls.StudyTypeId,
                    StudyTypeNameEn = ls.StudyType.NameEn,
                    StudyTypeNameAr = ls.StudyType.NameAr,
                    StageId = ls.StageId,
                    StageNameEn = ls.Stage.NameEn,
                    StageNameAr = ls.Stage.NameAr,
                    StageNumber = ls.Stage.StageNumber,
                    Day = ls.Day,
                    StartTime = ls.StartTime,
                    EndTime = ls.EndTime,
                    SubjectNameEn = ls.SubjectNameEn,
                    SubjectNameAr = ls.SubjectNameAr,
                    InstructorName = ls.InstructorName,
                    RoomNumber = ls.RoomNumber,
                    CreatedBy = ls.CreatedBy,
                    CreatedByName = ls.CreatedByUser.ProfileName,
                    CreatedAt = ls.CreatedAt,
                    UpdatedAt = ls.UpdatedAt
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction(nameof(GetById), new { id = schedule.Id }, scheduleDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating lecture schedule");
            return StatusCode(500, new { message = "An error occurred while creating lecture schedule" });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateLectureScheduleDto updateDto)
    {
        try
        {
            var schedule = await _context.LectureSchedules.FindAsync(id);
            if (schedule == null)
            {
                return NotFound(new { message = "Lecture schedule not found" });
            }

            schedule.BranchId = updateDto.BranchId;
            schedule.StudyTypeId = updateDto.StudyTypeId;
            schedule.StageId = updateDto.StageId;
            schedule.Day = updateDto.Day;
            schedule.StartTime = updateDto.StartTime;
            schedule.EndTime = updateDto.EndTime;
            schedule.SubjectNameEn = updateDto.SubjectNameEn;
            schedule.SubjectNameAr = updateDto.SubjectNameAr;
            schedule.InstructorName = updateDto.InstructorName;
            schedule.RoomNumber = updateDto.RoomNumber;
            schedule.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation("Lecture schedule updated with ID: {Id} by user: {UserId}", id, userIdClaim);

            var scheduleDto = await _context.LectureSchedules
                .Include(ls => ls.Branch)
                .Include(ls => ls.StudyType)
                .Include(ls => ls.Stage)
                .Include(ls => ls.CreatedByUser)
                .Where(ls => ls.Id == id)
                .Select(ls => new LectureScheduleDto
                {
                    Id = ls.Id,
                    BranchId = ls.BranchId,
                    BranchNameEn = ls.Branch.NameEn,
                    BranchNameAr = ls.Branch.NameAr,
                    StudyTypeId = ls.StudyTypeId,
                    StudyTypeNameEn = ls.StudyType.NameEn,
                    StudyTypeNameAr = ls.StudyType.NameAr,
                    StageId = ls.StageId,
                    StageNameEn = ls.Stage.NameEn,
                    StageNameAr = ls.Stage.NameAr,
                    StageNumber = ls.Stage.StageNumber,
                    Day = ls.Day,
                    StartTime = ls.StartTime,
                    EndTime = ls.EndTime,
                    SubjectNameEn = ls.SubjectNameEn,
                    SubjectNameAr = ls.SubjectNameAr,
                    InstructorName = ls.InstructorName,
                    RoomNumber = ls.RoomNumber,
                    CreatedBy = ls.CreatedBy,
                    CreatedByName = ls.CreatedByUser.ProfileName,
                    CreatedAt = ls.CreatedAt,
                    UpdatedAt = ls.UpdatedAt
                })
                .FirstOrDefaultAsync();

            return Ok(scheduleDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating lecture schedule with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while updating lecture schedule" });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var schedule = await _context.LectureSchedules.FindAsync(id);
            if (schedule == null)
            {
                return NotFound(new { message = "Lecture schedule not found" });
            }

            _context.LectureSchedules.Remove(schedule);
            await _context.SaveChangesAsync();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation("Lecture schedule deleted with ID: {Id} by user: {UserId}", id, userIdClaim);

            return Ok(new { message = "Lecture schedule deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting lecture schedule with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while deleting lecture schedule" });
        }
    }
}
