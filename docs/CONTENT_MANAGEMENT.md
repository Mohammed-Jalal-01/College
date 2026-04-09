# Content Management - Technical Implementation

## Overview

The College Management System provides comprehensive content management capabilities for News, Updates, Activities, Departments, Lecture Schedules, Course Materials, and About College content. All content management operations require Admin or SuperAdmin privileges.

## Technical Stack

- Backend: ASP.NET Core Web API
- Database: PostgreSQL with Entity Framework Core
- File Storage: Local file system (wwwroot/uploads)
- Authorization: Policy-based (AdminOnly)
- Frontend: React with Axios

## Content Types

### News
- Bilingual titles and content (English/Arabic)
- Optional image upload
- Featured flag for homepage display
- Publication date tracking

### Updates
- Bilingual titles and content
- Publication date tracking
- Chronological display

### Activities
- Bilingual titles and descriptions
- Image upload support
- Activity date tracking
- Event management

### Departments
- Bilingual names and descriptions
- Organizational structure
- Static content

### Lecture Schedules
- Bilingual subject and instructor names
- Day of week and time slots
- Room information
- Optional filtering by Branch, StudyType, Stage

### Course Materials
- Bilingual titles and descriptions
- File upload (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP, RAR)
- File size and name tracking
- Optional filtering by Branch, StudyType, Stage

### About College
- Bilingual content
- Single record (update only)
- Last updated timestamp

## Implementation Details

### News Management

**Controller:** `server/Controllers/NewsController.cs`

**Authorization:** AdminOnly policy

**CRUD Operations:**

```csharp
// GET /api/news
[HttpGet]
[AllowAnonymous]
public async Task<IActionResult> GetAll()
{
    var news = await _context.News
        .OrderByDescending(n => n.PublishedAt)
        .ToListAsync();
    return Ok(news);
}

// GET /api/news/{id}
[HttpGet("{id}")]
[AllowAnonymous]
public async Task<IActionResult> GetById(Guid id)
{
    var news = await _context.News.FindAsync(id);
    if (news == null)
        return NotFound();
    return Ok(news);
}

// POST /api/news
[HttpPost]
[Authorize(Policy = "AdminOnly")]
public async Task<IActionResult> Create([FromBody] NewsDto dto)
{
    var news = new News
    {
        Id = Guid.NewGuid(),
        TitleEn = dto.TitleEn,
        TitleAr = dto.TitleAr,
        ContentEn = dto.ContentEn,
        ContentAr = dto.ContentAr,
        ImageUrl = dto.ImageUrl,
        IsFeatured = dto.IsFeatured,
        PublishedAt = dto.PublishedAt,
        CreatedAt = DateTime.UtcNow
    };

    _context.News.Add(news);
    await _context.SaveChangesAsync();
    return CreatedAtAction(nameof(GetById), new { id = news.Id }, news);
}

// PUT /api/news/{id}
[HttpPut("{id}")]
[Authorize(Policy = "AdminOnly")]
public async Task<IActionResult> Update(Guid id, [FromBody] NewsDto dto)
{
    var news = await _context.News.FindAsync(id);
    if (news == null)
        return NotFound();

    news.TitleEn = dto.TitleEn;
    news.TitleAr = dto.TitleAr;
    news.ContentEn = dto.ContentEn;
    news.ContentAr = dto.ContentAr;
    news.ImageUrl = dto.ImageUrl;
    news.IsFeatured = dto.IsFeatured;
    news.PublishedAt = dto.PublishedAt;

    await _context.SaveChangesAsync();
    return Ok(news);
}

// DELETE /api/news/{id}
[HttpDelete("{id}")]
[Authorize(Policy = "AdminOnly")]
public async Task<IActionResult> Delete(Guid id)
{
    var news = await _context.News.FindAsync(id);
    if (news == null)
        return NotFound();

    _context.News.Remove(news);
    await _context.SaveChangesAsync();
    return NoContent();
}
```

### Course Materials with File Upload

**Controller:** `server/Controllers/CourseMaterialsController.cs`

**File Upload Implementation:**

