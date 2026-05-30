# College Management System

A comprehensive, enterprise-grade web application for managing Computer Science College operations. Features include multi-role access control, bilingual support (Arabic/English), content management, and secure authentication with advanced security hardening.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Security](#security)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

The College Management System is a full-stack web application designed to streamline administrative and academic operations for a Computer Science College. The system provides role-based access control, content management capabilities, and a bilingual interface supporting both Arabic (RTL) and English languages.

## Features

### Core Functionality

- **User Management**: Registration, authentication, and profile management with unique display IDs
- **Role-Based Access Control**: Three-tier permission system (SuperAdmin, Admin, Regular)
- **Content Management**: Dynamic management of news, updates, activities, and departments
- **Academic Resources**: Lecture schedules and course materials with advanced filtering
- **Grades Management**: Faculty can upload grade files per subject; students view grades via subject tabs
- **Bilingual Support**: Complete Arabic (RTL) and English language support
- **Theme System**: Light and dark mode with persistent preferences
- **File Management**: Secure file upload and storage for course materials
- **User Search**: Search users by unique display ID
- **Audit Logging**: Comprehensive activity tracking for compliance

### Security Features

- **Password Strength Validation**: Enforces complex password requirements
- **Account Lockout**: Automatic lockout after 5 failed login attempts (30-minute duration)
- **Rate Limiting**: IP-based rate limiting on authentication endpoints
- **Security Headers**: HSTS, CSP, X-Frame-Options, and other protective headers
- **File Upload Security**: Content validation, size limits, and extension whitelisting
- **JWT Authentication**: Secure token-based authentication with 60-minute expiration
- **BCrypt Password Hashing**: Industry-standard password encryption
- **User Secrets**: Secure credential management for development

### User Roles

**SuperAdmin**
- Full system access and control
- User role management (promote/demote admins)
- Transfer SuperAdmin privileges
- Content management permissions

**Admin**
- Content management (create, update, delete)
- View system statistics
- Manage academic resources
- Cannot modify user roles

**Regular User**
- View public content
- Access lecture schedules and materials
- Search for other users
- Manage own profile

### User Types

**Student**
- Additional profile information (branch, study type, stage, gender)
- Access to filtered academic content
- Personalized schedule view

**Faculty**
- Professional profile
- Can be promoted to Admin role
- Access to all academic resources
- Upload and manage student grade files (per subject, branch, stage, study type)

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|----------|
| React | 19.x | UI framework |
| Vite | 6.x | Build tool and dev server |
| React Router | 7.x | Client-side routing |
| Tailwind CSS | 3.x | Utility-first CSS framework |
| Axios | 1.x | HTTP client |
| i18next | 24.x | Internationalization |
| Lucide React | Latest | Icon library |

### Backend

| Technology | Version | Purpose |
|------------|---------|----------|
| ASP.NET Core | 8.0 | Web API framework |
| Entity Framework Core | 8.0 | ORM for database access |
| PostgreSQL | 16.x | Relational database |
| BCrypt.Net | 0.1.0 | Password hashing |
| Serilog | 4.x | Structured logging |
| AutoMapper | 13.x | Object-to-object mapping |
| JWT Bearer | 8.0 | Authentication middleware |

### Development Tools

- **Version Control**: Git
- **API Testing**: Swagger/OpenAPI
- **Database Management**: pgAdmin 4
- **Code Editor**: Visual Studio Code / Visual Studio 2022

## Architecture

### System Architecture

The application follows a three-tier architecture pattern:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (React SPA with React Router and Context API)         │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTP/REST
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│  (ASP.NET Core Web API with JWT Authentication)        │
│  ├── Controllers (API Endpoints)                        │
│  ├── Services (Business Logic)                          │
│  ├── Middleware (Security, Logging)                     │
│  └── Validators (Input Validation)                      │
└─────────────────────────────────────────────────────────┘
                          ↓ EF Core
┌─────────────────────────────────────────────────────────┐
│                      Data Layer                          │
│  (Entity Framework Core + PostgreSQL)                   │
│  ├── Repositories (Data Access)                         │
│  ├── DbContext (Database Context)                       │
│  └── Migrations (Schema Versioning)                     │
└─────────────────────────────────────────────────────────┘
```

### Project Structure

```
College/
├── client/                          # Frontend application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── layout/              # Layout components (Header, Footer)
│   │   │   ├── auth/                # Authentication components
│   │   │   └── common/              # Shared components
│   │   ├── pages/                   # Page components
│   │   │   ├── public/              # Public pages
│   │   │   ├── admin/               # Admin dashboard pages
│   │   │   └── auth/                # Authentication pages
│   │   ├── contexts/                # React Context providers
│   │   │   ├── AuthContext.jsx      # Authentication state
│   │   │   ├── LanguageContext.jsx  # i18n state
│   │   │   └── ThemeContext.jsx     # Theme state
│   │   ├── services/                # API service layer
│   │   │   ├── api.js               # Axios instance
│   │   │   ├── authService.js       # Auth API calls
│   │   │   └── [feature]Service.js  # Feature-specific APIs
│   │   ├── utils/                   # Utility functions
│   │   ├── hooks/                   # Custom React hooks
│   │   └── assets/                  # Static assets
│   ├── public/                      # Public static files
│   ├── package.json                 # NPM dependencies
│   └── vite.config.js               # Vite configuration
│
├── server/                          # Backend application
│   ├── Controllers/                 # API endpoint controllers
│   │   ├── AuthController.cs        # Authentication endpoints
│   │   ├── UsersController.cs       # User management
│   │   ├── NewsController.cs        # News management
│   │   └── [Feature]Controller.cs   # Feature controllers
│   ├── Services/                    # Business logic services
│   │   ├── IAuthService.cs          # Auth service interface
│   │   ├── AuthService.cs           # Auth implementation
│   │   ├── ITokenService.cs         # JWT service interface
│   │   ├── TokenService.cs          # JWT implementation
│   │   ├── ILoginAttemptService.cs  # Login tracking interface
│   │   ├── LoginAttemptService.cs   # Login tracking implementation
│   │   └── [Feature]Service.cs      # Feature services
│   ├── Repositories/                # Data access layer
│   │   ├── IUserRepository.cs       # User repository interface
│   │   └── UserRepository.cs        # User repository implementation
│   ├── Models/                      # Data models
│   │   ├── Entities/                # Database entities
│   │   └── DTOs/                    # Data transfer objects
│   ├── Data/                        # Database context
│   │   └── ApplicationDbContext.cs  # EF Core DbContext
│   ├── Middleware/                  # Custom middleware
│   │   ├── SecurityHeadersMiddleware.cs
│   │   └── RateLimitingMiddleware.cs
│   ├── Validators/                  # Input validators
│   │   └── PasswordValidator.cs     # Password strength validator
│   ├── Migrations/                  # EF Core migrations
│   ├── wwwroot/                     # Static files and uploads
│   ├── logs/                        # Application logs
│   ├── Program.cs                   # Application entry point
│   ├── appsettings.json             # Configuration (git-ignored)
│   ├── appsettings.template.json    # Configuration template
│   └── CollegeAPI.csproj            # Project file
│
├── docs/                            # Technical Documentation
│   ├── API_ENDPOINTS.md             # Complete API reference
│   ├── AUTHENTICATION_IMPLEMENTATION.md  # JWT auth and security
│   ├── CONTENT_MANAGEMENT.md        # CMS features
│   ├── DATABASE_SCHEMA.md           # Database structure
│   ├── FRONTEND_ARCHITECTURE.md     # React app architecture
│   ├── INTERNATIONALIZATION.md      # Bilingual support
│   ├── MIDDLEWARE_PIPELINE.md       # Request processing
│   ├── ROLE_BASED_ACCESS_CONTROL.md # RBAC implementation
│   ├── SECURITY_FEATURES.md         # Security hardening
│   └── USER_MANAGEMENT.md           # User lifecycle
│
├── .gitignore                       # Git ignore rules
└── README.md                        # This file
```

## Prerequisites

### Required Software

- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher (comes with Node.js)
- **.NET SDK**: Version 8.0 or higher
- **PostgreSQL**: Version 14.0 or higher
- **Git**: For version control

### Optional Tools

- **pgAdmin 4**: PostgreSQL database management
- **Postman**: API testing
- **Visual Studio Code**: Code editor
- **Visual Studio 2022**: IDE for .NET development

### System Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 8GB (16GB recommended)
- **Disk Space**: Minimum 2GB free space
- **Network**: Internet connection for package downloads

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd College
```

### 2. Database Setup

#### Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

#### Create Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Or on Windows/macOS
psql -U postgres

# Create database
CREATE DATABASE ComputerScienceCollege;

# Create user (optional)
CREATE USER college_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE ComputerScienceCollege TO college_user;

# Exit
\q
```

### 3. Backend Setup

#### Install Dependencies

```bash
cd server
dotnet restore
```

#### Configure Secrets

**IMPORTANT**: Never commit sensitive credentials to version control.

**Option 1: User Secrets (Development - Recommended)**

```bash
# Initialize user secrets
dotnet user-secrets init

# Set database connection
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Database=ComputerScienceCollege;Username=your_username;Password=your_password"

# Generate and set JWT key
openssl rand -base64 64
dotnet user-secrets set "Jwt:Key" "<generated-key-from-above>"

# Verify secrets
dotnet user-secrets list
```

**Option 2: Environment Variables (Production)**

```bash
export ConnectionStrings__DefaultConnection="Host=localhost;Database=ComputerScienceCollege;Username=your_username;Password=your_password"
export Jwt__Key="<your-generated-jwt-key>"
```

#### Run Migrations

```bash
# Apply existing migrations
dotnet ef database update

# Or create new migration if needed
dotnet ef migrations add InitialCreate
dotnet ef database update
```

#### Start the Server

```bash
dotnet run
```

The API will be available at:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `http://localhost:5000/swagger`

### 4. Frontend Setup

#### Install Dependencies

```bash
cd ../client
npm install
```

#### Configure Environment

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

#### Start Development Server

```bash
npm run dev
```

The frontend will be available at:
- Development: `http://localhost:5173`

#### Build for Production

```bash
npm run build
```

Production files will be in the `dist/` directory.

## Configuration

### Backend Configuration

The backend uses a hierarchical configuration system:

1. **appsettings.json**: Base configuration (committed to git with placeholders)
2. **User Secrets**: Development secrets (local only, not in git)
3. **Environment Variables**: Production secrets (server configuration)

#### Configuration Files

**appsettings.json** (Safe template - committed to git):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "REPLACE_WITH_USER_SECRETS"
  },
  "Jwt": {
    "Key": "REPLACE_WITH_USER_SECRETS",
    "Issuer": "CollegeAPI",
    "Audience": "CollegeClient",
    "ExpirationInMinutes": 60
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information"
    }
  }
}
```

**appsettings.Development.json** (Optional, git-ignored):
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug"
    }
  }
}
```

