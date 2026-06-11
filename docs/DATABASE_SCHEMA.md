# Database Schema

## Overview

The College Management System uses PostgreSQL as its relational database, managed through Entity Framework Core (code-first). The database contains **15 tables** organized into four categories: identity, lookup, content, and audit.

**Technical Stack:**
- Database: PostgreSQL 16.x
- ORM: Entity Framework Core 8.0
- Provider: Npgsql
- Approach: Code-first with EF Migrations

**Database Name:** `ComputerScienceCollege`

---

## Table Summary

| # | Table | Category | Records (Seed) | Description |
|---|-------|----------|----------------|-------------|
| 1 | Users | Identity | 33 (pre-provisioned) | All system users |
| 2 | Students | Identity | 24 | Extended student profile |
| 3 | Faculties | Identity | 7 | Extended faculty profile |
| 4 | Branches | Lookup | 6 (seeded) | Academic branches/departments |
| 5 | StudyTypes | Lookup | 4 (seeded) | Study type classifications |
| 6 | Stages | Lookup | 4 (seeded) | Academic year stages |
| 7 | News | Content | Dynamic | College news articles |
| 8 | Updates | Content | Dynamic | College updates/announcements |
| 9 | Activities | Content | Dynamic | College activities/events |
| 10 | Departments | Content | Dynamic | Academic departments |
| 11 | LectureSchedules | Academic | Dynamic | Weekly lecture timetable |
| 12 | CourseMaterials | Academic | Dynamic | Uploaded study materials |
| 13 | Grades | Academic | Dynamic | Uploaded grade sheets |
| 14 | AboutCollege | Content | 1 | About page content |
| 15 | AuditLogs | Audit | Dynamic | Action audit trail |

---

## Table Definitions

### 1. Users

The central identity table. Every person in the system has one User record.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | uuid | PK | Primary key |
| DisplayId | varchar(20) | Required, Unique Index | Human-readable ID (e.g. ABC123) |
| ProfileName | varchar(100) | Required | Display name |
| Email | varchar(255) | Required, Unique Index | Login email |
| PasswordHash | text | Required | BCrypt hash |
| UserType | varchar(20) | Required | "Student" or "Faculty" |
| Role | varchar(20) | Required, Default "Regular" | "Regular", "Admin", or "SuperAdmin" |
| CreatedAt | timestamp | UTC | Registration time |
| UpdatedAt | timestamp | UTC | Last profile update |

**Entity file:** `server/Models/Entities/User.cs`

---

### 2. Students

Extended profile for users with UserType = "Student". One-to-one with Users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | uuid | PK | Primary key |
| UserId | uuid | FK -> Users.Id, Unique | Owner user |
| Gender | varchar(20) | Required | "Male" or "Female" |
| BranchId | uuid | FK -> Branches.Id, Required | Academic branch |
| StudyTypeId | uuid | FK -> StudyTypes.Id, Required | Study classification |
| StageId | uuid | FK -> Stages.Id, Required | Academic year |

**Cascade behavior:**
- Deleting a User cascades to its Student record
- Deleting a Branch/StudyType/Stage cascades to referencing Students

**Entity file:** `server/Models/Entities/Student.cs`

---

### 3. Faculties

Extended profile for users with UserType = "Faculty". One-to-one with Users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | uuid | PK | Primary key |
| UserId | uuid | FK -> Users.Id, Unique | Owner user |
| Department | varchar(100) | Nullable | Department affiliation |
| Position | varchar(100) | Nullable | Academic position |

**Entity file:** `server/Models/Entities/Faculty.cs`

---

### 4. Branches (Seeded Lookup)

Academic specialization branches. Data is seeded with **fixed GUIDs** (never regenerated).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | uuid | PK | Fixed GUID |
| NameEn | varchar(100) | Required | English name |
| NameAr | varchar(100) | Required | Arabic name |

**Seeded values:**

