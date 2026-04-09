# Middleware Pipeline - Technical Implementation

## Overview

The College Management System implements a carefully ordered middleware pipeline in ASP.NET Core to handle security headers, rate limiting, authentication, authorization, and request logging. The order of middleware execution is critical for proper application security and functionality.

## Technical Stack

- Framework: ASP.NET Core 8.0
- Logging: Serilog
- Caching: ASP.NET Core MemoryCache
- Authentication: JWT Bearer
- CORS: ASP.NET Core CORS middleware

## Middleware Execution Order

**File Location:** `server/Program.cs:73-93`

```csharp
var app = builder.Build();

// 1. Development-only middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 2. Request logging
app.UseSerilogRequestLogging();

// 3. Security headers (custom)
app.UseMiddleware<SecurityHeadersMiddleware>();

// 4. Rate limiting (custom)
app.UseMiddleware<RateLimitingMiddleware>();

// 5. Static files
app.UseStaticFiles();

// 6. CORS
app.UseCors("AllowFrontend");

// 7. Authentication
app.UseAuthentication();

// 8. Authorization
app.UseAuthorization();

// 9. Controller routing
app.MapControllers();
```

## Middleware Components

### 1. Swagger (Development Only)

**Purpose:** API documentation and testing interface

**Configuration:**

```csharp
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
```

**Behavior:**
- Only enabled in Development environment
- Provides interactive API documentation at `/swagger`
- Allows testing endpoints without external tools

### 2. Serilog Request Logging

**Purpose:** Log all HTTP requests and responses

**Configuration:**

```csharp
app.UseSerilogRequestLogging();
```

**Logged Information:**
- HTTP method and path
- Status code
- Response time
- Client IP address
- User agent

**Log Output:**

```
[INF] HTTP GET /api/news responded 200 in 45.2ms
[INF] HTTP POST /api/auth/login responded 401 in 120.5ms
[WRN] HTTP POST /api/auth/login responded 429 in 5.1ms
```

**Log File Location:** `server/logs/college-api-{Date}.txt`

### 3. Security Headers Middleware (Custom)

**Purpose:** Add security headers to all HTTP responses

**File Location:** `server/Middleware/SecurityHeadersMiddleware.cs`

**Implementation:**

```csharp
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Add security headers
        context.Response.Headers["X-Content-Type-Options"] = "nosniff";
        context.Response.Headers["X-Frame-Options"] = "DENY";
        context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
        context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
        context.Response.Headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()";
        
        context.Response.Headers["Content-Security-Policy"] = 
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: https:; " +
            "font-src 'self' data:; " +
            "connect-src 'self'; " +
            "frame-ancestors 'none'; " +
            "base-uri 'self'; " +
            "form-action 'self'";

        // HSTS only for HTTPS
        if (context.Request.IsHttps)
        {
            context.Response.Headers["Strict-Transport-Security"] = 
                "max-age=31536000; includeSubDomains";
        }

        await _next(context);
    }
}
```

**Headers Added:**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: Restricts browser features
- Content-Security-Policy: Restricts resource loading
- Strict-Transport-Security: Forces HTTPS (HTTPS only)

**Execution:** Before any other processing, ensures all responses have security headers

### 4. Rate Limiting Middleware (Custom)

**Purpose:** Prevent abuse by limiting requests per IP address

**File Location:** `server/Middleware/RateLimitingMiddleware.cs`

**Implementation:**

```csharp
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
                entry.AbsoluteExpirationRelativeToNow = 
                    TimeSpan.FromMinutes(rule.WindowMinutes);
                return 0;
            });

            if (requestCount >= rule.MaxRequests)
            {
                _logger.LogWarning("Rate limit exceeded for IP {IpAddress} on endpoint {Endpoint}", 
                    clientIp, endpoint);
                
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.ContentType = "application/json";
                
                await context.Response.WriteAsJsonAsync(new
                {
                    error = "Too many requests",
                    message = $"Rate limit exceeded. Please try again in {rule.WindowMinutes} minutes.",
                    retryAfter = rule.WindowMinutes * 60
                });
                
                return; // Short-circuit pipeline
            }

            _cache.Set(cacheKey, requestCount + 1, 
                TimeSpan.FromMinutes(rule.WindowMinutes));
        }

        await _next(context);
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
```

