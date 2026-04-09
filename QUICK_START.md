# Quick Start Guide

Get the Computer Science College workspace up and running in minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18+ and npm
- .NET 8.0 SDK
- PostgreSQL 14+

## Step 1: Database Setup

Run the automated database setup script:

```bash
./setup-database.sh
```

This will:
- Check PostgreSQL installation
- Create the database
- Apply migrations
- Seed initial data

If you encounter issues, see `DATABASE_SETUP.md` for detailed instructions.

## Step 2: Install Dependencies

### Backend
```bash
cd server
dotnet restore
```

### Frontend
```bash
cd client
npm install
```

## Step 3: Start the Application

Open two terminal windows:

### Terminal 1: Start Backend
```bash
cd server
dotnet run
```

The API will be available at: http://localhost:5000
Swagger documentation: http://localhost:5000/swagger

### Terminal 2: Start Frontend
```bash
cd client
npm run dev
```

The application will be available at: http://localhost:5173

## Default Configuration

### Database
- Host: localhost
- Database: ComputerScienceCollege
- Username: postgres
- Password: postgres

### API
- Base URL: http://localhost:5000/api
- JWT Expiration: 24 hours

### Frontend
- Dev Server: http://localhost:5173
- Default Language: Arabic (RTL)
- Default Theme: Light

## First Steps

1. **Register an Account**
   - Visit http://localhost:5173
   - Choose Student or Faculty account type
   - Fill in registration form
   - For students: Complete additional information

2. **Explore Public Pages**
   - Homepage
   - About the College
   - Activities
   - Departments & Units
   - Lecture Schedules
   - Course Materials

3. **Create Super Admin** (Manual Database Update)
   
   To create the first super admin, update a faculty user in the database:
   
   ```sql
   -- Connect to database
   psql -U postgres -d ComputerScienceCollege
   
   -- Update user role to SuperAdmin
   UPDATE "Users" 
   SET "Role" = 'SuperAdmin' 
   WHERE "Email" = 'your-faculty-email@example.com';
   ```

## Available Scripts

### Backend
- `dotnet run` - Start development server
- `dotnet build` - Build the project
- `dotnet test` - Run tests
- `dotnet ef migrations add <name>` - Create new migration
- `dotnet ef database update` - Apply migrations

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
College/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── services/    # API services
│   │   └── utils/       # Utilities
│   └── package.json
│
├── server/              # ASP.NET Core backend
│   ├── Controllers/     # API endpoints
│   ├── Services/        # Business logic
│   ├── Repositories/    # Data access
│   ├── Models/          # Data models
│   └── Data/            # DB context
│
├── setup-database.sh    # Database setup script
├── DATABASE_SETUP.md    # Detailed DB guide
└── README.md            # Project documentation
```

## Seeded Data

The database comes pre-populated with:

### Branches
- Software Engineering
- Cyber Security
- Information Systems
- Artificial Intelligence
- Network Engineering
- Multimedia

### Study Types
- All Types (default)
- Morning
- Evening
- Parallel

### Stages
- First Stage
- Second Stage
- Third Stage
- Fourth Stage

## Testing the API

### Using Swagger
Visit http://localhost:5000/swagger to test API endpoints interactively.

### Using curl

**Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "profileName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!",
    "userType": "Student"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

## Common Issues

### Port Already in Use

**Backend (5000):**
```bash
# Find process using port 5000
lsof -i :5000
# Kill the process
kill -9 <PID>
```

**Frontend (5173):**
```bash
# Find process using port 5173
lsof -i :5173
# Kill the process
kill -9 <PID>
```

### Database Connection Failed

1. Check PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Verify credentials in `server/appsettings.json`

3. Check pg_hba.conf allows password authentication

See `DATABASE_SETUP.md` for detailed troubleshooting.

### CORS Errors

The backend is configured to allow requests from:
- http://localhost:5173
- http://localhost:3000

If using a different port, update `server/Program.cs`:
```csharp
policy.WithOrigins("http://localhost:YOUR_PORT")
```

## Next Steps

1. **Customize the Application**
   - Update branding and colors
   - Add your college logo
   - Customize content

2. **Add Content**
   - Create news items
   - Add activities
   - Upload course materials
   - Set up lecture schedules

3. **Configure Users**
   - Create super admin
   - Promote faculty to admin
   - Manage user roles

4. **Deploy to Production**
   - See deployment documentation
   - Configure production database
   - Set up SSL certificates

## Support

For issues or questions:
1. Check `DATABASE_SETUP.md` for database issues
2. Check `README.md` for general documentation
3. Review API documentation at /swagger
4. Check application logs in `server/logs/`

## Development Tips

- Use Swagger UI for API testing
- Check browser console for frontend errors
- Monitor backend logs for API errors
- Use React DevTools for debugging
- Test with both Arabic and English languages
- Test with both light and dark themes
- Verify RTL layout in Arabic mode