| GUID | English | Arabic |
|------|---------|--------|
| ca4c3f51-... | Software Engineering | هندسة البرمجيات |
| ae1e2c9d-... | Cyber Security | الأمن السيبراني |
| 768906fa-... | Information Systems | نظم المعلومات |
| 3dd5318c-... | Artificial Intelligence | الذكاء الاصطناعي |
| 8d38e498-... | Network Engineering | هندسة الشبكات |
| e2d38afb-... | Multimedia | الوسائط المتعددة |

**Entity file:** `server/Models/Entities/Branch.cs`

---

### 5. StudyTypes (Seeded Lookup)

Study type classifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | uuid | PK | Fixed GUID |
| NameEn | varchar(100) | Required | English name |
| NameAr | varchar(100) | Required | Arabic name |

**Seeded values:**

| GUID | English | Arabic |
|------|---------|--------|
| cbe76733-... | All Types | جميع الانواع |
| 5593fee1-... | Morning | صباحي |
| 85cf43fa-... | Evening | مسائي |
| e252fd78-... | Parallel | موازي |

**Entity file:** `server/Models/Entities/StudyType.cs`

---

### 6. Stages (Seeded Lookup)

Academic year stages (1-4).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | uuid | PK | Fixed GUID |
| NameEn | varchar(100) | Required | English name |
| NameAr | varchar(100) | Required | Arabic name |
| StageNumber | int | Required | Numeric order (1-4) |

**Seeded values:**

| GUID | English | Arabic | Number |
|------|---------|--------|--------|
| de39baf0-... | First Stage | مرحلة اولى | 1 |
| 363020b9-... | Second Stage | مرحلة ثانية | 2 |
| 20540370-... | Third Stage | مرحلة ثالثة | 3 |
| cd57c38a-... | Fourth Stage | مرحلة رابعة | 4 |

**Entity file:** `server/Models/Entities/Stage.cs`

---

### 7. News

College news articles with bilingual content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | uuid | PK | Primary key |
| TitleEn | varchar(200) | Required | English title |
| TitleAr | varchar(200) | Required | Arabic title |
| ContentEn | text | Required | English body |
| ContentAr | text | Required | Arabic body |
| IsFeatured | boolean | Default false | Show on homepage |
| ImageUrl | varchar(500) | Nullable | Attached image path |
| CreatedBy | uuid | FK -> Users.Id | Author |
| CreatedAt | timestamp | UTC | Creation time |
| UpdatedAt | timestamp | UTC | Last edit time |

**Entity file:** `server/Models/Entities/News.cs`

---

### 8. Updates

College announcements/updates with bilingual content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | uuid | PK | Primary key |
| TitleEn | varchar(200) | Required | English title |
| TitleAr | varchar(200) | Required | Arabic title |
| ContentEn | text | Required | English body |
| ContentAr | text | Required | Arabic body |
| CreatedBy | uuid | FK -> Users.Id | Author |
| CreatedAt | timestamp | UTC | Creation time |
| UpdatedAt | timestamp | UTC | Last edit time |

**Entity file:** `server/Models/Entities/Update.cs`

---

### 9. Activities

College activities/events with bilingual content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | uuid | PK | Primary key |
| TitleEn | varchar(200) | Required | English title |
| TitleAr | varchar(200) | Required | Arabic title |
| ContentEn | text | Required | English body |
| ContentAr | text | Required | Arabic body |
| Date | timestamp | Required | Activity date |
| ImageUrl | varchar(500) | Nullable | Attached image path |
| CreatedBy | uuid | FK -> Users.Id | Author |
| CreatedAt | timestamp | UTC | Creation time |
| UpdatedAt | timestamp | UTC | Last edit time |

**Entity file:** `server/Models/Entities/Activity.cs`

---

### 10. Departments

Academic departments (name only, no descriptions).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | uuid | PK | Primary key |
| NameEn | varchar(200) | Required | English name |
| NameAr | varchar(200) | Required | Arabic name |
| CreatedBy | uuid | FK -> Users.Id | Creator |
| CreatedAt | timestamp | UTC | Creation time |
| UpdatedAt | timestamp | UTC | Last edit time |

**Entity file:** `server/Models/Entities/Department.cs`

---

