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
public class DepartmentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DepartmentsController> _logger;

    public DepartmentsController(ApplicationDbContext context, ILogger<DepartmentsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var departments = await _context.Departments
                .Include(d => d.CreatedByUser)
                .OrderBy(d => d.NameEn)
                .Select(d => new DepartmentDto
                {
                    Id = d.Id,
                    NameEn = d.NameEn,
                    NameAr = d.NameAr,
                    DescriptionEn = d.DescriptionEn,
                    DescriptionAr = d.DescriptionAr,
                    CreatedBy = d.CreatedBy,
                    CreatedByName = d.CreatedByUser.ProfileName,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt
                })
                .ToListAsync();

            return Ok(departments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving departments");
            return StatusCode(500, new { message = "An error occurred while retrieving departments" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var department = await _context.Departments
                .Include(d => d.CreatedByUser)
                .Where(d => d.Id == id)
                .Select(d => new DepartmentDto
                {
                    Id = d.Id,
                    NameEn = d.NameEn,
                    NameAr = d.NameAr,
                    DescriptionEn = d.DescriptionEn,
                    DescriptionAr = d.DescriptionAr,
                    CreatedBy = d.CreatedBy,
                    CreatedByName = d.CreatedByUser.ProfileName,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (department == null)
            {
                return NotFound(new { message = "Department not found" });
            }

            return Ok(department);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving department with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving department" });
        }
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] CreateDepartmentDto createDepartmentDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user token" });
            }

            var department = new Department
            {
                Id = Guid.NewGuid(),
                NameEn = createDepartmentDto.NameEn,
                NameAr = createDepartmentDto.NameAr,
                DescriptionEn = createDepartmentDto.DescriptionEn,
                DescriptionAr = createDepartmentDto.DescriptionAr,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Departments.Add(department);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Department created with ID: {Id} by user: {UserId}", department.Id, userId);

            var departmentDto = await _context.Departments
                .Include(d => d.CreatedByUser)
                .Where(d => d.Id == department.Id)
                .Select(d => new DepartmentDto
                {
                    Id = d.Id,
                    NameEn = d.NameEn,
                    NameAr = d.NameAr,
                    DescriptionEn = d.DescriptionEn,
                    DescriptionAr = d.DescriptionAr,
                    CreatedBy = d.CreatedBy,
                    CreatedByName = d.CreatedByUser.ProfileName,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction(nameof(GetById), new { id = department.Id }, departmentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating department");
            return StatusCode(500, new { message = "An error occurred while creating department" });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDepartmentDto updateDepartmentDto)
    {
        try
        {
            var department = await _context.Departments.FindAsync(id);
            if (department == null)
            {
                return NotFound(new { message = "Department not found" });
            }

            department.NameEn = updateDepartmentDto.NameEn;
            department.NameAr = updateDepartmentDto.NameAr;
            department.DescriptionEn = updateDepartmentDto.DescriptionEn;
            department.DescriptionAr = updateDepartmentDto.DescriptionAr;
            department.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation("Department updated with ID: {Id} by user: {UserId}", id, userIdClaim);

            var departmentDto = await _context.Departments
                .Include(d => d.CreatedByUser)
                .Where(d => d.Id == id)
                .Select(d => new DepartmentDto
                {
                    Id = d.Id,
                    NameEn = d.NameEn,
                    NameAr = d.NameAr,
                    DescriptionEn = d.DescriptionEn,
                    DescriptionAr = d.DescriptionAr,
                    CreatedBy = d.CreatedBy,
                    CreatedByName = d.CreatedByUser.ProfileName,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt
                })
                .FirstOrDefaultAsync();

            return Ok(departmentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating department with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while updating department" });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var department = await _context.Departments.FindAsync(id);
            if (department == null)
            {
                return NotFound(new { message = "Department not found" });
            }

            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation("Department deleted with ID: {Id} by user: {UserId}", id, userIdClaim);

            return Ok(new { message = "Department deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting department with ID: {Id}", id);
            return StatusCode(500, new { message = "An error occurred while deleting department" });
        }
    }
}
