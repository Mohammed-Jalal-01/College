using CollegeAPI.Models.Entities;

namespace CollegeAPI.Repositories;

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
