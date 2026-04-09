using Microsoft.EntityFrameworkCore;
using CollegeAPI.Data;
using CollegeAPI.Models.Entities;

namespace CollegeAPI.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users
            .Include(u => u.Student)
            .Include(u => u.Faculty)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .Include(u => u.Student)
            .Include(u => u.Faculty)
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _context.Users
            .Include(u => u.Student)
            .Include(u => u.Faculty)
            .ToListAsync();
    }

    public async Task<User> CreateAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<bool> UpdateAsync(User user)
    {
        user.UpdatedAt = DateTime.UtcNow;
        _context.Users.Update(user);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;

        _context.Users.Remove(user);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<Student?> GetStudentByUserIdAsync(Guid userId)
    {
        return await _context.Students
            .Include(s => s.Branch)
            .Include(s => s.StudyType)
            .Include(s => s.Stage)
            .FirstOrDefaultAsync(s => s.UserId == userId);
    }

    public async Task<Student> CreateStudentAsync(Student student)
    {
        _context.Students.Add(student);
        await _context.SaveChangesAsync();
        return student;
    }

    public async Task<Faculty> CreateFacultyAsync(Faculty faculty)
    {
        _context.Faculties.Add(faculty);
        await _context.SaveChangesAsync();
        return faculty;
    }
}
