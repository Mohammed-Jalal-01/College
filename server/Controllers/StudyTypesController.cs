using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CollegeAPI.Data;

namespace CollegeAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudyTypesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<StudyTypesController> _logger;

    public StudyTypesController(ApplicationDbContext context, ILogger<StudyTypesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var studyTypes = await _context.StudyTypes
                .OrderBy(st => st.NameEn)
                .ToListAsync();
            
            return Ok(studyTypes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving study types");
            return StatusCode(500, new { message = "An error occurred while retrieving study types" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var studyType = await _context.StudyTypes.FindAsync(id);
            
            if (studyType == null)
            {
                return NotFound(new { message = "Study type not found" });
            }
            
            return Ok(studyType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving study type {StudyTypeId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the study type" });
        }
    }
}
