# Role-Based Access Control - Technical Implementation

## Overview

The College Management System implements a three-tier role-based access control (RBAC) system with two user types. Roles control access to administrative functions, while user types determine profile structure and available features.

## Technical Stack

- Primary technology: ASP.NET Core Authorization
- Authentication: JWT Bearer tokens with role claims
- Policy engine: Policy-based authorization
- Frontend: React Context API for role-based UI rendering

## Role Definitions

### Three-Tier Role System

**Regular (Default)**
- Assigned to all new users upon registration
- Read-only access to public content
- Can view own profile and search other users
- Cannot access admin dashboard
- Cannot modify any content

**Admin**
- Faculty members promoted by SuperAdmin
- Full content management permissions (CRUD operations)
- Access to admin dashboard and statistics
- Cannot manage user roles
- Cannot promote/demote other users

**SuperAdmin**
- Highest privilege level
- All Admin permissions plus:
  - Promote Faculty to Admin
  - Demote Admin to Regular
  - Transfer SuperAdmin role to another Faculty
  - View all user management functions

### User Type Definitions

**Student**
- Extended profile with academic information:
  - Gender
  - Branch (e.g., Software Engineering)
  - Study Type (Morning, Evening, Parallel)
  - Stage (First, Second, Third, Fourth)
- Cannot be promoted to Admin or SuperAdmin
- Access to filtered academic content

**Faculty**
- Professional profile
- Eligible for Admin/SuperAdmin roles
- Can be promoted by SuperAdmin
- Access to all academic resources

## Permission Matrix

| Feature | Regular | Admin | SuperAdmin |
|---------|---------|-------|------------|
| View Public Content | ✓ | ✓ | ✓ |
| Search Users | ✓ | ✓ | ✓ |
| View Own Profile | ✓ | ✓ | ✓ |
| Delete Own Account | ✓ | ✓ | ✓ |
| Access Admin Dashboard | ✗ | ✓ | ✓ |
| View Statistics | ✗ | ✓ | ✓ |
| View Dashboard Charts | ✗ | ✓ | ✓ |
| Create News/Updates | ✗ | ✓ | ✓ |
| Edit News/Updates | ✗ | ✓ | ✓ |
| Delete News/Updates | ✗ | ✓ | ✓ |
| Manage Activities | ✗ | ✓ | ✓ |
| Manage Departments | ✗ | ✓ | ✓ |
| Manage Schedules | ✗ | ✓ | ✓ |
| Manage Course Materials | ✗ | ✓ | ✓ |
| Upload Files | ✗ | ✓ | ✓ |
| View All Users | ✗ | ✗ | ✓ |
| Promote to Admin | ✗ | ✗ | ✓ |
| Demote to Regular | ✗ | ✗ | ✓ |
| Transfer SuperAdmin | ✗ | ✗ | ✓ |

## Backend Implementation

### Authorization Policies

