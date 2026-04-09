# User Management - Technical Implementation

## Overview

The College Management System implements comprehensive user lifecycle management including registration, profile management, display ID generation, user search, and account deletion. The system supports two user types (Student, Faculty) with different profile requirements.

## Technical Stack

- Backend: ASP.NET Core Web API
- Database: PostgreSQL with Entity Framework Core
- ID Generation: Custom DisplayIdGenerator service
- Authentication: JWT tokens
- Frontend: React with Context API

## User Lifecycle

### Registration Flow

**Endpoint:** POST /api/auth/register

**Process:**

1. Email uniqueness validation
2. User type validation (Student or Faculty)
3. Password strength validation
4. Password hashing with BCrypt
5. Display ID generation
6. User entity creation
7. Faculty entity creation (if Faculty type)
8. JWT token generation
9. Return auth response

**Implementation:** `server/Services/AuthService.cs:23-83`

```csharp
public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
{
    // 1. Email uniqueness check
    var existingUser = await _userRepository.GetByEmailAsync(registerDto.Email);
    if (existingUser != null)
    {
        throw new InvalidOperationException("Email already exists");
    }

    // 2. User type validation
    if (registerDto.UserType != "Student" && registerDto.UserType != "Faculty")
    {
        throw new InvalidOperationException("Invalid user type");
    }

    // 3. Password validation
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

    // 6. Create user
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

    // 8. Generate token
    var token = _tokenService.GenerateToken(user);

    // 9. Return response
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

### Display ID Generation

**Service:** `server/Services/DisplayIdGenerator.cs`

**Purpose:** Generate unique, human-readable identifiers for users.

**Format:** 6-character alphanumeric string (e.g., "ABC123")

**Implementation:**

```csharp
public class DisplayIdGenerator : IDisplayIdGenerator
{
    private readonly ApplicationDbContext _context;
    private const string Characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private const int IdLength = 6;

    public async Task<string> GenerateUniqueDisplayIdAsync()
    {
        string displayId;
        bool isUnique;

        do
        {
            displayId = GenerateRandomId();
            isUnique = !await _context.Users.AnyAsync(u => u.DisplayId == displayId);
        }
        while (!isUnique);

        return displayId;
    }