**Rate Limit Rules:**
- `/api/auth/login`: 5 requests per 15 minutes
- `/api/auth/register`: 3 requests per 60 minutes
- `/api/auth/*`: 10 requests per 15 minutes (catch-all)

**Behavior:**
- Tracks requests per IP address
- Returns 429 Too Many Requests when limit exceeded
- Provides retry-after information
- Logs rate limit violations

**Short-Circuit:** When rate limit exceeded, pipeline stops (doesn't proceed to next middleware)

### 5. Static Files Middleware

**Purpose:** Serve static files from wwwroot directory

**Configuration:**

```csharp
app.UseStaticFiles();
```

**Served Content:**
- Uploaded files: `/uploads/`
- Frontend assets (if hosted)
- Static resources

**Security Considerations:**
- Files served from wwwroot only
- No directory browsing enabled
- Content-Type headers set automatically

### 6. CORS Middleware

**Purpose:** Enable cross-origin requests from frontend

**Configuration:**

```csharp
// Service registration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Middleware usage
app.UseCors("AllowFrontend");
```

**Policy Details:**
- Allowed Origins: localhost:5173 (Vite), localhost:3000 (React)
- Allowed Headers: All
- Allowed Methods: All (GET, POST, PUT, DELETE, etc.)
- Credentials: Allowed (for cookies/auth headers)

**Preflight Requests:**
- Handles OPTIONS requests automatically
- Returns appropriate CORS headers
- Validates origin before processing

### 7. Authentication Middleware

**Purpose:** Validate JWT tokens and establish user identity

**Configuration:**

```csharp
// Service registration
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? 
                    throw new InvalidOperationException("JWT Key not configured")))
        };
    });

// Middleware usage
app.UseAuthentication();
```

**Process:**
1. Extract Authorization header
2. Validate Bearer token format
3. Verify token signature
4. Check token expiration
5. Validate issuer and audience
6. Extract claims and create ClaimsPrincipal
7. Set HttpContext.User

**Result:**
- Valid token: User identity established
- Invalid/missing token: User remains anonymous
- Expired token: 401 Unauthorized

### 8. Authorization Middleware

**Purpose:** Enforce access control policies

**Configuration:**

```csharp
// Service registration
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => 
        policy.RequireRole("Admin", "SuperAdmin"));
    options.AddPolicy("SuperAdminOnly", policy => 
        policy.RequireRole("SuperAdmin"));
});

// Middleware usage
app.UseAuthorization();
```

**Process:**
1. Check if endpoint requires authorization
2. If [AllowAnonymous], skip authorization
3. If [Authorize], check authentication
4. If policy specified, evaluate policy
5. Grant or deny access

**Result:**
- Authorized: Proceed to controller
- Unauthorized: 401 Unauthorized
- Forbidden: 403 Forbidden

### 9. Controller Routing

**Purpose:** Route requests to appropriate controller actions

**Configuration:**

```csharp
app.MapControllers();
```

**Process:**
1. Match request path to route template
2. Identify controller and action
3. Model binding (parameters, body)
4. Execute action method
5. Return response

## Middleware Order Importance

### Why Order Matters

**Security Headers First:**
- Applied to all responses (including errors)
- Ensures consistent security posture

**Rate Limiting Before Authentication:**
- Prevents brute force attacks
- Reduces load on authentication system
- Fails fast for abusive clients

**Static Files Before CORS:**
- Static files don't need CORS
- Improves performance

**CORS Before Authentication:**
- Handles preflight OPTIONS requests
- Allows unauthenticated CORS requests

**Authentication Before Authorization:**
- Identity must be established before checking permissions
- Authorization depends on authentication claims

**Routing Last:**
- Only reached if all security checks pass
- Actual business logic execution

### Incorrect Order Consequences

**Example: Authentication Before Rate Limiting**
```csharp
// WRONG ORDER
app.UseAuthentication();
app.UseMiddleware<RateLimitingMiddleware>();
```

**Problem:**
- Brute force attacks process authentication before rate limiting
- Increased server load
- Delayed attack detection

**Example: Authorization Before Authentication**
```csharp
// WRONG ORDER
app.UseAuthorization();
app.UseAuthentication();
```

**Problem:**
- Authorization has no user identity to check
- All requests fail authorization
- Application unusable

## Request Flow Example

### Successful Authenticated Request

```
1. Client sends: GET /api/news
   Headers: Authorization: Bearer <token>

2. Serilog logs request start

3. SecurityHeadersMiddleware adds headers to response

4. RateLimitingMiddleware checks IP rate limit
   - IP: 192.168.1.100
   - Endpoint: /api/news
   - Count: 3/10 (within limit)
   - Proceed

5. StaticFiles checks if /api/news is static file
   - Not a static file
   - Proceed

6. CORS checks origin
   - Origin: http://localhost:5173
   - Allowed
   - Add CORS headers
   - Proceed

7. Authentication validates JWT
   - Extract token from header
   - Validate signature ✓
   - Check expiration ✓
   - Extract claims
   - Set HttpContext.User
   - Proceed

8. Authorization checks policy
   - Endpoint: [AllowAnonymous]
   - Skip authorization
   - Proceed

9. Routing matches /api/news to NewsController.GetAll()
   - Execute controller action
   - Return news list

10. Response flows back through middleware
    - Security headers already added
    - CORS headers already added
    - Serilog logs response

11. Client receives: 200 OK with news data
```

### Rate Limited Request

```
1. Client sends: POST /api/auth/login (6th attempt in 15 min)

2. Serilog logs request start

3. SecurityHeadersMiddleware adds headers

4. RateLimitingMiddleware checks IP rate limit
   - IP: 192.168.1.100
   - Endpoint: /api/auth/login
   - Count: 5/5 (LIMIT EXCEEDED)
   - Log warning
   - Return 429 Too Many Requests
   - SHORT-CIRCUIT (stop pipeline)

5. Response returned immediately
   - No authentication attempted
   - No controller execution
   - Serilog logs 429 response

6. Client receives: 429 Too Many Requests
```

### Unauthorized Request

```
1. Client sends: POST /api/news (no token)

2-6. Security, Rate Limit, Static Files, CORS pass

7. Authentication checks for token
   - No Authorization header
   - User remains anonymous
   - Proceed

8. Authorization checks policy
   - Endpoint: [Authorize(Policy = "AdminOnly")]
   - User not authenticated
   - Return 401 Unauthorized
   - SHORT-CIRCUIT

9. Client receives: 401 Unauthorized
```

## Service Registration

**File Location:** `server/Program.cs:11-71`

```csharp
var builder = WebApplication.CreateBuilder(args);

// Logging
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/college-api-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(/* ... */);

// Authorization
builder.Services.AddAuthorization(/* ... */);

// AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Caching
builder.Services.AddMemoryCache();

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IDisplayIdGenerator, DisplayIdGenerator>();
builder.Services.AddScoped<IFileStorageService, FileStorageService>();
builder.Services.AddScoped<ILoginAttemptService, LoginAttemptService>();

// Controllers
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(/* ... */);
```

## Code References

**Backend:**
- Middleware Pipeline: `server/Program.cs:73-93`
- Service Registration: `server/Program.cs:11-71`
- Security Headers Middleware: `server/Middleware/SecurityHeadersMiddleware.cs:3-39`
- Rate Limiting Middleware: `server/Middleware/RateLimitingMiddleware.cs:6-100`
- Serilog Configuration: `server/Program.cs:13-18`

## Testing Considerations

**Key Test Scenarios:**
1. Middleware execution order
2. Rate limit enforcement
3. Security headers presence
4. CORS preflight handling
5. Authentication token validation
6. Authorization policy enforcement
7. Static file serving
8. Request logging

**Edge Cases:**
- Missing Authorization header
- Expired JWT token
- Invalid CORS origin
- Rate limit boundary conditions
- Concurrent requests from same IP
- Very large request bodies
- Malformed requests

## Performance Considerations

- In-memory cache for rate limiting (fast)
- Middleware short-circuits on failure (efficient)
- Static file caching
- Minimal overhead per middleware
- Async/await throughout pipeline

## Future Enhancements

- Implement distributed rate limiting (Redis)
- Add request/response compression
- Implement API versioning middleware
- Add request throttling middleware
- Implement circuit breaker pattern
- Add health check middleware
- Implement request validation middleware
- Add response caching middleware
- Implement API key authentication
- Add webhook signature validation