```csharp
// POST /api/coursematerials
[HttpPost]
[Authorize(Policy = "AdminOnly")]
public async Task<IActionResult> Create([FromForm] CourseMaterialCreateDto dto)
{
    if (dto.File == null || dto.File.Length == 0)
    {
        return BadRequest(new { message = "File is required" });
    }

    // Save file using FileStorageService
    var fileUrl = await _fileStorageService.SaveFileAsync(dto.File, "materials");

    var material = new CourseMaterial
    {
        Id = Guid.NewGuid(),
        TitleEn = dto.TitleEn,
        TitleAr = dto.TitleAr,
        DescriptionEn = dto.DescriptionEn,
        DescriptionAr = dto.DescriptionAr,
        FileUrl = fileUrl,
        FileName = dto.File.FileName,
        FileSize = dto.File.Length,
        BranchId = dto.BranchId,
        StudyTypeId = dto.StudyTypeId,
        StageId = dto.StageId,
        UploadedAt = DateTime.UtcNow,
        CreatedAt = DateTime.UtcNow
    };

    _context.CourseMaterials.Add(material);
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(GetById), new { id = material.Id }, material);
}

// DELETE /api/coursematerials/{id}
[HttpDelete("{id}")]
[Authorize(Policy = "AdminOnly")]
public async Task<IActionResult> Delete(Guid id)
{
    var material = await _context.CourseMaterials.FindAsync(id);
    if (material == null)
        return NotFound();

    // Delete associated file
    if (!string.IsNullOrEmpty(material.FileUrl))
    {
        await _fileStorageService.DeleteFileAsync(material.FileUrl);
    }

    _context.CourseMaterials.Remove(material);
    await _context.SaveChangesAsync();

    return NoContent();
}
```

### Lecture Schedules with Filtering

**Controller:** `server/Controllers/LectureSchedulesController.cs`

**Filtering Implementation:**

```csharp
// GET /api/lectureschedules?branchId=xxx&studyTypeId=xxx&stageId=xxx
[HttpGet]
[AllowAnonymous]
public async Task<IActionResult> GetAll(
    [FromQuery] Guid? branchId,
    [FromQuery] Guid? studyTypeId,
    [FromQuery] Guid? stageId)
{
    var query = _context.LectureSchedules.AsQueryable();

    // Apply filters
    if (branchId.HasValue)
    {
        query = query.Where(s => s.BranchId == branchId.Value || s.BranchId == null);
    }

    if (studyTypeId.HasValue)
    {
        query = query.Where(s => s.StudyTypeId == studyTypeId.Value || s.StudyTypeId == null);
    }

    if (stageId.HasValue)
    {
        query = query.Where(s => s.StageId == stageId.Value || s.StageId == null);
    }

    var schedules = await query
        .OrderBy(s => s.DayOfWeek)
        .ThenBy(s => s.StartTime)
        .ToListAsync();

    return Ok(schedules);
}
```

## Frontend Implementation

### Admin Dashboard

**Component:** `client/src/pages/admin/AdminDashboard.jsx`

**Features:**
- Statistics display (total users, content counts)
- Quick access to management pages
- Role-based menu rendering

### News Management

**Component:** `client/src/pages/admin/NewsManagement.jsx`

**Features:**
- List all news articles
- Create new news
- Edit existing news
- Delete news
- Toggle featured status
- Image upload support

**Implementation Pattern:**

```javascript
const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const data = await newsService.getAll();
      setNews(data);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (newsData) => {
    try {
      const created = await newsService.create(newsData);
      setNews([created, ...news]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create news:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('confirm.delete'))) return;
    
    try {
      await newsService.delete(id);
      setNews(news.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete news:', error);
    }
  };

  return (
    <div>
      <button onClick={() => setShowCreateModal(true)}>
        {t('news.create')}
      </button>
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <NewsList items={news} onDelete={handleDelete} />
      )}
      
      {showCreateModal && (
        <CreateNewsModal
          onSubmit={handleCreate}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};
```

### File Upload Component

**Component:** `client/src/components/admin/FileUpload.jsx`

**Implementation:**