    private string GenerateRandomId()
    {
        var random = new Random();
        var chars = new char[IdLength];

        for (int i = 0; i < IdLength; i++)
        {
            chars[i] = Characters[random.Next(Characters.Length)];
        }

        return new string(chars);
    }
}
```

**Characteristics:**
- Unique across all users
- Case-insensitive
- Easy to communicate verbally
- No ambiguous characters (O/0, I/1)
- Collision detection with retry

### Student Information Collection

**Endpoint:** POST /api/auth/student-info

**Purpose:** Collect additional profile information for Student users.

**Required Fields:**
- Gender (Male/Female)
- Branch ID (academic branch)
- Study Type ID (Morning/Evening/Parallel)
- Stage ID (First/Second/Third/Fourth)

**Implementation:** `server/Services/AuthService.cs:137-163`

```csharp
public async Task<bool> AddStudentInfoAsync(Guid userId, StudentInfoDto studentInfoDto)
{
    var user = await _userRepository.GetByIdAsync(userId);
    if (user == null || user.UserType != "Student")
    {
        throw new InvalidOperationException("User not found or not a student");
    }

    var existingStudent = await _userRepository.GetStudentByUserIdAsync(userId);
    if (existingStudent != null)
    {
        throw new InvalidOperationException("Student info already exists");
    }

    var student = new Student
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        Gender = studentInfoDto.Gender,
        BranchId = studentInfoDto.BranchId,
        StudyTypeId = studentInfoDto.StudyTypeId,
        StageId = studentInfoDto.StageId
    };

    await _userRepository.CreateStudentAsync(student);
    return true;
}
```

**Flow:**
1. User registers as Student
2. Receives token with `requiresStudentInfo: true`
3. Frontend redirects to StudentInfoPage
4. User selects academic information
5. Student entity created
6. User can access full system

### User Search

**Endpoint:** GET /api/users/search/{displayId}

**Purpose:** Search for users by their unique display ID.

**Implementation:** `server/Controllers/UsersController.cs:23-68`

```csharp
[HttpGet("search/{displayId}")]
public async Task<IActionResult> SearchByDisplayId(string displayId)
{
    var user = await _context.Users
        .Include(u => u.Student)
            .ThenInclude(s => s.Branch)
        .Include(u => u.Student)
            .ThenInclude(s => s.StudyType)
        .Include(u => u.Student)
            .ThenInclude(s => s.Stage)
        .FirstOrDefaultAsync(u => u.DisplayId == displayId);

    if (user == null)
    {
        return NotFound(new { message = "User not found" });
    }

    var result = new UserSearchResultDto
    {
        Id = user.Id,
        DisplayId = user.DisplayId,
        ProfileName = user.ProfileName,
        UserType = user.UserType,
        StudentInfo = user.Student != null ? new StudentProfileDto
        {
            Gender = user.Student.Gender,
            BranchId = user.Student.BranchId,
            BranchName = user.Student.Branch?.NameEn ?? "",
            StudyTypeId = user.Student.StudyTypeId,
            StudyTypeName = user.Student.StudyType?.NameEn ?? "",
            StageId = user.Student.StageId,
            StageName = user.Student.Stage?.NameEn ?? ""
        } : null
    };

    return Ok(result);
}
```

**Features:**
- Search by exact display ID match
- Returns user profile information
- Includes student academic details if applicable
- Available to all authenticated users

### Profile Viewing

**Endpoint:** GET /api/users/profile/{displayId}

**Purpose:** View detailed user profile.

**Implementation:** Similar to search endpoint with additional profile details.

**Returned Information:**
- Display ID
- Profile Name
- User Type
- Student Information (if Student):
  - Gender
  - Branch name (English/Arabic)
  - Study Type name (English/Arabic)
  - Stage name (English/Arabic)
  - Stage number

### Account Deletion

**Endpoint:** DELETE /api/auth/account

**Purpose:** Allow users to delete their own accounts.

**Implementation:** `server/Services/AuthService.cs:165-176`

```csharp
public async Task<bool> DeleteAccountAsync(Guid userId)
{
    var user = await _userRepository.GetByIdAsync(userId);
    if (user == null)
    {
        throw new InvalidOperationException("User not found");
    }

    await _userRepository.DeleteAsync(userId);
    return true;
}
```

**Cascade Behavior:**
- User deletion triggers cascade delete of Student/Faculty records
- Configured in ApplicationDbContext:

```csharp
modelBuilder.Entity<User>()
    .HasOne(u => u.Student)
    .WithOne(s => s.User)
    .HasForeignKey<Student>(s => s.UserId)
    .OnDelete(DeleteBehavior.Cascade);
```

## User Repository Pattern

**Interface:** `server/Repositories/IUserRepository.cs`

```csharp
public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task<IEnumerable<User>> GetAllAsync();
    Task<User> CreateAsync(User user);
    Task<bool> UpdateAsync(User user);
    Task<bool> DeleteAsync(Guid id);
    Task<Student?> GetStudentByUserIdAsync(Guid userId);
    Task<Student> CreateStudentAsync(Student student);
    Task<Faculty> CreateFacultyAsync(Faculty faculty);
}
```

**Implementation:** `server/Repositories/UserRepository.cs`

**Key Methods:**

```csharp
public async Task<User?> GetByEmailAsync(string email)
{
    return await _context.Users
        .Include(u => u.Student)
        .Include(u => u.Faculty)
        .FirstOrDefaultAsync(u => u.Email == email);
}

public async Task<User> CreateAsync(User user)
{
    _context.Users.Add(user);
    await _context.SaveChangesAsync();
    return user;
}

