# Authentication Implementation - Technical Details

## Overview

The College Management System implements JWT-based stateless authentication with BCrypt password hashing, login attempt tracking, and account lockout mechanisms. The system supports user registration, login, and secure token management.

## Technical Stack

- Primary technology: ASP.NET Core 8.0 Identity (JWT Bearer)
- Password hashing: BCrypt.Net 0.1.0
- Token format: JSON Web Tokens (JWT)
- Caching: ASP.NET Core MemoryCache
- Dependencies: Microsoft.AspNetCore.Authentication.JwtBearer 8.0

## Implementation Details

### Backend Implementation

**File Locations:**
- Auth Controller: `server/Controllers/AuthController.cs`
- Auth Service Interface: `server/Services/IAuthService.cs`
- Auth Service Implementation: `server/Services/AuthService.cs`
- Token Service Interface: `server/Services/ITokenService.cs`
- Token Service Implementation: `server/Services/TokenService.cs`
- Login Attempt Service Interface: `server/Services/ILoginAttemptService.cs`
- Login Attempt Service Implementation: `server/Services/LoginAttemptService.cs`
- Configuration: `server/Program.cs:25-39`

### JWT Token Generation

**TokenService.cs Implementation:**

```csharp
// server/Services/TokenService.cs:18-43
public string GenerateToken(User user)
{
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Name, user.ProfileName),
        new Claim(ClaimTypes.Role, user.Role),
        new Claim("UserType", user.UserType)
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
        _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured")));
    var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: _configuration["Jwt:Issuer"],
        audience: _configuration["Jwt:Audience"],
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(
            Convert.ToDouble(_configuration["Jwt:ExpirationInMinutes"] ?? "1440")),
        signingCredentials: credentials
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}
```

**Token Claims:**
- NameIdentifier: User's Guid ID
- Email: User's email address
- Name: User's profile name
- Role: User's role (Regular, Admin, SuperAdmin)
- UserType: User type (Student, Faculty)

**Signing Algorithm:** HMAC-SHA256 (HS256)

**Token Expiration:** 60 minutes (configurable via Jwt:ExpirationInMinutes)

### JWT Token Validation

**Program.cs Configuration:**

```csharp
// server/Program.cs:25-39
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
```

**Validation Parameters:**
- ValidateIssuer: Ensures token was issued by trusted authority
- ValidateAudience: Ensures token is intended for this application
- ValidateLifetime: Checks token expiration
- ValidateIssuerSigningKey: Verifies token signature

### Password Hashing with BCrypt

**Registration Implementation:**

```csharp
// server/Services/AuthService.cs:42
var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);
```

**Login Verification:**

```csharp
// server/Services/AuthService.cs:99
if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
{
    // Handle failed login
}
```

**BCrypt Features:**
- Automatic salt generation
- Configurable work factor (default: 10)
- Resistant to rainbow table attacks
- Adaptive hashing (slower over time as hardware improves)

### Login Attempt Tracking

**LoginAttemptService.cs Implementation:**

```csharp
// server/Services/LoginAttemptService.cs:5-70
public class LoginAttemptService : ILoginAttemptService
{
    private readonly IMemoryCache _cache;
    private const int MaxFailedAttempts = 5;
    private const int LockoutDurationMinutes = 30;
    private const int FailedAttemptExpirationMinutes = 15;

    public Task<bool> IsAccountLockedAsync(string email)
    {
        var lockoutKey = $"lockout_{email}";
        var isLocked = _cache.TryGetValue(lockoutKey, out DateTime lockoutExpiry) 
            && lockoutExpiry > DateTime.UtcNow;
        return Task.FromResult(isLocked);
    }

    public Task RecordFailedLoginAttemptAsync(string email)
    {
        var attemptsKey = $"attempts_{email}";
        var lockoutKey = $"lockout_{email}";

        var attempts = _cache.GetOrCreate(attemptsKey, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = 
                TimeSpan.FromMinutes(FailedAttemptExpirationMinutes);
            return 0;
        });

        attempts++;
        _cache.Set(attemptsKey, attempts, 
            TimeSpan.FromMinutes(FailedAttemptExpirationMinutes));

        if (attempts >= MaxFailedAttempts)
        {
            var lockoutExpiry = DateTime.UtcNow.AddMinutes(LockoutDurationMinutes);
            _cache.Set(lockoutKey, lockoutExpiry, 
                TimeSpan.FromMinutes(LockoutDurationMinutes));
            _cache.Remove(attemptsKey);
        }

        return Task.CompletedTask;
    }
}
```

**Tracking Mechanism:**
- Uses in-memory cache with email-based keys
- Tracks failed attempts with 15-minute expiration
- Locks account for 30 minutes after 5 failed attempts
- Automatically resets attempts after successful login

### Account Lockout Logic

**Lockout Flow:**

