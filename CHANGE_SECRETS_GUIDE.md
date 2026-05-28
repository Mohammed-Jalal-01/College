# How to Change JWT Secret and Database Password
**Step-by-Step Guide for College Management System**

---

## 🎯 What You'll Do

1. Change your PostgreSQL database password
2. Generate a new JWT secret key
3. Store both securely using .NET User Secrets
4. Update appsettings.json to use placeholders
5. Test that everything works

**Time Required:** 5 minutes  
**Difficulty:** Easy

---

## 📋 Step 1: Change Database Password

### Open PostgreSQL Terminal

```bash
# Connect to PostgreSQL
psql -U mohammedjalal -d ComputerScienceCollege
```

**Enter your current password when prompted:** `Travis2099`

### Generate a Strong New Password

Open a new terminal and run:

```bash
# Generate a secure random password
openssl rand -base64 32
```

**Example output:**
```
xK9mP2vL8nQ4wR7tY5uI3oP6aS1dF0gH2jK4lM9nB8vC=
```

**COPY THIS PASSWORD - You'll need it in Step 3!**

### Change the Password in PostgreSQL

Back in the PostgreSQL terminal:

```sql
-- Replace YOUR_NEW_PASSWORD with the password you just generated
ALTER USER mohammedjalal WITH PASSWORD 'xK9mP2vL8nQ4wR7tY5uI3oP6aS1dF0gH2jK4lM9nB8vC=';
```

**Expected output:**
```
ALTER ROLE
```

### Exit PostgreSQL

```sql
\q
```

✅ **Database password changed!**

---

## 🔑 Step 2: Generate JWT Secret Key

```bash
# Generate a cryptographically secure JWT key (64 bytes)
openssl rand -base64 64
```

**Example output:**
```
aB3cD5eF7gH9iJ1kL3mN5oP7qR9sT1uV3wX5yZ7aB9cD1eF3gH5iJ7kL9mN1oP3qR5sT7uV9wX1yZ3aB5cD7eF9gH=
```

**📝 COPY THIS KEY - You'll need it in Step 3!**

---

## 💾 Step 3: Store Secrets Using User Secrets

### Navigate to Server Directory

```bash
cd /home/mohammed-jalal/Documents/Software/College-project/College/server
```

### Initialize User Secrets

```bash
dotnet user-secrets init
```

**Expected output:**
```
Set UserSecretsId to 'xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx' for MSBuild project '/home/mohammed-jalal/Documents/Software/College-project/College/server/CollegeAPI.csproj'.
```

### Set Database Connection String

**Replace `YOUR_NEW_PASSWORD` with the password from Step 1:**

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Database=ComputerScienceCollege;Username=mohammedjalal;Password=YOUR_NEW_PASSWORD"
```

**Example:**
```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Database=ComputerScienceCollege;Username=mohammedjalal;Password=xK9mP2vL8nQ4wR7tY5uI3oP6aS1dF0gH2jK4lM9nB8vC="
```

**Expected output:**
```
Successfully saved ConnectionStrings:DefaultConnection = Host=localhost;Database=ComputerScienceCollege;Username=mohammedjalal;Password=xK9mP2vL8nQ4wR7tY5uI3oP6aS1dF0gH2jK4lM9nB8vC= to the secret store.
```

### Set JWT Key

**Replace `YOUR_JWT_KEY` with the key from Step 2:**

```bash
dotnet user-secrets set "Jwt:Key" "YOUR_JWT_KEY"
```

**Example:**
```bash
dotnet user-secrets set "Jwt:Key" "aB3cD5eF7gH9iJ1kL3mN5oP7qR9sT1uV3wX5yZ7aB9cD1eF3gH5iJ7kL9mN1oP3qR5sT7uV9wX1yZ3aB5cD7eF9gH="
```

**Expected output:**
```
Successfully saved Jwt:Key = aB3cD5eF7gH9iJ1kL3mN5oP7qR9sT1uV3wX5yZ7aB9cD1eF3gH5iJ7kL9mN1oP3qR5sT7uV9wX1yZ3aB5cD7eF9gH= to the secret store.
```

### Verify Secrets Are Stored

```bash
dotnet user-secrets list
```

**Expected output:**
```
ConnectionStrings:DefaultConnection = Host=localhost;Database=ComputerScienceCollege;Username=mohammedjalal;Password=xK9mP2vL8nQ4wR7tY5uI3oP6aS1dF0gH2jK4lM9nB8vC=
Jwt:Key = aB3cD5eF7gH9iJ1kL3mN5oP7qR9sT1uV3wX5yZ7aB9cD1eF3gH5iJ7kL9mN1oP3qR5sT7uV9wX1yZ3aB5cD7eF9gH=
```

✅ **Secrets stored securely!**

---

## 📝 Step 4: Update appsettings.json

Open `/server/appsettings.json` and replace the entire content with:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
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
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    }
  }
}
```

