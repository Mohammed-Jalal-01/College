using CollegeAPI.Models.Entities;

namespace CollegeAPI.Services;

public interface ITokenService
{
    string GenerateToken(User user);
}
