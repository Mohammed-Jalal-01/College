using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CollegeAPI.Data;

namespace CollegeAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BranchesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<BranchesController> _logger;

    public BranchesController(ApplicationDbContext context, ILogger<BranchesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var branches = await _context.Branches
                .OrderBy(b => b.NameEn)
                .ToListAsync();
            
            return Ok(branches);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving branches");
            return StatusCode(500, new { message = "An error occurred while retrieving branches" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var branch = await _context.Branches.FindAsync(id);
            
            if (branch == null)
            {
                return NotFound(new { message = "Branch not found" });
            }
            
            return Ok(branch);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving branch {BranchId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the branch" });
        }
    }
}