### Frontend Configuration

**Environment Variables** (`.env` file):
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=College Management System
```

### Security Configuration

#### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- Not in common password list
- No repeating characters (aaa)
- No sequential characters (abc, 123)

#### Rate Limits
- Login: 5 requests per 15 minutes per IP
- Registration: 3 requests per 60 minutes per IP
- General auth endpoints: 10 requests per 15 minutes per IP

#### Account Lockout
- Failed attempts threshold: 5
- Lockout duration: 30 minutes
- Attempts reset: 15 minutes after last attempt

## Security

### Authentication & Authorization

- **JWT Tokens**: Secure, stateless authentication
- **Token Expiration**: 60 minutes (configurable)
- **Password Hashing**: BCrypt with automatic salting
- **Role-Based Access Control**: Three-tier permission system

### Security Headers

The application implements the following security headers:

- **Strict-Transport-Security**: Forces HTTPS connections
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: Enables XSS filtering
- **Content-Security-Policy**: Restricts resource loading
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

### File Upload Security

- **Size Limit**: 50MB maximum
- **Allowed Extensions**: .pdf, .doc, .docx, .ppt, .pptx, .xls, .xlsx, .csv, .ods, .txt, .png, .jpg, .jpeg, .zip, .rar
- **Content Validation**: Magic byte verification
- **Filename Sanitization**: Removes dangerous characters
- **Unique Filenames**: GUID-based naming to prevent overwrites

### Best Practices Implemented

- Input validation on all endpoints
- SQL injection prevention via parameterized queries
- XSS protection through output encoding
- CSRF protection for state-changing operations
- Secure session management
- Comprehensive audit logging
- Regular security updates

### Secrets Management

**Development:**
- Use .NET User Secrets (`dotnet user-secrets`)
- Never commit `appsettings.json` with real secrets
- Use `appsettings.template.json` for sharing configuration structure

**Production:**
- Use environment variables
- Use Azure Key Vault, AWS Secrets Manager, or similar
- Rotate secrets regularly (every 90 days recommended)
- Use different secrets for each environment

## API Documentation

### Swagger/OpenAPI

Interactive API documentation is available when running the backend:

```
http://localhost:5000/swagger
```

### Authentication Endpoints

**POST /api/auth/register**
- Register new user account
- Returns JWT token and user information

**POST /api/auth/login**
- Authenticate user
- Returns JWT token
- Implements rate limiting and account lockout

**POST /api/auth/student-info**
- Add student-specific information
- Requires authentication

**DELETE /api/auth/account**
- Delete user account
- Requires authentication

### User Endpoints

**GET /api/users/search/{displayId}**
- Search for user by display ID
- Returns user profile information

**GET /api/users/profile/{displayId}**
- Get detailed user profile
- Includes student information if applicable

### Content Management Endpoints

**News**: `/api/news`
**Updates**: `/api/updates`
**Activities**: `/api/activities`
**Departments**: `/api/departments`
**Lecture Schedules**: `/api/lectureschedules`
**Course Materials**: `/api/coursematerials`
**Grades**: `/api/grades`
**About College**: `/api/aboutcollege`

Each content endpoint supports:
- GET (list/single)
- POST (create - admin only)
- PUT (update - admin only)
- DELETE (delete - admin only)

**Note**: The Grades endpoint has different authorization rules:
- GET requires authentication (any logged-in user)
- POST/PUT/DELETE requires Faculty user type or Admin/SuperAdmin role

For detailed API documentation, see [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

## Development

### Code Style Guidelines

**C# Backend:**
- Follow Microsoft C# Coding Conventions
- Use PascalCase for public members
- Use camelCase for private fields with underscore prefix
- Use async/await for asynchronous operations
- Implement proper error handling and logging

**JavaScript/React Frontend:**
- Follow Airbnb JavaScript Style Guide
- Use functional components with hooks
- Use PascalCase for component names
- Use camelCase for functions and variables
- Implement proper prop validation

### Git Workflow

1. Create feature branch from main
2. Make changes with descriptive commits
3. Test thoroughly
4. Create pull request
5. Code review
6. Merge to main

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes (formatting)
- refactor: Code refactoring
- test: Adding tests
- chore: Maintenance tasks

**Example:**
```
feat(auth): implement password strength validation

