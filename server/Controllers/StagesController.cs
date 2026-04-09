using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CollegeAPI.Data;

namespace CollegeAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StagesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<StagesController> _logger;

    public StagesController(ApplicationDbContext context, ILogger<StagesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var stages = await _context.Stages
                .OrderBy(s => s.StageNumber)
                .ToListAsync();
            
            return Ok(stages);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving stages");
            return StatusCode(500, new { message = "An error occurred while retrieving stages" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var stage = await _context.Stages.FindAsync(id);
            
            if (stage == null)
            {
                return NotFound(new { message = "Stage not found" });
            }
            
            return Ok(stage);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving stage {StageId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the stage" });
        }
    }
}
