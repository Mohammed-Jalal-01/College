namespace CollegeAPI.Services;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(IFormFile file, string folder);
    Task<bool> DeleteFileAsync(string fileUrl);
    string GetFileUrl(string fileName, string folder);
}