1. User fails login → RecordFailedLoginAttemptAsync called
2. Attempt count incremented in cache
3. If attempts >= 5 → Account locked for 30 minutes
4. Subsequent login attempts blocked during lockout
5. After 30 minutes → Lockout automatically expires
6. Successful login → All attempts reset

**Cache Keys:**
- `attempts_{email}`: Stores failed attempt count
- `lockout_{email}`: Stores lockout expiration timestamp

### User Registration Flow

**AuthService.cs RegisterAsync Method:**

```csharp
// server/Services/AuthService.cs:23-83
public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
{
    // 1. Check email uniqueness
    var existingUser = await _userRepository.GetByEmailAsync(registerDto.Email);
    if (existingUser != null)
    {
        throw new InvalidOperationException("Email already exists");
    }

    // 2. Validate user type
    if (registerDto.UserType != "Student" && registerDto.UserType != "Faculty")
    {
        throw new InvalidOperationException("Invalid user type");
    }

    // 3. Validate password strength
    var passwordValidation = PasswordValidator.ValidatePassword(registerDto.Password);
    if (!passwordValidation.IsValid)
    {
        throw new InvalidOperationException(
            $"Password validation failed: {string.Join(", ", passwordValidation.Errors)}");
    }

    // 4. Hash password
    var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);
    
    // 5. Generate unique display ID
    var displayId = await _displayIdGenerator.GenerateUniqueDisplayIdAsync();

    // 6. Create user entity
    var user = new User
    {
        Id = Guid.NewGuid(),
        DisplayId = displayId,
        ProfileName = registerDto.ProfileName,
        Email = registerDto.Email,
        PasswordHash = passwordHash,
        UserType = registerDto.UserType,
        Role = "Regular",
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    await _userRepository.CreateAsync(user);

    // 7. Create Faculty record if applicable
    if (registerDto.UserType == "Faculty")
    {
        var faculty = new Faculty
        {
            Id = Guid.NewGuid(),
            UserId = user.Id
        };
        await _userRepository.CreateFacultyAsync(faculty);
    }

    // 8. Generate JWT token
    var token = _tokenService.GenerateToken(user);

    // 9. Return auth response
    return new AuthResponseDto
    {
        Token = token,
        Email = user.Email,
        ProfileName = user.ProfileName,
        DisplayId = user.DisplayId,
        UserType = user.UserType,
        Role = user.Role,
        UserId = user.Id,
        RequiresStudentInfo = registerDto.UserType == "Student"
    };
}
```

### User Login Flow

**AuthService.cs LoginAsync Method:**

```csharp
// server/Services/AuthService.cs:85-135
public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
{
    // 1. Check account lockout
    if (await _loginAttemptService.IsAccountLockedAsync(loginDto.Email))
    {
        throw new UnauthorizedAccessException(
            "Account is locked due to too many failed login attempts. Please try again in 30 minutes.");
    }

    // 2. Retrieve user by email
    var user = await _userRepository.GetByEmailAsync(loginDto.Email);
    if (user == null)
    {
        await _loginAttemptService.RecordFailedLoginAttemptAsync(loginDto.Email);
        throw new UnauthorizedAccessException("Invalid email or password");
    }

    // 3. Verify password
    if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
    {
        await _loginAttemptService.RecordFailedLoginAttemptAsync(loginDto.Email);
        var attempts = await _loginAttemptService.GetFailedLoginAttemptsAsync(loginDto.Email);
        var remainingAttempts = 5 - attempts;
        
        if (remainingAttempts > 0)
        {
            throw new UnauthorizedAccessException(
                $"Invalid email or password. {remainingAttempts} attempts remaining before account lockout.");
        }
        
        throw new UnauthorizedAccessException("Invalid email or password");
    }

    // 4. Reset failed attempts on successful login
    await _loginAttemptService.ResetFailedLoginAttemptsAsync(loginDto.Email);

    // 5. Generate JWT token
    var token = _tokenService.GenerateToken(user);

    // 6. Check if student info required
    var requiresStudentInfo = false;
    if (user.UserType == "Student")
    {
        var student = await _userRepository.GetStudentByUserIdAsync(user.Id);
        requiresStudentInfo = student == null;
    }

    // 7. Return auth response
    return new AuthResponseDto
    {
        Token = token,
        Email = user.Email,
        ProfileName = user.ProfileName,
        DisplayId = user.DisplayId,
        UserType = user.UserType,
        Role = user.Role,
        UserId = user.Id,
        RequiresStudentInfo = requiresStudentInfo
    };
}
```

### Frontend Implementation

**Component Locations:**
- Auth Context: `client/src/contexts/AuthContext.jsx`
- Login Page: `client/src/pages/auth/LoginPage.jsx`
- Register Page: `client/src/pages/auth/RegisterPage.jsx`
- Auth Service: `client/src/services/authService.js`

**AuthContext Implementation:**