### 11. LectureSchedules

Weekly lecture timetable entries, filtered by branch/studyType/stage.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | uuid | PK | Primary key |
| BranchId | uuid | FK -> Branches.Id, Required | Target branch |
| StudyTypeId | uuid | FK -> StudyTypes.Id, Required | Target study type |
| StageId | uuid | FK -> Stages.Id, Required | Target stage |
| Day | varchar(20) | Required | Day of week (e.g. "Monday") |
| StartTime | time | Required | Lecture start time |
| EndTime | time | Required | Lecture end time |
| SubjectNameEn | varchar(200) | Required | Subject in English |
| SubjectNameAr | varchar(200) | Required | Subject in Arabic |
| InstructorName | varchar(100) | Required | Instructor name |
| RoomNumber | varchar(50) | Nullable | Room/hall number |
| CreatedBy | uuid | FK -> Users.Id | Creator |
| CreatedAt | timestamp | UTC | Creation time |
| UpdatedAt | timestamp | UTC | Last edit time |

**Entity file:** `server/Models/Entities/LectureSchedule.cs`

---

### 12. CourseMaterials

Uploaded study materials (PDFs, documents), filtered by branch/studyType/stage.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | uuid | PK | Primary key |
| BranchId | uuid | FK -> Branches.Id, Required | Target branch |
| StudyTypeId | uuid | FK -> StudyTypes.Id, Required | Target study type |
| StageId | uuid | FK -> Stages.Id, Required | Target stage |
| Course | varchar(20) | Required | Course identifier |
| TitleEn | varchar(200) | Required | English title |
| TitleAr | varchar(200) | Required | Arabic title |
| DescriptionEn | text | Nullable | English description |
| DescriptionAr | text | Nullable | Arabic description |
| FileUrl | varchar(500) | Required | Uploaded file path |
| FileType | varchar(50) | Required | MIME type |
| UploadedBy | uuid | FK -> Users.Id | Uploader |
| CreatedAt | timestamp | UTC | Upload time |
| UpdatedAt | timestamp | UTC | Last edit time |

**Entity file:** `server/Models/Entities/CourseMaterial.cs`

---

### 13. Grades

Uploaded grade sheets, filtered by branch/studyType/stage.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | uuid | PK | Primary key |
| SubjectName | varchar(200) | Required | Subject name |
| BranchId | uuid | FK -> Branches.Id, Required | Target branch |
| StudyTypeId | uuid | FK -> StudyTypes.Id, Required | Target study type |
| StageId | uuid | FK -> Stages.Id, Required | Target stage |
| FileUrl | varchar(500) | Required | Uploaded file path |
| FileType | varchar(50) | Required | MIME type |
| OriginalFileName | varchar(255) | Required | Original upload filename |
| UploadedBy | uuid | FK -> Users.Id | Uploader |
| CreatedAt | timestamp | UTC | Upload time |
| UpdatedAt | timestamp | UTC | Last edit time |

**Entity file:** `server/Models/Entities/Grade.cs`

---

### 14. AboutCollege

Singleton-like table for the "About" page content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | uuid | PK | Primary key |
| ContentEn | text | Required | English content |
| ContentAr | text | Required | Arabic content |
| ImageUrl | varchar(500) | Nullable | Header image path |
| UpdatedBy | uuid | FK -> Users.Id | Last editor |
| CreatedAt | timestamp | UTC | Creation time |
| UpdatedAt | timestamp | UTC | Last edit time |

**Entity file:** `server/Models/Entities/AboutCollege.cs`

---

### 15. AuditLogs

Tracks user actions for security and accountability.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | uuid | PK | Primary key |
| UserId | uuid | FK -> Users.Id, Required | Acting user |
| Action | varchar(100) | Required | Action performed (e.g. "Create", "Update") |
| EntityType | varchar(100) | Required | Target entity type |
| EntityId | uuid | Nullable | Target entity ID |
| Timestamp | timestamp | UTC | When action occurred |
| Details | text | Nullable | JSON details/diff |

**Entity file:** `server/Models/Entities/AuditLog.cs`