**File Location:** `server/Program.cs:41-45`

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => 
        policy.RequireRole("Admin", "SuperAdmin"));
    options.AddPolicy("SuperAdminOnly", policy => 
        policy.RequireRole("SuperAdmin"));
});
```

**Policy Definitions:**
- **AdminOnly**: Requires Admin OR SuperAdmin role
- **SuperAdminOnly**: Requires SuperAdmin role only

### Controller Authorization

**AdminOnly Policy Example:**

```csharp
// server/Controllers/NewsController.cs:10-12
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class NewsController : ControllerBase
```

**SuperAdminOnly Policy Example (per-method):**

```csharp
// server/Controllers/UserManagementController.cs
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserManagementController : ControllerBase
{
    [HttpGet("users")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<IActionResult> GetAllUsers() { ... }

    [HttpGet("stats")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetUserStats() { ... }

    [HttpGet("dashboard-stats")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetDashboardStats() { ... }
}
```

The UserManagementController uses per-method authorization. Most endpoints
require SuperAdminOnly, but the stats and dashboard-stats endpoints use AdminOnly
so that both Admin and SuperAdmin users can view dashboard statistics and charts.

**Public Endpoint (No Authorization):**

```csharp
// server/Controllers/AuthController.cs:22
[HttpPost("register")]
public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
```

### Role Claims in JWT

**Token Generation:**

```csharp
// server/Services/TokenService.cs:20-27
var claims = new[]
{
    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
    new Claim(ClaimTypes.Email, user.Email),
    new Claim(ClaimTypes.Name, user.ProfileName),
    new Claim(ClaimTypes.Role, user.Role),  // Role claim for authorization
    new Claim("UserType", user.UserType)
};
```

**Role Claim:** `ClaimTypes.Role` contains "Regular", "Admin", or "SuperAdmin"

### Role Management Operations

#### Promote Faculty to Admin

**File Location:** `server/Controllers/UserManagementController.cs:104-139`

```csharp
[HttpPost("promote-to-admin")]
public async Task<IActionResult> PromoteToAdmin([FromBody] PromoteToAdminDto dto)
{
    var user = await _context.Users.FindAsync(dto.UserId);
    if (user == null)
    {
        return NotFound(new { message = "User not found" });
    }

    // Validation: Only Faculty can be promoted
    if (user.UserType != "Faculty")
    {
        return BadRequest(new { message = "Only faculty members can be promoted to admin" });
    }

    // Validation: Check current role
    if (user.Role == "Admin" || user.Role == "SuperAdmin")
    {
        return BadRequest(new { message = "User is already an admin or super admin" });
    }

    // Promote to Admin
    user.Role = "Admin";
    user.UpdatedAt = DateTime.UtcNow;
    await _context.SaveChangesAsync();

    // Audit logging
    var superAdminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    _logger.LogInformation("User {UserId} promoted to Admin by SuperAdmin {SuperAdminId}", 
        dto.UserId, superAdminId);

    return Ok(new { message = "User promoted to admin successfully", userId = user.Id, role = user.Role });
}
```

**Business Rules:**
- Only Faculty members can be promoted
- Cannot promote existing Admin or SuperAdmin
- Only SuperAdmin can perform this action
- Action is logged for audit trail

#### Demote Admin to Regular

**File Location:** `server/Controllers/UserManagementController.cs:141-176`

```csharp
[HttpPost("demote-to-regular")]
public async Task<IActionResult> DemoteToRegular([FromBody] DemoteToRegularDto dto)
{
    var user = await _context.Users.FindAsync(dto.UserId);
    if (user == null)
    {
        return NotFound(new { message = "User not found" });
    }

    // Validation: Cannot demote SuperAdmin
    if (user.Role == "SuperAdmin")
    {
        return BadRequest(new { message = "Cannot demote a super admin. Transfer super admin role first." });
    }

    // Validation: Check current role
    if (user.Role == "Regular")
    {
        return BadRequest(new { message = "User is already a regular user" });
    }

    // Demote to Regular
    user.Role = "Regular";
    user.UpdatedAt = DateTime.UtcNow;
    await _context.SaveChangesAsync();

    // Audit logging
    var superAdminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    _logger.LogInformation("User {UserId} demoted to Regular by SuperAdmin {SuperAdminId}", 
        dto.UserId, superAdminId);

    return Ok(new { message = "User demoted to regular successfully", userId = user.Id, role = user.Role });
}
```

**Business Rules:**
- Cannot demote SuperAdmin (must transfer role first)
- Cannot demote already Regular users
- Only SuperAdmin can perform this action
- Action is logged for audit trail

#### Transfer SuperAdmin Role

**File Location:** `server/Controllers/UserManagementController.cs:178-237`

```csharp
[HttpPost("transfer-superadmin")]
public async Task<IActionResult> TransferSuperAdmin([FromBody] TransferSuperAdminDto dto)
{
    // Get current SuperAdmin from JWT token
    var currentSuperAdminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(currentSuperAdminId) || 
        !Guid.TryParse(currentSuperAdminId, out var currentSuperAdminGuid))
    {
        return Unauthorized(new { message = "Invalid super admin token" });
    }

    var currentSuperAdmin = await _context.Users.FindAsync(currentSuperAdminGuid);
    if (currentSuperAdmin == null)
    {
        return NotFound(new { message = "Current super admin not found" });
    }

    var newSuperAdmin = await _context.Users.FindAsync(dto.NewSuperAdminId);
    if (newSuperAdmin == null)
    {
        return NotFound(new { message = "New super admin user not found" });
    }

    // Validation: Only Faculty can be SuperAdmin
    if (newSuperAdmin.UserType != "Faculty")
    {
        return BadRequest(new { message = "Only faculty members can be super admin" });
    }

    // Validation: Cannot transfer to self
    if (newSuperAdmin.Id == currentSuperAdminGuid)
    {
        return BadRequest(new { message = "You are already the super admin" });
    }

    // Transfer roles
    currentSuperAdmin.Role = "Admin";  // Demote current to Admin
    currentSuperAdmin.UpdatedAt = DateTime.UtcNow;

    newSuperAdmin.Role = "SuperAdmin";  // Promote new to SuperAdmin
    newSuperAdmin.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    // Audit logging
    _logger.LogInformation(
        "SuperAdmin role transferred from {OldSuperAdminId} to {NewSuperAdminId}", 
        currentSuperAdminGuid, 
        dto.NewSuperAdminId
    );

    return Ok(new 
    { 
        message = "Super admin role transferred successfully", 
        oldSuperAdminId = currentSuperAdminGuid,
        newSuperAdminId = dto.NewSuperAdminId
    });
}
```

**Business Rules:**
- Only Faculty members can become SuperAdmin
- Cannot transfer to self
- Current SuperAdmin becomes Admin (not Regular)
- Only one SuperAdmin exists at a time
- Action is logged for audit trail

## Frontend Implementation

### Component Locations

- Auth Context: `client/src/contexts/AuthContext.jsx`
- Protected Routes: `client/src/App.jsx`
- Admin Dashboard: `client/src/pages/admin/AdminDashboard.jsx`
- User Management: `client/src/pages/admin/UserManagement.jsx`

### Role-Based Route Protection

```javascript
// client/src/App.jsx
<Route path="/admin" element={
  <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
    <AdminDashboard />
  </ProtectedRoute>
} />

<Route path="/admin/user-management" element={
  <ProtectedRoute allowedRoles={['SuperAdmin']}>
    <UserManagement />
  </ProtectedRoute>
} />
```

### Conditional UI Rendering

```javascript
// Example: Show admin menu only for Admin/SuperAdmin
const { user } = useAuth();

{(user?.role === 'Admin' || user?.role === 'SuperAdmin') && (
  <Link to="/admin">Admin Dashboard</Link>
)}

// Example: Show user management only for SuperAdmin
{user?.role === 'SuperAdmin' && (
  <Link to="/admin/user-management">User Management</Link>
)}
```

### Role Check Helper

```javascript
// client/src/contexts/AuthContext.jsx
const hasRole = (requiredRoles) => {
  if (!user) return false;
  return requiredRoles.includes(user.role);
};

const isAdmin = () => hasRole(['Admin', 'SuperAdmin']);
const isSuperAdmin = () => hasRole(['SuperAdmin']);
```

## Architecture Pattern

**Pattern:** Policy-Based Authorization with JWT Claims

**Authorization Flow:**
```
Client Request with JWT
    ↓
ASP.NET Core Authentication Middleware
    ↓
Extract Claims from JWT (including Role claim)
    ↓
Authorization Middleware
    ↓
Check Policy Requirements
    ↓
├─→ AdminOnly Policy: Requires Role = "Admin" OR "SuperAdmin"
├─→ SuperAdminOnly Policy: Requires Role = "SuperAdmin"
└─→ No Policy: Public access
    ↓
Controller Action Executed (if authorized)
```

## Configuration

No additional configuration required. Roles are stored in the User entity and included in JWT tokens.

**Default Role Assignment:**

```csharp
// server/Services/AuthService.cs:53
Role = "Regular"  // All new users start as Regular
```

## Security Considerations

**Role Validation:**
- Roles validated on every API request via JWT claims
- Cannot bypass authorization by modifying frontend
- Token must be regenerated after role change

**Role Change Security:**
- Only SuperAdmin can modify roles
- Students cannot be promoted to Admin/SuperAdmin
- SuperAdmin cannot be demoted (must transfer first)
- All role changes are logged

**Token Refresh Requirement:**
- After role change, user must logout and login again
- New JWT token will contain updated role claim
- Old tokens remain valid until expiration (60 minutes)

**Audit Trail:**
- All role changes logged with:
  - Timestamp
  - User ID being modified
  - SuperAdmin ID performing action
  - Old role → New role

## API Endpoints

### GET /api/usermanagement/users

**Authorization:** SuperAdminOnly

**Response:**
```json
[
  {
    "id": "guid",
    "displayId": "string",
    "profileName": "string",
    "email": "string",
    "userType": "Student" | "Faculty",
    "role": "Regular" | "Admin" | "SuperAdmin",
    "createdAt": "datetime",
    "studentInfo": { /* if Student */ },
    "facultyInfo": { /* if Faculty */ }
  }
]
```

### GET /api/usermanagement/stats

**Authorization:** AdminOnly

**Response:**
```json
{
  "totalUsers": 100,
  "totalStudents": 85,
  "totalFaculty": 15,
  "totalAdmins": 3,
  "totalSuperAdmins": 1
}
```

### GET /api/usermanagement/dashboard-stats

**Authorization:** AdminOnly

Returns aggregated statistics for the Admin Dashboard charts including:
- Role distribution, user type distribution, students by gender/study type
- Content distribution, students per branch/stage, materials per branch
- Schedules per day, monthly registrations, content created per month

**Response:** Object with arrays of `{ name, nameAr, value }` items for each chart.

---

### POST /api/usermanagement/promote-to-admin

**Authorization:** SuperAdminOnly

**Request:**
```json
{
  "userId": "guid"
}
```

**Response:**
```json
{
  "message": "User promoted to admin successfully",
  "userId": "guid",
  "role": "Admin"
}
```

### POST /api/usermanagement/demote-to-regular

**Authorization:** SuperAdminOnly

**Request:**
```json
{
  "userId": "guid"
}
```

**Response:**
```json
{
  "message": "User demoted to regular successfully",
  "userId": "guid",
  "role": "Regular"
}
```

### POST /api/usermanagement/transfer-superadmin

**Authorization:** SuperAdminOnly

**Request:**
```json
{
  "newSuperAdminId": "guid"
}
```

**Response:**
```json
{
  "message": "Super admin role transferred successfully",
  "oldSuperAdminId": "guid",
  "newSuperAdminId": "guid"
}
```

### GET /api/usermanagement/faculty-users

**Authorization:** SuperAdminOnly

**Response:**
```json
[
  {
    "id": "guid",
    "displayId": "string",
    "profileName": "string",
    "email": "string",
    "role": "Regular" | "Admin" | "SuperAdmin"
  }
]
```

## Code References

**Backend:**
- Authorization Policies: `server/Program.cs:41-45`
- User Management Controller: `server/Controllers/UserManagementController.cs:10-265`
- Token Service (Role Claims): `server/Services/TokenService.cs:20-27`
- User Entity: `server/Models/Entities/User.cs:32-33`
- Auth Service (Default Role): `server/Services/AuthService.cs:53`

**Frontend:**
- Auth Context: `client/src/contexts/AuthContext.jsx`
- Protected Routes: `client/src/App.jsx`
- User Management Page: `client/src/pages/admin/UserManagement.jsx`

## Testing Considerations

**Key Test Scenarios:**
1. Regular user cannot access admin endpoints
2. Admin can access AdminOnly endpoints
3. Admin cannot access SuperAdminOnly endpoints
4. SuperAdmin can access all endpoints
5. Promote Faculty to Admin (success)
6. Promote Student to Admin (should fail)
7. Demote Admin to Regular (success)
8. Demote SuperAdmin to Regular (should fail)
9. Transfer SuperAdmin role (success)
10. Transfer SuperAdmin to Student (should fail)

**Edge Cases:**
- Expired JWT token with valid role claim
- Modified JWT token with fake role claim (should fail signature validation)
- Concurrent role changes
- Role change while user is logged in (old token still valid)
- Transfer SuperAdmin to self (should fail)
- Promote already-Admin user (should fail)

## Performance Considerations

- Role checks are in-memory (JWT claims)
- No database lookup required for authorization
- Policy evaluation is fast (claim-based)
- Role changes require database update only

## Future Enhancements

- Implement role hierarchy (Admin inherits Regular permissions)
- Add custom permissions beyond roles (fine-grained access control)
- Implement role expiration dates
- Add role change approval workflow
- Implement role-based data filtering (row-level security)
- Add role assignment history tracking
- Implement temporary role elevation
- Add role-based API rate limiting
- Implement multi-tenancy with role scoping
- Add role-based feature flags
