using CollegeAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace CollegeAPI.Services;

public class DisplayIdGenerator : IDisplayIdGenerator
{
    private readonly ApplicationDbContext _context;

    public DisplayIdGenerator(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<string> GenerateUniqueDisplayIdAsync()
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"CS{year}";
        
        var lastUser = await _context.Users
            .Where(u => u.DisplayId.StartsWith(prefix))
            .OrderByDescending(u => u.DisplayId)
            .FirstOrDefaultAsync();

        int nextNumber = 1;
        if (lastUser != null)
        {
            var lastNumberStr = lastUser.DisplayId.Substring(prefix.Length);
            if (int.TryParse(lastNumberStr, out int lastNumber))
            {
                nextNumber = lastNumber + 1;
            }
        }

        var displayId = $"{prefix}{nextNumber:D4}";

        var exists = await _context.Users.AnyAsync(u => u.DisplayId == displayId);
        if (exists)
        {
            return await GenerateUniqueDisplayIdAsync();
        }

        return displayId;
    }
}
