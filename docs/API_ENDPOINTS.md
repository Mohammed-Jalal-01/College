# API Endpoints - Complete Reference

## Overview

The College Management System exposes RESTful API endpoints organized by functional domain. All endpoints return JSON responses and follow standard HTTP status codes.

## Base URL

**Development:** `http://localhost:5000/api`
**Production:** `https://your-domain.com/api`

## Authentication

Most endpoints require JWT authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

**Success Response:**
```json
{
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Authentication:** Not Required

**Request Body:**
```json
{
  "profileName": "string (max 100)",
  "email": "string (valid email, max 255)",
  "password": "string (min 8, complex)",
  "confirmPassword": "string",
  "userType": "Student" | "Faculty"
}
```

**Response:** 200 OK
```json
{
  "token": "jwt_token_string",
  "email": "user@example.com",
  "profileName": "User Name",
  "displayId": "ABC123",
  "userType": "Student",
  "role": "Regular",
  "userId": "guid",
  "requiresStudentInfo": true
}
```

**Error Responses:**
- 400: Email already exists, Invalid user type, Password validation failed
- 500: Internal server error

**File Location:** `server/Controllers/AuthController.cs:22-41`

---

### POST /api/auth/login

Authenticate user and receive JWT token.

**Authentication:** Not Required

**Rate Limit:** 5 requests per 15 minutes per IP

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** 200 OK
```json
{
  "token": "jwt_token_string",
  "email": "user@example.com",
  "profileName": "User Name",
  "displayId": "ABC123",
  "userType": "Student",
  "role": "Regular",
  "userId": "guid",
  "requiresStudentInfo": false
}
```

**Error Responses:**
- 401: Invalid email or password, Account locked (too many failed attempts)
- 500: Internal server error

**File Location:** `server/Controllers/AuthController.cs:43-62`

---

### POST /api/auth/student-info

Add student-specific information after registration.

**Authentication:** Required

**Request Body:**
```json
{
  "gender": "Male" | "Female",
  "branchId": "guid",
  "studyTypeId": "guid",
  "stageId": "guid"
}
```

**Response:** 200 OK
```json
{
  "message": "Student information added successfully"
}
```

**Error Responses:**
- 400: User not found, Not a student, Student info already exists
- 401: Invalid user token
- 500: Internal server error

**File Location:** `server/Controllers/AuthController.cs:64-90`

---

### DELETE /api/auth/account

Delete user's own account.

**Authentication:** Required

**Response:** 200 OK
```json
{
  "message": "Account deleted successfully"
}
```

**Error Responses:**
- 400: User not found
- 401: Invalid user token
- 500: Internal server error

**File Location:** `server/Controllers/AuthController.cs:92-119`

---

## User Endpoints

### GET /api/users/search/{displayId}

Search for user by their unique display ID.

**Authentication:** Required

**Parameters:**
- `displayId` (path): User's display ID (e.g., "ABC123")

**Response:** 200 OK
```json
{
  "id": "guid",
  "displayId": "ABC123",
  "profileName": "User Name",
  "userType": "Student",
  "studentInfo": {
    "gender": "Male",
    "branchId": "guid",
    "branchName": "Software Engineering",
    "studyTypeId": "guid",
    "studyTypeName": "Morning",
    "stageId": "guid",
    "stageName": "First Stage"
  }
}
```

**Error Responses:**
- 404: User not found
- 500: Internal server error

**File Location:** `server/Controllers/UsersController.cs:23-68`

---

### GET /api/users/profile/{displayId}

Get detailed user profile by display ID.

**Authentication:** Required

**Parameters:**
- `displayId` (path): User's display ID

**Response:** 200 OK
```json
{
  "id": "guid",
  "displayId": "ABC123",
  "profileName": "User Name",
  "userType": "Student",
  "studentInfo": { /* same as search */ }
}
```

**Error Responses:**
- 404: User not found
- 500: Internal server error

**File Location:** `server/Controllers/UsersController.cs:70-116`

---

## User Management Endpoints (SuperAdmin Only)

### GET /api/usermanagement/users

Get all users with detailed information.

**Authentication:** Required (SuperAdmin)

**Response:** 200 OK
```json
[
  {
    "id": "guid",
    "displayId": "ABC123",
    "profileName": "User Name",
    "email": "user@example.com",
    "userType": "Student",
    "role": "Regular",
    "createdAt": "2024-01-01T00:00:00Z",
    "studentInfo": { /* if Student */ },
    "facultyInfo": { /* if Faculty */ }
  }
]
```

**File Location:** `server/Controllers/UserManagementController.cs:24-73`

---

### GET /api/usermanagement/stats

Get user statistics.

**Authentication:** Required (Admin or SuperAdmin)

**Response:** 200 OK
```json
{
  "totalUsers": 100,
  "totalStudents": 85,
  "totalFaculty": 15,
  "totalAdmins": 3,
  "totalSuperAdmins": 1
}
```

**File Location:** `server/Controllers/UserManagementController.cs:76-104`

---

### GET /api/usermanagement/dashboard-stats

Get aggregated statistics for Admin Dashboard charts (pie charts and bar charts).

**Authentication:** Required (Admin or SuperAdmin)

**Response:** 200 OK
```json
{
  "roleDistribution": [{ "name": "Regular", "nameAr": null, "value": 90 }, ...],
  "userTypeDistribution": [{ "name": "Student", "nameAr": null, "value": 85 }, ...],
  "studentsByGender": [{ "name": "Male", "nameAr": null, "value": 50 }, ...],
  "studentsByStudyType": [{ "name": "Morning", "nameAr": "صباحي", "value": 40 }, ...],
  "contentDistribution": [{ "name": "News", "nameAr": null, "value": 10 }, ...],
  "studentsPerBranch": [{ "name": "Software Engineering", "nameAr": "هندسة البرمجيات", "value": 30 }, ...],
  "studentsPerStage": [{ "name": "First", "nameAr": "الاولى", "value": 25 }, ...],
  "materialsPerBranch": [{ "name": "Software Engineering", "nameAr": "هندسة البرمجيات", "value": 15 }, ...],
  "schedulesPerDay": [{ "name": "Sunday", "nameAr": null, "value": 8 }, ...],
  "monthlyRegistrations": [{ "name": "2026-01", "nameAr": null, "value": 12 }, ...],
  "contentPerMonth": [{ "name": "2026-01", "nameAr": null, "value": 5 }, ...]
}
```

**File Location:** `server/Controllers/UserManagementController.cs:244-383`

---

### POST /api/usermanagement/promote-to-admin

Promote faculty user to Admin role.

**Authentication:** Required (SuperAdmin)

**Request Body:**
```json
{
  "userId": "guid"
}
```

**Response:** 200 OK
```json
{
  "message": "User promoted to admin successfully",
  "userId": "guid",
  "role": "Admin"
}
```

**Error Responses:**
- 400: Only faculty can be promoted, User already admin
- 404: User not found

**File Location:** `server/Controllers/UserManagementController.cs:104-139`

---

### POST /api/usermanagement/demote-to-regular

Demote admin user to Regular role.

**Authentication:** Required (SuperAdmin)

**Request Body:**
```json
{
  "userId": "guid"
}
```

**Response:** 200 OK
```json
{
  "message": "User demoted to regular successfully",
  "userId": "guid",
  "role": "Regular"
}
```

**Error Responses:**
- 400: Cannot demote SuperAdmin, User already regular

**File Location:** `server/Controllers/UserManagementController.cs:141-176`

---

### POST /api/usermanagement/transfer-superadmin

Transfer SuperAdmin role to another faculty user.

**Authentication:** Required (SuperAdmin)

**Request Body:**
```json
{
  "newSuperAdminId": "guid"
}
```

**Response:** 200 OK
```json
{
  "message": "Super admin role transferred successfully",
  "oldSuperAdminId": "guid",
  "newSuperAdminId": "guid"
}
```

**Error Responses:**
- 400: Only faculty can be SuperAdmin, Cannot transfer to self

**File Location:** `server/Controllers/UserManagementController.cs:178-237`

---

### GET /api/usermanagement/faculty-users

Get all faculty users for role management.

**Authentication:** Required (SuperAdmin)

**Response:** 200 OK
```json
[
  {
    "id": "guid",
    "displayId": "ABC123",
    "profileName": "Faculty Name",
    "email": "faculty@example.com",
    "role": "Regular"
  }
]
```

**File Location:** `server/Controllers/UserManagementController.cs:239-265`

---

## News Endpoints

### GET /api/news

Get all news articles.

**Authentication:** Not Required

**Response:** 200 OK
```json
[
  {
    "id": "guid",
    "titleEn": "News Title",
    "titleAr": "عنوان الخبر",
    "contentEn": "News content...",
    "contentAr": "محتوى الخبر...",
    "imageUrl": "/uploads/news/image.jpg",
    "isFeatured": true,
    "publishedAt": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### GET /api/news/{id}

Get single news article by ID.

**Authentication:** Not Required

**Parameters:**
- `id` (path): News article GUID

**Response:** 200 OK
```json
{
  "id": "guid",
  "titleEn": "News Title",
  "titleAr": "عنوان الخبر",
  "contentEn": "News content...",
  "contentAr": "محتوى الخبر...",
  "imageUrl": "/uploads/news/image.jpg",
  "isFeatured": true,
  "publishedAt": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- 404: News not found

---

### POST /api/news

Create new news article.

**Authentication:** Required (Admin/SuperAdmin)

**Request Body:**
```json
{
  "titleEn": "string (max 200)",
  "titleAr": "string (max 200)",
  "contentEn": "string",
  "contentAr": "string",
  "imageUrl": "string (max 500)",
  "isFeatured": boolean,
  "publishedAt": "datetime"
}
```

**Response:** 201 Created
```json
{
  "id": "guid",
  "titleEn": "News Title",
  /* ... full news object */
}
```

---

### PUT /api/news/{id}

Update existing news article.

**Authentication:** Required (Admin/SuperAdmin)

**Parameters:**
- `id` (path): News article GUID

**Request Body:** Same as POST

**Response:** 200 OK

**Error Responses:**
- 404: News not found

---

### DELETE /api/news/{id}

Delete news article.

**Authentication:** Required (Admin/SuperAdmin)

**Parameters:**
- `id` (path): News article GUID

**Response:** 204 No Content

**Error Responses:**
- 404: News not found

---

## Updates Endpoints

### GET /api/updates

Get all updates.

**Authentication:** Not Required

**Response:** Similar to News endpoints

### GET /api/updates/{id}

Get single update.

### POST /api/updates

Create update (Admin/SuperAdmin).

### PUT /api/updates/{id}

Update existing update (Admin/SuperAdmin).

### DELETE /api/updates/{id}

Delete update (Admin/SuperAdmin).

---

## Activities Endpoints

### GET /api/activities

Get all activities.

**Authentication:** Not Required

**Response:** 200 OK
```json
[
  {
    "id": "guid",
    "titleEn": "Activity Title",
    "titleAr": "عنوان النشاط",
    "descriptionEn": "Description...",
    "descriptionAr": "الوصف...",
    "imageUrl": "/uploads/activities/image.jpg",
    "activityDate": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### GET /api/activities/{id}

Get single activity.

### POST /api/activities

Create activity (Admin/SuperAdmin).

### PUT /api/activities/{id}

Update activity (Admin/SuperAdmin).

### DELETE /api/activities/{id}

Delete activity (Admin/SuperAdmin).

---

## Departments Endpoints

### GET /api/departments

Get all departments.

**Authentication:** Not Required

**Response:** 200 OK
```json
[
  {
    "id": "guid",
    "nameEn": "Department Name",
    "nameAr": "اسم القسم",
    "descriptionEn": "Description...",
    "descriptionAr": "الوصف...",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### GET /api/departments/{id}

Get single department.

### POST /api/departments

Create department (Admin/SuperAdmin).

### PUT /api/departments/{id}

Update department (Admin/SuperAdmin).

### DELETE /api/departments/{id}

Delete department (Admin/SuperAdmin).

---

## Lecture Schedules Endpoints

### GET /api/lectureschedules

Get all lecture schedules with optional filtering.

**Authentication:** Not Required

**Query Parameters:**
- `branchId` (optional): Filter by branch GUID
- `studyTypeId` (optional): Filter by study type GUID
- `stageId` (optional): Filter by stage GUID

**Response:** 200 OK
```json
[
  {
    "id": "guid",
    "subjectEn": "Subject Name",
    "subjectAr": "اسم المادة",
    "instructorEn": "Instructor Name",
    "instructorAr": "اسم المدرس",
    "dayOfWeek": "Monday",
    "startTime": "08:00:00",
    "endTime": "10:00:00",
    "roomEn": "Room 101",
    "roomAr": "قاعة 101",
    "branchId": "guid",
    "studyTypeId": "guid",
    "stageId": "guid"
  }
]
```

### POST /api/lectureschedules

Create a new lecture schedule entry.

**Authentication:** Required (Admin/SuperAdmin)
**Authorization Policy:** `AdminOnly`

**Request Body:**
```json
{
  "branchId": "guid",
  "studyTypeId": "guid",
  "stageId": "guid",
  "day": "Monday",
  "startTime": "08:00:00",
  "endTime": "10:00:00",
  "subjectNameEn": "Data Structures",
  "subjectNameAr": "هياكل بيانات",
  "instructorName": "Dr. Ali",
  "roomNumber": "Lab2"
}
```

> **Note:** `startTime` and `endTime` must be in `HH:MM:SS` format (`TimeSpan`).
> The frontend `schedulesService.js` normalizes `HH:MM` from HTML time inputs to `HH:MM:SS` automatically.

**Response:** 201 Created (returns full `LectureScheduleDto`)

### PUT /api/lectureschedules/{id}

Update an existing lecture schedule entry.

**Authentication:** Required (Admin/SuperAdmin)
**Authorization Policy:** `AdminOnly`

**Request Body:** Same schema as POST.

**Response:** 200 OK (returns updated `LectureScheduleDto`)

### DELETE /api/lectureschedules/{id}

Delete a lecture schedule entry.

**Authentication:** Required (Admin/SuperAdmin)
**Authorization Policy:** `AdminOnly`

**Response:** 200 OK
```json
{ "message": "Lecture schedule deleted successfully" }
```

---

## Course Materials Endpoints

### GET /api/coursematerials

Get all course materials with optional filtering.

**Authentication:** Not Required

**Query Parameters:**
- `branchId` (optional): Filter by branch GUID
- `studyTypeId` (optional): Filter by study type GUID
- `stageId` (optional): Filter by stage GUID

**Response:** 200 OK
```json
[
  {
    "id": "guid",
    "titleEn": "Material Title",
    "titleAr": "عنوان المادة",
    "descriptionEn": "Description...",
    "descriptionAr": "الوصف...",
    "fileUrl": "/uploads/materials/file.pdf",
    "fileName": "document.pdf",
    "fileSize": 1024000,
    "branchId": "guid",
    "studyTypeId": "guid",
    "stageId": "guid",
    "uploadedAt": "2024-01-01T00:00:00Z"
  }
]
```

### POST /api/coursematerials

Create course material with file upload (Admin/SuperAdmin).

**Request:** multipart/form-data
- `titleEn`: string
- `titleAr`: string
- `descriptionEn`: string
- `descriptionAr`: string
- `file`: file (max 50MB)
- `branchId`: guid (optional)
- `studyTypeId`: guid (optional)
- `stageId`: guid (optional)

### PUT /api/coursematerials/{id}

Update course material (Admin/SuperAdmin).

### DELETE /api/coursematerials/{id}

Delete course material and associated file (Admin/SuperAdmin).

---

## Grades Endpoints

### GET /api/grades

Get all grades with optional filtering.

**Authentication:** Required (any authenticated user)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| branchId | Guid (optional) | Filter by branch |
| studyTypeId | Guid (optional) | Filter by study type |
| stageId | Guid (optional) | Filter by stage |

**Response (200):**
```json
[
  {
    "id": "guid",
    "subjectName": "Data Structures",
    "branchId": "guid",
    "branchNameEn": "Software Engineering",
    "branchNameAr": "هندسة البرمجيات",
    "studyTypeId": "guid",
    "studyTypeNameEn": "Morning",
    "studyTypeNameAr": "صباحي",
    "stageId": "guid",
    "stageNameEn": "Second Stage",
    "stageNameAr": "مرحلة ثانية",
    "stageNumber": 2,
    "fileUrl": "/uploads/grades/filename.xlsx",
    "fileType": "xlsx",
    "originalFileName": "grades_2026.xlsx",
    "uploadedBy": "guid",
    "uploadedByName": "Dr. Name",
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-01T00:00:00Z"
  }
]
```

### GET /api/grades/{id}

Get a single grade by ID.

**Authentication:** Required (any authenticated user)

### POST /api/grades

Upload a new grade file.

**Authentication:** Required (Faculty user type OR Admin/SuperAdmin role)

**Content-Type:** multipart/form-data

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| subjectName | string | Yes | Subject name (max 200 chars) |
| branchId | Guid | Yes | Branch identifier |
| studyTypeId | Guid | Yes | Study type identifier |
| stageId | Guid | Yes | Stage identifier |
| file | File | Yes | Grade file (max 50MB) |

**Allowed File Types:** pdf, doc, docx, xls, xlsx, csv, ods, ppt, pptx, png, jpg, jpeg, txt, zip, rar

**Response (201):** Created grade object

### PUT /api/grades/{id}

Update an existing grade entry.

**Authentication:** Required (owner Faculty or Admin/SuperAdmin)

**Content-Type:** multipart/form-data

**Request Body:** Same as POST, but file is optional (keeps existing file if not provided)

### DELETE /api/grades/{id}

Delete a grade and its associated file.

**Authentication:** Required (owner Faculty or Admin/SuperAdmin)

---

## About College Endpoints

### GET /api/aboutcollege

Get about college content.

**Authentication:** Not Required

**Response:** 200 OK
```json
{
  "id": "guid",
  "contentEn": "About college content...",
  "contentAr": "محتوى عن الكلية...",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### PUT /api/aboutcollege/{id}

Update about college content (Admin/SuperAdmin).

---

## Lookup Endpoints

### GET /api/branches

Get all academic branches.

**Authentication:** Not Required

**Response:** 200 OK
```json
[
  {
    "id": "guid",
    "nameEn": "Software Engineering",
    "nameAr": "هندسة البرمجيات"
  }
]
```

### GET /api/studytypes

Get all study types.

**Authentication:** Not Required

**Response:** 200 OK
```json
[
  {
    "id": "guid",
    "nameEn": "Morning",
    "nameAr": "صباحي"
  }
]
```

### GET /api/stages

Get all academic stages.

**Authentication:** Not Required

**Response:** 200 OK
```json
[
  {
    "id": "guid",
    "nameEn": "First Stage",
    "nameAr": "مرحلة اولى",
    "stageNumber": 1
  }
]
```

---

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE with no response body |
| 400 | Bad Request | Validation errors, business logic errors |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

---

## Rate Limiting

| Endpoint Pattern | Max Requests | Time Window |
|-----------------|--------------|-------------|
| /api/auth/login | 5 | 15 minutes |
| /api/auth/register | 3 | 60 minutes |
| /api/auth/* | 10 | 15 minutes |

Rate limits are per IP address. Exceeding limits returns 429 status.

---

## Code References

**Controllers:**
- Auth: `server/Controllers/AuthController.cs`
- Users: `server/Controllers/UsersController.cs`
- User Management: `server/Controllers/UserManagementController.cs`
- News: `server/Controllers/NewsController.cs`
- Updates: `server/Controllers/UpdatesController.cs`
- Activities: `server/Controllers/ActivitiesController.cs`
- Departments: `server/Controllers/DepartmentsController.cs`
- Lecture Schedules: `server/Controllers/LectureSchedulesController.cs`
- Course Materials: `server/Controllers/CourseMaterialsController.cs`
- Grades: `server/Controllers/GradesController.cs`
- About College: `server/Controllers/AboutCollegeController.cs`
- Branches: `server/Controllers/BranchesController.cs`
- Study Types: `server/Controllers/StudyTypesController.cs`
- Stages: `server/Controllers/StagesController.cs`

---

## Testing with Swagger

Interactive API documentation available at:
```
http://localhost:5000/swagger
```

Swagger UI provides:
- Complete endpoint listing
- Request/response schemas
- Try-it-out functionality
- Authentication support
