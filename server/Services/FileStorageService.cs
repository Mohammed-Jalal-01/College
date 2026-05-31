namespace CollegeAPI.Services;

public class FileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<FileStorageService> _logger;
    private const long MaxFileSize = 52428800;

    private static readonly Dictionary<string, List<byte[]>> FileSignatures = new()
    {
        { ".pdf", new List<byte[]> { new byte[] { 0x25, 0x50, 0x44, 0x46 } } },
        { ".doc", new List<byte[]> { new byte[] { 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1 } } },
        { ".xls", new List<byte[]> { new byte[] { 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1 } } },
        { ".docx", new List<byte[]> { new byte[] { 0x50, 0x4B, 0x03, 0x04 }, new byte[] { 0x50, 0x4B, 0x05, 0x06 } } },
        { ".xlsx", new List<byte[]> { new byte[] { 0x50, 0x4B, 0x03, 0x04 }, new byte[] { 0x50, 0x4B, 0x05, 0x06 } } },
        { ".pptx", new List<byte[]> { new byte[] { 0x50, 0x4B, 0x03, 0x04 }, new byte[] { 0x50, 0x4B, 0x05, 0x06 } } },
        { ".ods", new List<byte[]> { new byte[] { 0x50, 0x4B, 0x03, 0x04 }, new byte[] { 0x50, 0x4B, 0x05, 0x06 } } },
        { ".zip", new List<byte[]> { new byte[] { 0x50, 0x4B, 0x03, 0x04 }, new byte[] { 0x50, 0x4B, 0x05, 0x06 } } },
        { ".rar", new List<byte[]> { new byte[] { 0x52, 0x61, 0x72, 0x21, 0x1A, 0x07 } } },
        { ".png", new List<byte[]> { new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A } } },
        { ".jpg", new List<byte[]> { new byte[] { 0xFF, 0xD8, 0xFF } } },
        { ".jpeg", new List<byte[]> { new byte[] { 0xFF, 0xD8, 0xFF } } },
        { ".gif", new List<byte[]> { new byte[] { 0x47, 0x49, 0x46, 0x38 } } },
        { ".webp", new List<byte[]> { new byte[] { 0x52, 0x49, 0x46, 0x46 } } }
    };

    public FileStorageService(IWebHostEnvironment environment, ILogger<FileStorageService> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    public async Task<string> SaveFileAsync(IFormFile file, string folder)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is empty or null");
            }

            if (file.Length > MaxFileSize)
            {
                throw new ArgumentException($"File size exceeds maximum allowed size of {MaxFileSize / 1024 / 1024}MB");
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (string.IsNullOrEmpty(extension))
            {
                throw new ArgumentException("File must have an extension");
            }

            var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".csv", ".ods", ".txt", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".zip", ".rar" };
            if (!allowedExtensions.Contains(extension))
            {
                throw new ArgumentException($"File type {extension} is not allowed");
            }

            if (!await ValidateFileContentAsync(file, extension))
            {
                _logger.LogWarning("File content validation failed for file: {FileName}", file.FileName);
                throw new ArgumentException("File content does not match its extension. Possible malicious file.");
            }

            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", folder);
            
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var safeFileName = Path.GetFileNameWithoutExtension(file.FileName)
                .Replace(" ", "_")
                .Replace("..", "")
                .Replace("/", "")
                .Replace("\\", "");
            
            var uniqueFileName = $"{Guid.NewGuid()}_{safeFileName}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            var fileUrl = $"/uploads/{folder}/{uniqueFileName}";
            _logger.LogInformation("File saved successfully: {FileUrl}, Size: {FileSize} bytes", fileUrl, file.Length);
            
            return fileUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving file: {FileName}", file?.FileName);
            throw;
        }
    }

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

        return false;
    }

    public async Task<bool> DeleteFileAsync(string fileUrl)
    {
        try
        {
            if (string.IsNullOrEmpty(fileUrl))
            {
                return false;
            }

            var filePath = Path.Combine(_environment.WebRootPath, fileUrl.TrimStart('/'));
            
            if (File.Exists(filePath))
            {
                await Task.Run(() => File.Delete(filePath));
                _logger.LogInformation("File deleted successfully: {FileUrl}", fileUrl);
                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file: {FileUrl}", fileUrl);
            return false;
        }
    }

    public string GetFileUrl(string fileName, string folder)
    {
        return $"/uploads/{folder}/{fileName}";
    }
}