---

## Relationships Diagram

```
Users
 |
 |-- 1:0..1 --> Students --> Branches (N:1, CASCADE)
 |                      |--> StudyTypes (N:1, CASCADE)
 |                      |--> Stages (N:1, CASCADE)
 |
 |-- 1:0..1 --> Faculties
 |
 |-- 1:N ----> News (CreatedBy)
 |-- 1:N ----> Updates (CreatedBy)
 |-- 1:N ----> Activities (CreatedBy)
 |-- 1:N ----> Departments (CreatedBy)
 |-- 1:N ----> LectureSchedules (CreatedBy)
 |-- 1:N ----> CourseMaterials (UploadedBy)
 |-- 1:N ----> Grades (UploadedBy)
 |-- 1:N ----> AboutCollege (UpdatedBy)
 |-- 1:N ----> AuditLogs (UserId)

Branches (Lookup)
 |-- 1:N --> Students (CASCADE)
 |-- 1:N --> LectureSchedules (CASCADE)
 |-- 1:N --> CourseMaterials (CASCADE)
 |-- 1:N --> Grades (CASCADE)

StudyTypes (Lookup)
 |-- 1:N --> Students (CASCADE)
 |-- 1:N --> LectureSchedules (CASCADE)
 |-- 1:N --> CourseMaterials (CASCADE)
 |-- 1:N --> Grades (CASCADE)

Stages (Lookup)
 |-- 1:N --> Students (CASCADE)
 |-- 1:N --> LectureSchedules (CASCADE)
 |-- 1:N --> CourseMaterials (CASCADE)
 |-- 1:N --> Grades (CASCADE)
```

---

## Fluent API Configuration

```csharp
// server/Data/ApplicationDbContext.cs

// Unique indexes
modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
modelBuilder.Entity<User>().HasIndex(u => u.DisplayId).IsUnique();

// One-to-one relationships with cascade delete
modelBuilder.Entity<User>()
    .HasOne(u => u.Student)
    .WithOne(s => s.User)
    .HasForeignKey<Student>(s => s.UserId)
    .OnDelete(DeleteBehavior.Cascade);

modelBuilder.Entity<User>()
    .HasOne(u => u.Faculty)
    .WithOne(f => f.User)
    .HasForeignKey<Faculty>(f => f.UserId)
    .OnDelete(DeleteBehavior.Cascade);
```

All other foreign key relationships use EF Core convention-based cascade delete (required FKs default to CASCADE).

---

## Seed Data

Seed data uses **fixed GUIDs** (via `Guid.Parse(...)`) to prevent accidental cascade deletion during migrations. Never use `Guid.NewGuid()` in seed data.

**Source:** `server/Data/ApplicationDbContext.cs` (SeedData method)

---

## Migration History

| # | File | Purpose |
|---|------|---------|
| 1 | `20260208173542_InitialCreate.cs` | Creates all 15 tables with relationships and seed data |
| 2 | `20260209121006_AddDisplayIdToUser.cs` | Adds DisplayId column with unique index |
| 3 | `20260611025156_RemoveDepartmentDescriptionFields.cs` | Drops DescriptionEn/DescriptionAr from Departments |
| 4 | `20260611045335_RestoreStudentRecords.cs` | Restores Student records lost to cascade delete; fixes seed GUIDs |

---

## Connection Configuration

```
Host=localhost;Database=ComputerScienceCollege;Username=<user>;Password=<password>
```

Stored in .NET User Secrets (never committed). Template at `server/appsettings.template.json`.

---

## Database Commands

```bash
# Create a new migration
dotnet ef migrations add <Name>

# Apply all pending migrations
dotnet ef database update

# Rollback to a specific migration
dotnet ef database update <MigrationName>

# Remove the last unapplied migration
dotnet ef migrations remove
```

---

## Security Notes

- PasswordHash is never exposed in API responses
- Connection string stored in User Secrets, not in source control
- All foreign keys use cascade delete (no orphaned records)
- Audit logging tracks modifications for accountability
- Registration is closed; no new accounts can be created via API
