using Microsoft.Extensions.Caching.Memory;
using System.Net;

namespace CollegeAPI.Middleware;

public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IMemoryCache _cache;
    private readonly ILogger<RateLimitingMiddleware> _logger;
    private readonly bool _enabled;
    private readonly Dictionary<string, RateLimitRule> _rateLimitRules;

    private static readonly Dictionary<string, RateLimitRule> DefaultRateLimitRules = new()
    {
        { "/api/auth/login", new RateLimitRule { MaxRequests = 5, WindowMinutes = 15 } },
        { "/api/auth/register", new RateLimitRule { MaxRequests = 50, WindowMinutes = 60 } },
        { "/api/auth", new RateLimitRule { MaxRequests = 10, WindowMinutes = 15 } }
    };

    public RateLimitingMiddleware(
        RequestDelegate next,
        IMemoryCache cache,
        ILogger<RateLimitingMiddleware> logger,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        _next = next;
        _cache = cache;
        _logger = logger;

        var section = configuration.GetSection("RateLimiting");

        // Default behaviour: rate limiting is disabled in Development (to allow
        // feature/usage testing) and enabled in all other environments. This can
        // be overridden explicitly via the RateLimiting:Enabled configuration key.
        _enabled = section.GetValue<bool?>("Enabled") ?? !environment.IsDevelopment();

        // Allow per-endpoint limits to be tuned via configuration, falling back to
        // the secure defaults when not specified.
        _rateLimitRules = new Dictionary<string, RateLimitRule>(DefaultRateLimitRules);
        var rulesSection = section.GetSection("Rules");
        if (rulesSection.Exists())
        {
            foreach (var ruleConfig in rulesSection.GetChildren())
            {
                var path = ruleConfig.GetValue<string>("Path");
                var maxRequests = ruleConfig.GetValue<int?>("MaxRequests");
                var windowMinutes = ruleConfig.GetValue<int?>("WindowMinutes");

                if (!string.IsNullOrWhiteSpace(path) && maxRequests.HasValue && windowMinutes.HasValue)
                {
                    _rateLimitRules[path.ToLower()] = new RateLimitRule
                    {
                        MaxRequests = maxRequests.Value,
                        WindowMinutes = windowMinutes.Value
                    };
                }
            }
        }

        if (!_enabled)
        {
            _logger.LogWarning("Rate limiting is DISABLED. This should only be used in non-production environments.");
        }
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!_enabled)
        {
            await _next(context);
            return;
        }

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
        foreach (var rule in _rateLimitRules)
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
