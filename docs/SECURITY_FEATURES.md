# Security Features - Technical Implementation

## Overview

The College Management System implements comprehensive security hardening measures including password strength validation, rate limiting, security headers, file upload security, and protection against common web vulnerabilities.

## Technical Stack

- Password Validation: Custom validator with regex patterns
- Rate Limiting: ASP.NET Core MemoryCache
- Security Headers: Custom middleware
- File Validation: Magic byte verification
- CORS: ASP.NET Core CORS middleware
- Input Validation: Data Annotations and custom validators

## Password Strength Validation

### Implementation

**File Location:** `server/Validators/PasswordValidator.cs`

```csharp
// server/Validators/PasswordValidator.cs:16-82
public static PasswordValidationResult ValidatePassword(string password)
{
    var result = new PasswordValidationResult { IsValid = true };

    // Length validation
    if (password.Length < 8)
    {
        result.IsValid = false;
        result.Errors.Add("Password must be at least 8 characters long");
    }

    if (password.Length > 128)
    {
        result.IsValid = false;
        result.Errors.Add("Password must not exceed 128 characters");
    }

    // Character type validation
    if (!Regex.IsMatch(password, @"[A-Z]"))
    {
        result.IsValid = false;
        result.Errors.Add("Password must contain at least one uppercase letter");
    }

    if (!Regex.IsMatch(password, @"[a-z]"))
    {
        result.IsValid = false;
        result.Errors.Add("Password must contain at least one lowercase letter");
    }

    if (!Regex.IsMatch(password, @"[0-9]"))
    {
        result.IsValid = false;
        result.Errors.Add("Password must contain at least one number");
    }

    if (!Regex.IsMatch(password, @"[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]"))
    {
        result.IsValid = false;
        result.Errors.Add("Password must contain at least one special character");
    }

    // Common password check
    if (ContainsCommonPassword(password))
    {
        result.IsValid = false;
        result.Errors.Add("Password is too common. Please choose a more secure password");
    }

    // Pattern validation
    if (HasRepeatingCharacters(password))
    {
        result.IsValid = false;
        result.Errors.Add("Password contains too many repeating characters");
    }

    if (HasSequentialCharacters(password))
    {
        result.IsValid = false;
        result.Errors.Add("Password contains sequential characters (e.g., 'abc', '123')");
    }

    return result;
}
```

### Validation Rules

**Length Requirements:**
- Minimum: 8 characters
- Maximum: 128 characters