```javascript
// client/src/contexts/AuthContext.jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response));
    setUser(response);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Token Storage:**
- Stored in localStorage
- Included in Authorization header for API requests
- Automatically removed on logout

## Architecture Pattern

**Pattern:** Service-Repository Pattern with Dependency Injection

**Data Flow:**
```
Client Request
    ↓
AuthController (API Endpoint)
    ↓
AuthService (Business Logic)
    ↓
├─→ PasswordValidator (Validation)
├─→ LoginAttemptService (Security)
├─→ UserRepository (Data Access)
└─→ TokenService (JWT Generation)
    ↓
Database / Cache
```

## Configuration

**Required Settings:**

```json
{
  "Jwt": {
    "Key": "REPLACE_WITH_USER_SECRETS",
    "Issuer": "CollegeAPI",
    "Audience": "CollegeClient",
    "ExpirationInMinutes": 60
  }
}
```

**Environment Variables (Production):**
- `Jwt__Key`: JWT signing key (minimum 32 bytes, base64 encoded)
- `Jwt__Issuer`: Token issuer identifier
- `Jwt__Audience`: Token audience identifier
- `Jwt__ExpirationInMinutes`: Token lifetime in minutes

**Secrets Management:**

**Development:**
```bash
dotnet user-secrets set "Jwt:Key" "your-generated-key"
```

**Production:**
```bash
export Jwt__Key="your-generated-key"
```

## Security Considerations

**Password Security:**
- BCrypt hashing with automatic salting
- Minimum 8 characters enforced
- Password strength validation (see SECURITY_FEATURES.md)
- Passwords never logged or exposed

**Token Security:**
- HMAC-SHA256 signing algorithm
- 60-minute expiration (configurable)
- Issuer and audience validation
- Secure key storage (User Secrets / Environment Variables)

**Brute Force Protection:**
- Account lockout after 5 failed attempts
- 30-minute lockout duration
- Failed attempts expire after 15 minutes
- User feedback on remaining attempts

**Session Management:**
- Stateless JWT tokens (no server-side sessions)
- Token stored in localStorage (frontend)
- Automatic token inclusion in API requests
- Manual logout clears token

## API Endpoints

### POST /api/auth/register

**Authentication:** Not Required

**Request:**
```json
{
  "profileName": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string",
  "userType": "Student" | "Faculty"
}
```

**Response:**
```json
{
  "token": "string",
  "email": "string",
  "profileName": "string",
  "displayId": "string",
  "userType": "string",
  "role": "string",
  "userId": "guid",
  "requiresStudentInfo": boolean
}
```

**Error Responses:**
- 400: Email already exists, Invalid user type, Password validation failed
- 500: Internal server error

### POST /api/auth/login

**Authentication:** Not Required

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "email": "string",
  "profileName": "string",
  "displayId": "string",
  "userType": "string",
  "role": "string",
  "userId": "guid",
  "requiresStudentInfo": boolean
}
```

**Error Responses:**
- 401: Invalid email or password, Account locked
- 500: Internal server error

## Code References

**Backend:**
- Auth Controller: `server/Controllers/AuthController.cs:11-119`
- Auth Service: `server/Services/AuthService.cs:8-176`
- Token Service: `server/Services/TokenService.cs:9-44`
- Login Attempt Service: `server/Services/LoginAttemptService.cs:5-70`
- JWT Configuration: `server/Program.cs:25-39`
- Service Registration: `server/Program.cs:51-56`

**Frontend:**
- Auth Context: `client/src/contexts/AuthContext.jsx`
- Auth Service: `client/src/services/authService.js`
- Login Page: `client/src/pages/auth/LoginPage.jsx`
- Register Page: `client/src/pages/auth/RegisterPage.jsx`

## Testing Considerations

**Key Test Scenarios:**
1. Successful registration with valid credentials
2. Registration with duplicate email (should fail)
3. Successful login with correct credentials
4. Login with incorrect password (track attempts)
5. Account lockout after 5 failed attempts
6. Login during lockout period (should fail)
7. Login after lockout expiration (should succeed)
8. Token generation and validation
9. Token expiration handling
10. Password strength validation

**Edge Cases:**
- Concurrent login attempts from same email
- Token expiration during active session
- Cache eviction during lockout period
- Special characters in password
- Very long email addresses
- Case sensitivity in email addresses

## Performance Considerations

- In-memory cache for login attempts (fast lookups)
- BCrypt work factor balanced for security and performance
- Stateless JWT tokens (no database lookups for validation)
- Token expiration reduces long-term storage needs

## Future Enhancements

- Implement refresh tokens for extended sessions
- Add two-factor authentication (2FA)
- Implement password reset functionality
- Add email verification during registration
- Implement "Remember Me" functionality with longer token expiration
- Add device tracking and management
- Implement suspicious login detection
- Add CAPTCHA after multiple failed attempts
- Implement session management dashboard
- Add OAuth2/OpenID Connect support for social login
