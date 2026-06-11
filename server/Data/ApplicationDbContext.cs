using Microsoft.EntityFrameworkCore;
using CollegeAPI.Models.Entities;

namespace CollegeAPI.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

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
    public DbSet<Grade> Grades { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.DisplayId)
            .IsUnique();

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

        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Branch>().HasData(
            new Branch { Id = Guid.Parse("ca4c3f51-4b60-4c1d-a34f-24921e81ee6e"), NameEn = "Software Engineering", NameAr = "هندسة البرمجيات" },
            new Branch { Id = Guid.Parse("ae1e2c9d-88f9-4217-9c4a-c1abd479e88e"), NameEn = "Cyber Security", NameAr = "الأمن السيبراني" },
            new Branch { Id = Guid.Parse("768906fa-13c7-455c-8cdf-eeb9c43047cc"), NameEn = "Information Systems", NameAr = "نظم المعلومات" },
            new Branch { Id = Guid.Parse("3dd5318c-78f9-407b-ae02-2d17670740d2"), NameEn = "Artificial Intelligence", NameAr = "الذكاء الاصطناعي" },
            new Branch { Id = Guid.Parse("8d38e498-9a85-4be1-8a8d-4440402b918b"), NameEn = "Network Engineering", NameAr = "هندسة الشبكات" },
            new Branch { Id = Guid.Parse("e2d38afb-66e6-40db-a409-f687aa34ca87"), NameEn = "Multimedia", NameAr = "الوسائط المتعددة" }
        );

        modelBuilder.Entity<StudyType>().HasData(
            new StudyType { Id = Guid.Parse("cbe76733-b4ef-4a75-89cd-1e258cad313d"), NameEn = "All Types", NameAr = "جميع الانواع" },
            new StudyType { Id = Guid.Parse("5593fee1-5208-4997-b82b-3600f29ab611"), NameEn = "Morning", NameAr = "صباحي" },
            new StudyType { Id = Guid.Parse("85cf43fa-3d01-432f-9519-ac33ba6f4939"), NameEn = "Evening", NameAr = "مسائي" },
            new StudyType { Id = Guid.Parse("e252fd78-871d-4b22-92ba-5672f72468b1"), NameEn = "Parallel", NameAr = "موازي" }
        );

        modelBuilder.Entity<Stage>().HasData(
            new Stage { Id = Guid.Parse("de39baf0-b250-41ec-8ab0-115d0f57ae2a"), NameEn = "First Stage", NameAr = "مرحلة اولى", StageNumber = 1 },
            new Stage { Id = Guid.Parse("363020b9-bbbb-4dff-957d-df338e47659d"), NameEn = "Second Stage", NameAr = "مرحلة ثانية", StageNumber = 2 },
            new Stage { Id = Guid.Parse("20540370-babc-48b3-bab2-23193d6694da"), NameEn = "Third Stage", NameAr = "مرحلة ثالثة", StageNumber = 3 },
            new Stage { Id = Guid.Parse("cd57c38a-77bd-4c9e-8dad-d9313744b924"), NameEn = "Fourth Stage", NameAr = "مرحلة رابعة", StageNumber = 4 }
        );
    }
}