public async Task<Student> CreateStudentAsync(Student student)
{
    _context.Students.Add(student);
    await _context.SaveChangesAsync();
    return student;
}
```

## Frontend Implementation

### Registration Page

**Component:** `client/src/pages/auth/RegisterPage.jsx`

**Features:**
- Account type selection (Student/Faculty)
- Email and password input
- Password strength indicator
- Form validation
- Error handling

### Student Info Page

**Component:** `client/src/pages/auth/StudentInfoPage.jsx`

**Features:**
- Gender selection
- Branch dropdown
- Study Type dropdown
- Stage dropdown
- Form validation
- Redirect after submission

### User Profile Page

**Component:** `client/src/pages/public/UserProfilePage.jsx`

**Features:**
- Display ID search
- Profile information display
- Student academic details
- Responsive design

## Data Models

### User Entity

```csharp
public class User
{
    public Guid Id { get; set; }
    public string DisplayId { get; set; }
    public string ProfileName { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public string UserType { get; set; }  // Student | Faculty
    public string Role { get; set; }      // Regular | Admin | SuperAdmin
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Student? Student { get; set; }
    public Faculty? Faculty { get; set; }
}
```

### Student Entity

```csharp
public class Student
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Gender { get; set; }
    public Guid BranchId { get; set; }
    public Guid StudyTypeId { get; set; }
    public Guid StageId { get; set; }
    public User User { get; set; }
    public Branch Branch { get; set; }
    public StudyType StudyType { get; set; }
    public Stage Stage { get; set; }
}
```

### Faculty Entity

```csharp
public class Faculty
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; }
}
```

## Security Considerations

**Email Uniqueness:**
- Enforced at database level (unique index)
- Validated at application level
- Case-insensitive comparison

**Display ID Uniqueness:**
- Enforced at database level (unique index)
- Generated with collision detection
- Retry mechanism for conflicts

**Password Security:**
- BCrypt hashing with automatic salting
- Strength validation before hashing
- Never stored or transmitted in plain text

**Account Deletion:**
- User can only delete own account
- Requires authentication
- Cascade deletes related records

## Code References

**Backend:**
- Auth Service: `server/Services/AuthService.cs:23-176`
- User Repository: `server/Repositories/UserRepository.cs:7-85`
- Display ID Generator: `server/Services/DisplayIdGenerator.cs`
- Users Controller: `server/Controllers/UsersController.cs:12-116`
- User Entity: `server/Models/Entities/User.cs:6-41`
- Student Entity: `server/Models/Entities/Student.cs:6-35`
- Faculty Entity: `server/Models/Entities/Faculty.cs`

**Frontend:**
- Register Page: `client/src/pages/auth/RegisterPage.jsx`
- Student Info Page: `client/src/pages/auth/StudentInfoPage.jsx`
- User Profile Page: `client/src/pages/public/UserProfilePage.jsx`
- Auth Context: `client/src/contexts/AuthContext.jsx`

## Testing Considerations

**Key Test Scenarios:**
1. Register with unique email
2. Register with duplicate email (should fail)
3. Register as Student vs Faculty
4. Display ID uniqueness
5. Student info collection
6. User search by display ID
7. Profile viewing
8. Account deletion
9. Cascade delete behavior

**Edge Cases:**
- Very long profile names
- Special characters in names
- Display ID collision handling
- Missing student information
- Invalid branch/study type/stage IDs
- Concurrent registrations

## Performance Considerations

- Display ID generation with retry mechanism
- Database indexes on Email and DisplayId
- Eager loading for related entities (Student, Faculty)
- Efficient query patterns in repository

## Future Enhancements

- Email verification during registration
- Profile picture upload
- Profile editing
- Password reset functionality
- Account recovery
- User activity history
- Profile completion percentage
- Social profile links
- Privacy settings
- Account suspension (soft delete)