```javascript
const FileUpload = ({ onFileSelect, accept, maxSize }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;

    // Validate file size
    if (maxSize && selectedFile.size > maxSize) {
      setError(`File size exceeds ${maxSize / 1024 / 1024}MB`);
      return;
    }

    // Validate file type
    if (accept) {
      const extension = selectedFile.name.split('.').pop().toLowerCase();
      const allowedExtensions = accept.split(',').map(ext => ext.trim().replace('.', ''));
      
      if (!allowedExtensions.includes(extension)) {
        setError(`File type .${extension} not allowed`);
        return;
      }
    }

    setError('');
    setFile(selectedFile);
    onFileSelect(selectedFile);
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        accept={accept}
      />
      {file && <p>Selected: {file.name}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};
```

## Data Models

### News Entity

```csharp
public class News
{
    public Guid Id { get; set; }
    public string TitleEn { get; set; }
    public string TitleAr { get; set; }
    public string ContentEn { get; set; }
    public string ContentAr { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsFeatured { get; set; }
    public DateTime PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

### CourseMaterial Entity

```csharp
public class CourseMaterial
{
    public Guid Id { get; set; }
    public string TitleEn { get; set; }
    public string TitleAr { get; set; }
    public string DescriptionEn { get; set; }
    public string DescriptionAr { get; set; }
    public string FileUrl { get; set; }
    public string FileName { get; set; }
    public long FileSize { get; set; }
    public Guid? BranchId { get; set; }
    public Guid? StudyTypeId { get; set; }
    public Guid? StageId { get; set; }
    public DateTime UploadedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

## Security Considerations

**Authorization:**
- All create/update/delete operations require AdminOnly policy
- Read operations are public (AllowAnonymous)
- File uploads validated for type and size

**Input Validation:**
- Required fields enforced via Data Annotations
- String length limits on all text fields
- File type whitelist for uploads
- File size limit (50MB)

**File Security:**
- Magic byte validation
- Filename sanitization
- Unique filename generation (GUID prefix)
- Stored outside web root access

## Code References

**Backend Controllers:**
- News: `server/Controllers/NewsController.cs`
- Updates: `server/Controllers/UpdatesController.cs`
- Activities: `server/Controllers/ActivitiesController.cs`
- Departments: `server/Controllers/DepartmentsController.cs`
- Lecture Schedules: `server/Controllers/LectureSchedulesController.cs`
- Course Materials: `server/Controllers/CourseMaterialsController.cs`
- About College: `server/Controllers/AboutCollegeController.cs`

**Frontend Pages:**
- Admin Dashboard: `client/src/pages/admin/AdminDashboard.jsx`
- News Management: `client/src/pages/admin/NewsManagement.jsx`
- Updates Management: `client/src/pages/admin/UpdatesManagement.jsx`
- Activities Management: `client/src/pages/admin/ActivitiesManagement.jsx`
- Departments Management: `client/src/pages/admin/DepartmentsManagement.jsx`
- Schedules Management: `client/src/pages/admin/SchedulesManagement.jsx`
- Materials Management: `client/src/pages/admin/MaterialsManagement.jsx`
- About College Management: `client/src/pages/admin/AboutCollegeManagement.jsx`

## Testing Considerations

**Key Test Scenarios:**
1. Create content with bilingual data
2. Update existing content
3. Delete content
4. File upload validation
5. File size limit enforcement
6. File type restriction
7. Filtering by Branch/StudyType/Stage
8. Featured news display
9. Authorization enforcement

**Edge Cases:**
- Very long content text
- Special characters in titles
- Missing optional fields
- Concurrent updates
- File upload failures
- Invalid file types
- Oversized files

## Performance Considerations

- Pagination for large content lists
- Lazy loading for images
- Caching for frequently accessed content
- Database indexing on PublishedAt, CreatedAt
- File compression for uploads

## Future Enhancements

- Rich text editor for content
- Image cropping and resizing
- Content versioning
- Draft/publish workflow
- Content scheduling
- Content approval workflow
- Bulk operations
- Content search functionality
- Content analytics
- SEO optimization
