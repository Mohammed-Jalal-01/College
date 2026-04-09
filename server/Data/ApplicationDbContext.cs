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
        var branches = new[]
        {
            new Branch { Id = Guid.NewGuid(), NameEn = "Software Engineering", NameAr = "هندسة البرمجيات" },
            new Branch { Id = Guid.NewGuid(), NameEn = "Cyber Security", NameAr = "الأمن السيبراني" },
            new Branch { Id = Guid.NewGuid(), NameEn = "Information Systems", NameAr = "نظم المعلومات" },
            new Branch { Id = Guid.NewGuid(), NameEn = "Artificial Intelligence", NameAr = "الذكاء الاصطناعي" },
            new Branch { Id = Guid.NewGuid(), NameEn = "Network Engineering", NameAr = "هندسة الشبكات" },
            new Branch { Id = Guid.NewGuid(), NameEn = "Multimedia", NameAr = "الوسائط المتعددة" }
        };

        var studyTypes = new[]
        {
            new StudyType { Id = Guid.NewGuid(), NameEn = "All Types", NameAr = "جميع الانواع" },
            new StudyType { Id = Guid.NewGuid(), NameEn = "Morning", NameAr = "صباحي" },
            new StudyType { Id = Guid.NewGuid(), NameEn = "Evening", NameAr = "مسائي" },
            new StudyType { Id = Guid.NewGuid(), NameEn = "Parallel", NameAr = "موازي" }
        };

        var stages = new[]
        {
            new Stage { Id = Guid.NewGuid(), NameEn = "First Stage", NameAr = "مرحلة اولى", StageNumber = 1 },
            new Stage { Id = Guid.NewGuid(), NameEn = "Second Stage", NameAr = "مرحلة ثانية", StageNumber = 2 },
            new Stage { Id = Guid.NewGuid(), NameEn = "Third Stage", NameAr = "مرحلة ثالثة", StageNumber = 3 },
            new Stage { Id = Guid.NewGuid(), NameEn = "Fourth Stage", NameAr = "مرحلة رابعة", StageNumber = 4 }
        };

        modelBuilder.Entity<Branch>().HasData(branches);
        modelBuilder.Entity<StudyType>().HasData(studyTypes);
        modelBuilder.Entity<Stage>().HasData(stages);
    }
}