Added comprehensive password validation with:
- Minimum 8 characters
- Complexity requirements
- Common password check
- Sequential character detection

Closes #123
```

### Development Tools

**Recommended VS Code Extensions:**
- C# Dev Kit
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- GitLens
- REST Client

**Useful Commands:**

```bash
# Backend
dotnet watch run              # Run with hot reload
dotnet build                  # Build project
dotnet test                   # Run tests
dotnet ef migrations add <name>  # Create migration
dotnet ef database update     # Apply migrations

# Frontend
npm run dev                   # Development server
npm run build                 # Production build
npm run preview               # Preview production build
npm run lint                  # Run linter
```

## Testing

### Backend Testing

```bash
cd server
dotnet test
```

### Frontend Testing

```bash
cd client
npm run test
```

### Manual Testing

1. Use Swagger UI for API testing: `http://localhost:5000/swagger`
2. Use Postman collection (if available)
3. Test all user roles and permissions
4. Test bilingual functionality
5. Test theme switching
6. Test file uploads
7. Test security features (rate limiting, account lockout)

### Test Coverage

For detailed testing procedures, see [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)

## Deployment

### Production Checklist

- [ ] Update all secrets (database password, JWT key)
- [ ] Configure environment variables
- [ ] Enable HTTPS
- [ ] Configure production database
- [ ] Set up logging and monitoring
- [ ] Configure backup strategy
- [ ] Review security headers
- [ ] Test all functionality
- [ ] Set up CI/CD pipeline
- [ ] Configure domain and SSL certificate

### Deployment Options

**Backend:**
- Azure App Service
- AWS Elastic Beanstalk
- Docker containers
- Traditional IIS hosting

**Frontend:**
- Netlify
- Vercel
- Azure Static Web Apps
- AWS S3 + CloudFront

**Database:**
- Azure Database for PostgreSQL
- AWS RDS for PostgreSQL
- Self-hosted PostgreSQL

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)

## Contributing

### Guidelines

1. Fork the repository
2. Create a feature branch
3. Follow code style guidelines
4. Write meaningful commit messages
5. Test your changes thoroughly
6. Submit a pull request

### Code Review Process

- All code must be reviewed before merging
- Address all review comments
- Ensure CI/CD pipeline passes
- Update documentation if needed

### Reporting Issues

When reporting issues, include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, versions)
- Screenshots if applicable

## Support

For questions or support:
- Create an issue in the repository
- Contact me
- Refer to documentation in the `docs/` directory

## License

This project is proprietary and confidential. All rights reserved.

## Acknowledgments

- Built with ASP.NET Core and React
- Uses industry-standard security practices
- Follows OWASP security guidelines
- Implements accessibility best practices

---

**Version**: 1.0.0  
**Last Updated**: May 2026  
**Maintained By**: Mohammed Jalal