**Important:** The values "REPLACE_WITH_USER_SECRETS" are placeholders. The actual secrets will come from User Secrets.

✅ **appsettings.json updated with safe placeholders!**

---

## ✅ Step 5: Test Everything Works

### Build the Project

```bash
cd /home/mohammed-jalal/Documents/Software/College-project/College/server
dotnet build
```

**Expected output:**
```
Build succeeded.
```

### Run the Project

```bash
dotnet run
```

**Expected output:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

### Test Database Connection

In another terminal:

```bash
# Test login endpoint (should connect to database)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test"
  }'
```

**If database connection works, you'll get a response (even if credentials are wrong).**

**If database connection fails, you'll see:**
```
Connection failed
```

### Stop the Server

Press `Ctrl+C` in the terminal running the server.

✅ **Everything works!**

---

## 🔍 Where Are Secrets Stored?

User Secrets are stored in:

```
~/.microsoft/usersecrets/<UserSecretsId>/secrets.json
```

**Example:**
```
/home/mohammed-jalal/.microsoft/usersecrets/a1b2c3d4-e5f6-7890-abcd-ef1234567890/secrets.json
```

**This file is:**
- ✅ Outside your project directory
- ✅ Not in version control
- ✅ Encrypted by the OS
- ✅ Only accessible by your user account

---

## 🚨 Important Security Notes

### ✅ DO:
- Keep User Secrets on your development machine
- Use Environment Variables for production
- Rotate secrets regularly (every 3-6 months)
- Use different secrets for development and production

### ❌ DON'T:
- Commit appsettings.json with real secrets
- Share your User Secrets with others
- Use the same secrets in production
- Store secrets in plain text files

---

## 🔄 How to Change Secrets Again (Future)

Just repeat Step 3:

```bash
cd server

# Change database password
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Database=ComputerScienceCollege;Username=mohammedjalal;Password=NEW_PASSWORD"

# Change JWT key
dotnet user-secrets set "Jwt:Key" "NEW_JWT_KEY"

# Verify
dotnet user-secrets list
```

---

## 🆘 Troubleshooting

### Error: "JWT Key not configured"

**Cause:** User Secrets not set or not loaded

**Fix:**
```bash
cd server
dotnet user-secrets list
# If empty, repeat Step 3
```

### Error: "Connection failed"

**Cause:** Database password incorrect

**Fix:**
```bash
# Verify password in User Secrets
dotnet user-secrets list

# Test PostgreSQL connection manually
psql -U mohammedjalal -d ComputerScienceCollege
# If fails, password is wrong - repeat Step 1
```

### Error: "Cannot find secrets.json"

**Cause:** User Secrets not initialized

**Fix:**
```bash
cd server
dotnet user-secrets init
# Then repeat Step 3
```

---

## 📊 Summary

| Step | Action | Time | Status |
|------|--------|------|--------|
| 1 | Change database password | 1 min | ⏳ |
| 2 | Generate JWT secret | 30 sec | ⏳ |
| 3 | Store in User Secrets | 2 min | ⏳ |
| 4 | Update appsettings.json | 1 min | ⏳ |
| 5 | Test everything | 1 min | ⏳ |

**Total Time:** ~5 minutes

---

## ✅ Checklist

Before you commit to git:

- [ ] Changed database password in PostgreSQL
- [ ] Generated new JWT secret key
- [ ] Stored both in User Secrets (`dotnet user-secrets list` shows them)
- [ ] Updated appsettings.json with placeholders
- [ ] Tested `dotnet build` - succeeds
- [ ] Tested `dotnet run` - starts without errors
- [ ] Verified .gitignore includes `server/appsettings.json`
- [ ] Verified `git status` does NOT show appsettings.json

---

