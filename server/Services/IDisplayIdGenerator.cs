namespace CollegeAPI.Services;

public interface IDisplayIdGenerator
{
    Task<string> GenerateUniqueDisplayIdAsync();
}
