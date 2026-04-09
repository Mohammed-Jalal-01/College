using Microsoft.Extensions.Caching.Memory;
using System.Net;

namespace CollegeAPI.Middleware;

public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IMemoryCache _cache;
    private readonly ILogger<RateLimitingMiddleware> _logger;

    private static readonly Dictionary<string, RateLimitRule> RateLimitRules = new()
    {
        { "/api/auth/login", new RateLimitRule { MaxRequests = 5, WindowMinutes = 15 } },
        { "/api/auth/register", new RateLimitRule { MaxRequests = 3, WindowMinutes = 60 } },
        { "/api/auth", new RateLimitRule { MaxRequests = 10, WindowMinutes = 15 } }
    };

    public RateLimitingMiddleware(RequestDelegate next, IMemoryCache cache, ILogger<RateLimitingMiddleware> logger)
    {
        _next = next;
        _cache = cache;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var endpoint = context.Request.Path.Value?.ToLower() ?? string.Empty;
        var clientIp = GetClientIpAddress(context);

        var rule = GetRateLimitRule(endpoint);
        if (rule != null)
        {
            var cacheKey = $"ratelimit_{clientIp}_{endpoint}";
            
            var requestCount = _cache.GetOrCreate(cacheKey, entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(rule.WindowMinutes);
                return 0;
            });

            if (requestCount >= rule.MaxRequests)
            {
                _logger.LogWarning("Rate limit exceeded for IP {IpAddress} on endpoint {Endpoint}", clientIp, endpoint);
                
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.ContentType = "application/json";
                
                await context.Response.WriteAsJsonAsync(new
                {
                    error = "Too many requests",
                    message = $"Rate limit exceeded. Please try again in {rule.WindowMinutes} minutes.",
                    retryAfter = rule.WindowMinutes * 60
                });
                
                return;
            }

            _cache.Set(cacheKey, requestCount + 1, TimeSpan.FromMinutes(rule.WindowMinutes));
        }

        await _next(context);
    }

    private RateLimitRule? GetRateLimitRule(string endpoint)
    {
        foreach (var rule in RateLimitRules)
        {
            if (endpoint.StartsWith(rule.Key, StringComparison.OrdinalIgnoreCase))
            {
                return rule.Value;
            }
        }
        return null;
    }

    private string GetClientIpAddress(HttpContext context)
    {
        var ipAddress = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        
        if (string.IsNullOrEmpty(ipAddress))
        {
            ipAddress = context.Request.Headers["X-Real-IP"].FirstOrDefault();
        }
        
        if (string.IsNullOrEmpty(ipAddress))
        {
            ipAddress = context.Connection.RemoteIpAddress?.ToString();
        }

        return ipAddress ?? "unknown";
    }
}

public class RateLimitRule
{
    public int MaxRequests { get; set; }
    public int WindowMinutes { get; set; }
}
