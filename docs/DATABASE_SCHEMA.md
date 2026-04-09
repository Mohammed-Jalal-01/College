# Database Schema - Technical Implementation

## Overview

The College Management System uses PostgreSQL as its relational database, managed through Entity Framework Core with a code-first approach. The schema supports user management, academic content, and audit logging with proper relationships and constraints.

## Technical Stack

- Primary technology: PostgreSQL 16.x
- ORM: Entity Framework Core 8.0
- Migration tool: EF Core Migrations
- Connection: Npgsql provider

## Database Context

**File Location:** `server/Data/ApplicationDbContext.cs`

The ApplicationDbContext inherits from DbContext and defines all entity sets and their relationships.

```csharp
public class ApplicationDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Student> Students { get; set; }
    public DbSet<Faculty> Faculties { get; set; }
    public DbSet<Branch> Branches { get; set; }
    public DbSet<StudyType> StudyTypes { get; set; }
    public DbSet<Stage> Stages { get; set; }
    public DbSet<News> News { get; set; }
    public DbSet<Update> Updates { get; set; }
    public DbSet<Activity> Activities { get; set; }
    public DbSet<Department> Departments { get; set; }
    public DbSet<LectureSchedule> LectureSchedules { get; set; }
    public DbSet<CourseMaterial> CourseMaterials { get; set; }
    public DbSet<AboutCollege> AboutCollege { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
}
```

## Entity Relationship Diagram

```
User (Core Entity)
├── Id: Guid (PK)
├── DisplayId: string(20) [Unique Index]
├── ProfileName: string(100)
├── Email: string(255) [Unique Index]
├── PasswordHash: string
├── UserType: string(20) [Student|Faculty]
├── Role: string(20) [Regular|Admin|SuperAdmin]
├── CreatedAt: DateTime
├── UpdatedAt: DateTime
└── Relationships:
    ├── HasOne: Student (1:0..1, Cascade Delete)
    └── HasOne: Faculty (1:0..1, Cascade Delete)

Student
├── Id: Guid (PK)
├── UserId: Guid (FK → User.Id) [Unique]
├── Gender: string(20)
├── BranchId: Guid (FK → Branch.Id)
├── StudyTypeId: Guid (FK → StudyType.Id)
├── StageId: Guid (FK → Stage.Id)
└── Relationships:
    ├── BelongsTo: User (1:1)
    ├── BelongsTo: Branch (N:1)
    ├── BelongsTo: StudyType (N:1)
    └── BelongsTo: Stage (N:1)

Faculty
├── Id: Guid (PK)
├── UserId: Guid (FK → User.Id) [Unique]
└── Relationships:
    └── BelongsTo: User (1:1)

Branch (Lookup Table)
├── Id: Guid (PK)
├── NameEn: string(100)
├── NameAr: string(100)
└── Relationships:
    └── HasMany: Students

StudyType (Lookup Table)
├── Id: Guid (PK)
├── NameEn: string(100)
├── NameAr: string(100)
└── Relationships:
    └── HasMany: Students

Stage (Lookup Table)
├── Id: Guid (PK)
├── NameEn: string(100)
├── NameAr: string(100)
├── StageNumber: int
└── Relationships:
    └── HasMany: Students

News (Content Entity)
├── Id: Guid (PK)
├── TitleEn: string(200)
├── TitleAr: string(200)
├── ContentEn: string
├── ContentAr: string
├── ImageUrl: string(500)
├── IsFeatured: bool
├── PublishedAt: DateTime
└── CreatedAt: DateTime

Update (Content Entity)
├── Id: Guid (PK)
├── TitleEn: string(200)
├── TitleAr: string(200)
├── ContentEn: string
├── ContentAr: string
├── PublishedAt: DateTime
└── CreatedAt: DateTime

Activity (Content Entity)
├── Id: Guid (PK)
├── TitleEn: string(200)
├── TitleAr: string(200)
├── DescriptionEn: string
├── DescriptionAr: string
├── ImageUrl: string(500)
├── ActivityDate: DateTime
└── CreatedAt: DateTime

Department (Content Entity)
├── Id: Guid (PK)
├── NameEn: string(200)
├── NameAr: string(200)
├── DescriptionEn: string
├── DescriptionAr: string
└── CreatedAt: DateTime

LectureSchedule (Academic Entity)
├── Id: Guid (PK)
├── SubjectEn: string(200)
├── SubjectAr: string(200)
├── InstructorEn: string(100)
├── InstructorAr: string(100)
├── DayOfWeek: string(20)
├── StartTime: TimeSpan
├── EndTime: TimeSpan
├── RoomEn: string(50)
├── RoomAr: string(50)
├── BranchId: Guid (FK → Branch.Id, Nullable)
├── StudyTypeId: Guid (FK → StudyType.Id, Nullable)
├── StageId: Guid (FK → Stage.Id, Nullable)
└── CreatedAt: DateTime

CourseMaterial (Academic Entity)
├── Id: Guid (PK)
├── TitleEn: string(200)
├── TitleAr: string(200)
├── DescriptionEn: string
├── DescriptionAr: string
├── FileUrl: string(500)
├── FileName: string(255)
├── FileSize: long
├── BranchId: Guid (FK → Branch.Id, Nullable)
├── StudyTypeId: Guid (FK → StudyType.Id, Nullable)
├── StageId: Guid (FK → Stage.Id, Nullable)
├── UploadedAt: DateTime
└── CreatedAt: DateTime

AboutCollege (Content Entity)
├── Id: Guid (PK)
├── ContentEn: string
├── ContentAr: string
├── UpdatedAt: DateTime
└── CreatedAt: DateTime

AuditLog (Audit Entity)
├── Id: Guid (PK)
├── UserId: Guid (Nullable)
├── Action: string(100)
├── EntityName: string(100)
├── EntityId: string(100)
├── Changes: string
├── IpAddress: string(50)
├── UserAgent: string(500)
└── Timestamp: DateTime
```

