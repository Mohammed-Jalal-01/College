using Microsoft.Extensions.Caching.Memory;

namespace CollegeAPI.Services;

public class LoginAttemptService : ILoginAttemptService
{
    private readonly IMemoryCache _cache;
    private const int MaxFailedAttempts = 5;
    private const int LockoutDurationMinutes = 30;
    private const int FailedAttemptExpirationMinutes = 15;

    public LoginAttemptService(IMemoryCache cache)
    {
        _cache = cache;
    }

    public Task<bool> IsAccountLockedAsync(string email)
    {
        var lockoutKey = $"lockout_{email}";
        var isLocked = _cache.TryGetValue(lockoutKey, out DateTime lockoutExpiry) && lockoutExpiry > DateTime.UtcNow;
        return Task.FromResult(isLocked);
    }

    public Task RecordFailedLoginAttemptAsync(string email)
    {
        var attemptsKey = $"attempts_{email}";
        var lockoutKey = $"lockout_{email}";

        var attempts = _cache.GetOrCreate(attemptsKey, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(FailedAttemptExpirationMinutes);
            return 0;
        });

        attempts++;
        _cache.Set(attemptsKey, attempts, TimeSpan.FromMinutes(FailedAttemptExpirationMinutes));

        if (attempts >= MaxFailedAttempts)
        {
            var lockoutExpiry = DateTime.UtcNow.AddMinutes(LockoutDurationMinutes);
            _cache.Set(lockoutKey, lockoutExpiry, TimeSpan.FromMinutes(LockoutDurationMinutes));
            _cache.Remove(attemptsKey);
        }

        return Task.CompletedTask;
    }

    public Task ResetFailedLoginAttemptsAsync(string email)
    {
        var attemptsKey = $"attempts_{email}";
        _cache.Remove(attemptsKey);
        return Task.CompletedTask;
    }

    public Task<int> GetFailedLoginAttemptsAsync(string email)
    {
        var attemptsKey = $"attempts_{email}";
        var attempts = _cache.TryGetValue(attemptsKey, out int value) ? value : 0;
        return Task.FromResult(attempts);
    }

    public Task UnlockAccountAsync(string email)
    {
        var lockoutKey = $"lockout_{email}";
        var attemptsKey = $"attempts_{email}";
        _cache.Remove(lockoutKey);
        _cache.Remove(attemptsKey);
        return Task.CompletedTask;
    }
}