**Character Requirements:**
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 digit (0-9)
- At least 1 special character (!@#$%^&*()_+-=[]{}etc.)

**Pattern Restrictions:**
- No common passwords (34 patterns blacklisted)
- No repeating characters (e.g., "aaa")
- No sequential characters (e.g., "abc", "123")

### Common Password Blacklist

```csharp
// server/Validators/PasswordValidator.cs:7-14
private static readonly string[] CommonPasswords = new[]
{
    "password", "123456", "12345678", "qwerty", "abc123", "monkey", "1234567",
    "letmein", "trustno1", "dragon", "baseball", "iloveyou", "master", "sunshine",
    "ashley", "bailey", "passw0rd", "shadow", "123123", "654321", "superman",
    "qazwsx", "michael", "football", "welcome", "jesus", "ninja", "mustang",
    "password1", "123456789", "password123", "admin", "root", "toor"
};
```

### Repeating Characters Detection

```csharp
// server/Validators/PasswordValidator.cs:90-100
private static bool HasRepeatingCharacters(string password)
{
    for (int i = 0; i < password.Length - 2; i++)
    {
        if (password[i] == password[i + 1] && password[i] == password[i + 2])
        {
            return true;  // Found 3 consecutive identical characters
        }
    }
    return false;
}
```

### Sequential Characters Detection

```csharp
// server/Validators/PasswordValidator.cs:102-115
private static bool HasSequentialCharacters(string password)
{
    var lowerPassword = password.ToLower();
    
    for (int i = 0; i < lowerPassword.Length - 2; i++)
    {
        if (lowerPassword[i] + 1 == lowerPassword[i + 1] && 
            lowerPassword[i + 1] + 1 == lowerPassword[i + 2])
        {
            return true;  // Found sequential characters (abc, 123, etc.)
        }
    }
    return false;
}
```

### Password Strength Calculator

```csharp
// server/Validators/PasswordValidator.cs:117-135
public static int CalculatePasswordStrength(string password)
{
    int strength = 0;

    if (password.Length >= 8) strength += 1;
    if (password.Length >= 12) strength += 1;
    if (password.Length >= 16) strength += 1;
    
    if (Regex.IsMatch(password, @"[a-z]")) strength += 1;
    if (Regex.IsMatch(password, @"[A-Z]")) strength += 1;
    if (Regex.IsMatch(password, @"[0-9]")) strength += 1;
    if (Regex.IsMatch(password, @"[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]")) strength += 2;

    if (!ContainsCommonPassword(password)) strength += 1;
    if (!HasRepeatingCharacters(password)) strength += 1;
    if (!HasSequentialCharacters(password)) strength += 1;

    return Math.Min(strength, 10);  // Max strength: 10
}
```

## Rate Limiting

### Implementation

**File Location:** `server/Middleware/RateLimitingMiddleware.cs`

```csharp
// server/Middleware/RateLimitingMiddleware.cs:12-17
private static readonly Dictionary<string, RateLimitRule> RateLimitRules = new()
{
    { "/api/auth/login", new RateLimitRule { MaxRequests = 5, WindowMinutes = 15 } },
    { "/api/auth/register", new RateLimitRule { MaxRequests = 3, WindowMinutes = 60 } },
    { "/api/auth", new RateLimitRule { MaxRequests = 10, WindowMinutes = 15 } }
};
```

### Rate Limit Rules

| Endpoint | Max Requests | Time Window | Purpose |
|----------|--------------|-------------|---------|
| /api/auth/login | 5 | 15 minutes | Prevent brute force attacks |
| /api/auth/register | 3 | 60 minutes | Prevent spam registrations |
| /api/auth/* | 10 | 15 minutes | General auth endpoint protection |

### Rate Limiting Logic

```csharp
// server/Middleware/RateLimitingMiddleware.cs:26-63
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
            
            return;
        }

        _cache.Set(cacheKey, requestCount + 1, TimeSpan.FromMinutes(rule.WindowMinutes));
    }

    await _next(context);
}
```

### IP Address Detection

```csharp
// server/Middleware/RateLimitingMiddleware.cs:77-92
private string GetClientIpAddress(HttpContext context)
{
    // Check X-Forwarded-For header (proxy/load balancer)
    var ipAddress = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
    
    // Check X-Real-IP header (nginx)
    if (string.IsNullOrEmpty(ipAddress))
    {
        ipAddress = context.Request.Headers["X-Real-IP"].FirstOrDefault();
    }
    
    // Fallback to connection remote IP
    if (string.IsNullOrEmpty(ipAddress))
    {
        ipAddress = context.Connection.RemoteIpAddress?.ToString();
    }

    return ipAddress ?? "unknown";
}
```

## Security Headers

### Implementation

**File Location:** `server/Middleware/SecurityHeadersMiddleware.cs`

```csharp
// server/Middleware/SecurityHeadersMiddleware.cs:12-37
public async Task InvokeAsync(HttpContext context)
{
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

    if (context.Request.IsHttps)
    {
        context.Response.Headers["Strict-Transport-Security"] = 
            "max-age=31536000; includeSubDomains";
    }

    await _next(context);
}
```

### Header Descriptions

**X-Content-Type-Options: nosniff**
- Prevents MIME type sniffing
- Forces browser to respect declared content type
- Protects against MIME confusion attacks

**X-Frame-Options: DENY**
- Prevents page from being embedded in iframe
- Protects against clickjacking attacks
- Ensures page cannot be framed by any site

**X-XSS-Protection: 1; mode=block**
- Enables browser XSS filter
- Blocks page if XSS attack detected
- Legacy protection for older browsers

**Referrer-Policy: strict-origin-when-cross-origin**
- Controls referrer information sent
- Full URL for same-origin requests
- Only origin for cross-origin requests

**Permissions-Policy: geolocation=(), microphone=(), camera=()**
- Disables geolocation API
- Disables microphone access
- Disables camera access

**Content-Security-Policy**
- Restricts resource loading sources
- Allows self-hosted resources
- Prevents inline script execution (with exceptions for compatibility)
- Prevents clickjacking via frame-ancestors

**Strict-Transport-Security: max-age=31536000; includeSubDomains**
- Forces HTTPS for 1 year
- Applies to all subdomains
- Only sent over HTTPS connections

## File Upload Security

### Implementation

**File Location:** `server/Services/FileStorageService.cs`

### Size Validation

```csharp
// server/Services/FileStorageService.cs:7
private const long MaxFileSize = 52428800;  // 50MB

// server/Services/FileStorageService.cs:35-38
if (file.Length > MaxFileSize)
{
    throw new ArgumentException(
        $"File size exceeds maximum allowed size of {MaxFileSize / 1024 / 1024}MB");
}
```

### Extension Whitelisting

```csharp
// server/Services/FileStorageService.cs:47-51
var allowedExtensions = new[] { 
    ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".zip", ".rar" 
};
if (!allowedExtensions.Contains(extension))
{
    throw new ArgumentException($"File type {extension} is not allowed");
}
```

### Magic Byte Validation

```csharp
// server/Services/FileStorageService.cs:9-18
private static readonly Dictionary<string, List<byte[]>> FileSignatures = new()
{
    { ".pdf", new List<byte[]> { new byte[] { 0x25, 0x50, 0x44, 0x46 } } },
    { ".doc", new List<byte[]> { new byte[] { 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1 } } },
    { ".docx", new List<byte[]> { new byte[] { 0x50, 0x4B, 0x03, 0x04 }, new byte[] { 0x50, 0x4B, 0x05, 0x06 } } },
    { ".xlsx", new List<byte[]> { new byte[] { 0x50, 0x4B, 0x03, 0x04 }, new byte[] { 0x50, 0x4B, 0x05, 0x06 } } },
    { ".pptx", new List<byte[]> { new byte[] { 0x50, 0x4B, 0x03, 0x04 }, new byte[] { 0x50, 0x4B, 0x05, 0x06 } } },
    { ".zip", new List<byte[]> { new byte[] { 0x50, 0x4B, 0x03, 0x04 }, new byte[] { 0x50, 0x4B, 0x05, 0x06 } } },
    { ".rar", new List<byte[]> { new byte[] { 0x52, 0x61, 0x72, 0x21, 0x1A, 0x07 } } }
};

// server/Services/FileStorageService.cs:92-114
private async Task<bool> ValidateFileContentAsync(IFormFile file, string extension)
{
    if (!FileSignatures.ContainsKey(extension))
    {
        return true;
    }

    using var reader = new BinaryReader(file.OpenReadStream());
    var headerBytes = reader.ReadBytes(8);
    
    file.OpenReadStream().Position = 0;

    var signatures = FileSignatures[extension];
    foreach (var signature in signatures)
    {
        if (headerBytes.Take(signature.Length).SequenceEqual(signature))
        {
            return true;
        }
    }

    return false;  // Content doesn't match extension
}
```

### Filename Sanitization

```csharp
// server/Services/FileStorageService.cs:66-72
var safeFileName = Path.GetFileNameWithoutExtension(file.FileName)
    .Replace(" ", "_")      // Replace spaces
    .Replace("..", "")      // Remove directory traversal
    .Replace("/", "")       // Remove path separators
    .Replace("\\", "");     // Remove Windows path separators

var uniqueFileName = $"{Guid.NewGuid()}_{safeFileName}{extension}";
```

**Security Benefits:**
- Prevents directory traversal attacks
- Ensures unique filenames (no overwrites)
- Removes dangerous characters
- Preserves original filename for reference

## CORS Configuration

**File Location:** `server/Program.cs:62-71`

```csharp
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
```

**Configuration:**
- Allowed Origins: localhost:5173 (Vite), localhost:3000 (React)
- Allowed Headers: All
- Allowed Methods: All (GET, POST, PUT, DELETE, etc.)
- Credentials: Allowed (for cookies/auth headers)

**Production Recommendation:**
- Replace localhost with actual domain
- Restrict allowed methods if possible
- Consider specific header restrictions

## SQL Injection Prevention

**Protection Mechanism:** Entity Framework Core with parameterized queries

**Example Safe Query:**

```csharp
// server/Repositories/UserRepository.cs:24-29
public async Task<User?> GetByEmailAsync(string email)
{
    return await _context.Users
        .Include(u => u.Student)
        .Include(u => u.Faculty)
        .FirstOrDefaultAsync(u => u.Email == email);
}
```

**Why It's Safe:**
- EF Core automatically parameterizes queries
- User input never concatenated into SQL strings
- LINQ expressions compiled to safe SQL

## XSS Protection

**Backend Protection:**
- Security headers (X-XSS-Protection, CSP)
- No HTML rendering on backend
- JSON responses only

**Frontend Protection:**
- React automatic escaping
- No dangerouslySetInnerHTML usage
- Content Security Policy enforcement

## Input Validation

**Data Annotations:**

```csharp
// server/Models/DTOs/RegisterDto.cs
[Required]
[EmailAddress]
[MaxLength(255)]
public string Email { get; set; } = string.Empty;

[Required]
[MinLength(8)]
public string Password { get; set; } = string.Empty;
```

**Custom Validators:**
- PasswordValidator for password strength
- Email format validation
- Length constraints on all string fields

## Middleware Pipeline Order

**File Location:** `server/Program.cs:83-91`

```csharp
app.UseMiddleware<SecurityHeadersMiddleware>();  // 1. Add security headers
app.UseMiddleware<RateLimitingMiddleware>();     // 2. Rate limiting
app.UseStaticFiles();                            // 3. Serve static files
app.UseCors("AllowFrontend");                    // 4. CORS
app.UseAuthentication();                         // 5. Authentication
app.UseAuthorization();                          // 6. Authorization
app.MapControllers();                            // 7. Route to controllers
```

**Order Importance:**
- Security headers applied first (all responses)
- Rate limiting before authentication (prevent DoS)
- CORS before authentication (preflight requests)
- Authentication before authorization (identity required)

## Code References

**Backend:**
- Password Validator: `server/Validators/PasswordValidator.cs:5-143`
- Rate Limiting Middleware: `server/Middleware/RateLimitingMiddleware.cs:6-100`
- Security Headers Middleware: `server/Middleware/SecurityHeadersMiddleware.cs:3-39`
- File Storage Service: `server/Services/FileStorageService.cs:3-148`
- CORS Configuration: `server/Program.cs:62-71`
- Middleware Pipeline: `server/Program.cs:83-91`

## Testing Considerations

**Key Test Scenarios:**
1. Password validation with various invalid patterns
2. Rate limit enforcement after max requests
3. Security headers present in all responses
4. File upload with wrong extension
5. File upload with mismatched content (fake extension)
6. CORS preflight requests
7. SQL injection attempts
8. XSS payload attempts

**Edge Cases:**
- Password with unicode characters
- Very large file uploads
- Concurrent requests from same IP
- Proxy/load balancer IP forwarding
- File with no extension
- File with multiple extensions

## Performance Considerations

- In-memory cache for rate limiting (fast lookups)
- Magic byte validation only reads first 8 bytes
- Regex compilation for password validation
- Middleware executes in order (early exit for rate limits)

## Future Enhancements

- Implement distributed rate limiting (Redis)
- Add CAPTCHA after failed attempts
- Implement file virus scanning
- Add request signature validation
- Implement IP whitelisting/blacklisting
- Add anomaly detection for suspicious patterns
- Implement WAF (Web Application Firewall) rules
- Add security event monitoring and alerting
- Implement automated security scanning
- Add penetration testing integration