## Unique Constraints and Indexes

### User Table
```csharp
// ApplicationDbContext.cs:32-38
modelBuilder.Entity<User>()
    .HasIndex(u => u.Email)
    .IsUnique();

modelBuilder.Entity<User>()
    .HasIndex(u => u.DisplayId)
    .IsUnique();
```

**Purpose:**
- Email uniqueness: Prevents duplicate user registrations
- DisplayId uniqueness: Ensures each user has a unique searchable identifier

## Foreign Key Relationships

### User-Student Relationship (One-to-One)
```csharp
// ApplicationDbContext.cs:40-44
modelBuilder.Entity<User>()
    .HasOne(u => u.Student)
    .WithOne(s => s.User)
    .HasForeignKey<Student>(s => s.UserId)
    .OnDelete(DeleteBehavior.Cascade);
```

**Cascade Delete:** When a User is deleted, their Student record is automatically deleted.

### User-Faculty Relationship (One-to-One)
```csharp
// ApplicationDbContext.cs:46-50
modelBuilder.Entity<User>()
    .HasOne(u => u.Faculty)
    .WithOne(f => f.User)
    .HasForeignKey<Faculty>(f => f.UserId)
    .OnDelete(DeleteBehavior.Cascade);
```

**Cascade Delete:** When a User is deleted, their Faculty record is automatically deleted.

## Seeded Data

### Branches (6 records)
```csharp
// ApplicationDbContext.cs:57-65
- Software Engineering (هندسة البرمجيات)
- Cyber Security (الأمن السيبراني)
- Information Systems (نظم المعلومات)
- Artificial Intelligence (الذكاء الاصطناعي)
- Network Engineering (هندسة الشبكات)
- Multimedia (الوسائط المتعددة)
```

### Study Types (4 records)
```csharp
// ApplicationDbContext.cs:67-73
- All Types (جميع الانواع)
- Morning (صباحي)
- Evening (مسائي)
- Parallel (موازي)
```

### Stages (4 records)
```csharp
// ApplicationDbContext.cs:75-81
- First Stage (مرحلة اولى) - StageNumber: 1
- Second Stage (مرحلة ثانية) - StageNumber: 2
- Third Stage (مرحلة ثالثة) - StageNumber: 3
- Fourth Stage (مرحلة رابعة) - StageNumber: 4
```

## Migration History

**Location:** `server/Migrations/`

