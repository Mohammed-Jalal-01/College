namespace CollegeAPI.Services;

public interface ILoginAttemptService
{
    Task<bool> IsAccountLockedAsync(string email);
    Task RecordFailedLoginAttemptAsync(string email);
    Task ResetFailedLoginAttemptsAsync(string email);
    Task<int> GetFailedLoginAttemptsAsync(string email);
    Task UnlockAccountAsync(string email);
}