### Initial Migration
- **File:** `20260208173542_InitialCreate.cs`
- **Purpose:** Creates all tables, relationships, and seeded data
- **Tables Created:** 14 tables (Users, Students, Faculties, Branches, StudyTypes, Stages, News, Updates, Activities, Departments, LectureSchedules, CourseMaterials, AboutCollege, AuditLogs)

### Display ID Migration
- **File:** `20260209121006_AddDisplayIdToUser.cs`
- **Purpose:** Adds DisplayId field to User table with unique index
- **Changes:** Added DisplayId column, created unique index

## Repository Pattern Implementation

**Interface:** `server/Repositories/IUserRepository.cs`
**Implementation:** `server/Repositories/UserRepository.cs`

The repository pattern abstracts data access logic from business logic.

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

## Connection Configuration

**File:** `server/appsettings.template.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "REPLACE_WITH_USER_SECRETS"
  }
}
```

**Actual Connection String Format:**
```
Host=localhost;Database=ComputerScienceCollege;Username=your_username;Password=your_password
```

**Configuration in Program.cs:**
```csharp
// Program.cs:22-23
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
```

## Data Types and Constraints

### String Length Constraints
- DisplayId: 20 characters (short, unique identifier)
- Email: 255 characters (standard email length)
- ProfileName: 100 characters
- UserType/Role: 20 characters
- Titles (En/Ar): 200 characters
- Content fields: Unlimited (text type in PostgreSQL)

### DateTime Fields
- All timestamps use UTC (DateTime.UtcNow)
- CreatedAt: Set on entity creation
- UpdatedAt: Updated on entity modification

### Nullable Fields
- Student/Faculty navigation properties (User may not have extended profile)
- BranchId/StudyTypeId/StageId in LectureSchedule and CourseMaterial (allows "All" filtering)
- UserId in AuditLog (allows system-level actions)

## Performance Considerations

### Indexed Fields
- User.Email (unique index for fast lookups during login)
- User.DisplayId (unique index for user search functionality)

### Eager Loading
```csharp
// UserRepository.cs:18-21
return await _context.Users
    .Include(u => u.Student)
    .Include(u => u.Faculty)
    .FirstOrDefaultAsync(u => u.Id == id);
```

### Lazy Loading
Not enabled - all related data must be explicitly included to avoid N+1 query problems.

## Code References

**Backend:**
- DbContext: `server/Data/ApplicationDbContext.cs:6-87`
- User Entity: `server/Models/Entities/User.cs:6-41`
- Student Entity: `server/Models/Entities/Student.cs:6-35`
- Faculty Entity: `server/Models/Entities/Faculty.cs`
- Repository Interface: `server/Repositories/IUserRepository.cs:5-16`
- Repository Implementation: `server/Repositories/UserRepository.cs:7-85`
- Initial Migration: `server/Migrations/20260208173542_InitialCreate.cs`
- DisplayId Migration: `server/Migrations/20260209121006_AddDisplayIdToUser.cs`

## Database Commands

### Create Migration
```bash
dotnet ef migrations add MigrationName
```

### Apply Migrations
```bash
dotnet ef database update
```

### Rollback Migration
```bash
dotnet ef database update PreviousMigrationName
```

### Remove Last Migration
```bash
dotnet ef migrations remove
```

## Testing Considerations

**Key Test Scenarios:**
1. User creation with unique email and DisplayId
2. Cascade delete behavior (User → Student/Faculty)
3. Foreign key constraint validation
4. Unique constraint violations
5. Seeded data availability

**Edge Cases:**
- Duplicate email registration attempts
- Duplicate DisplayId generation (handled by DisplayIdGenerator)
- Orphaned Student/Faculty records (prevented by cascade delete)
- Null foreign keys in optional relationships

## Security Considerations

- PasswordHash is never exposed in DTOs
- Email addresses are case-insensitive (handled at application level)
- Soft delete not implemented (hard delete with cascade)
- Audit logging tracks all data modifications
- No direct database access from frontend

## Future Enhancements

- Implement soft delete for User entities
- Add composite indexes for frequently queried combinations (Branch + StudyType + Stage)
- Implement database-level audit triggers
- Add full-text search indexes for content fields
- Consider partitioning AuditLog table by date for performance
- Implement database connection pooling optimization
- Add read replicas for reporting queries
