# Frontend Architecture - Technical Implementation

## Overview

The College Management System frontend is built with React 19, using Vite as the build tool. The architecture follows a component-based design with Context API for state management, React Router for navigation, and Axios for API communication.

## Technical Stack

- Framework: React 19.x
- Build Tool: Vite 6.x
- Routing: React Router 7.x
- Styling: Tailwind CSS 3.x
- HTTP Client: Axios 1.x
- Internationalization: i18next 24.x
- Icons: Lucide React

## Project Structure

```
client/src/
├── components/           # Reusable UI components
│   ├── layout/          # Layout components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── MainLayout.jsx   # Public/shared layout (Header + Footer)
│   │   └── AdminLayout.jsx  # Admin shell with responsive sidebar
│   ├── auth/            # Authentication components
│   └── common/          # Shared components
│       ├── ProtectedRoute.jsx  # Auth + role + student-info route guard
│       └── ErrorBoundary.jsx   # Top-level error boundary
├── pages/               # Page components
│   ├── public/          # Public pages
│   │   ├── HomePage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── ActivitiesPage.jsx
│   │   ├── DepartmentsPage.jsx
│   │   ├── SchedulesPage.jsx
│   │   ├── MaterialsPage.jsx
│   │   └── GradesPage.jsx
│   ├── admin/           # Admin dashboard pages
│   │   ├── AdminDashboard.jsx
│   │   ├── NewsManagement.jsx
│   │   ├── ActivitiesManagement.jsx
│   │   ├── DepartmentsManagement.jsx
│   │   ├── SchedulesManagement.jsx
│   │   ├── MaterialsManagement.jsx
│   │   ├── AboutCollegeManagement.jsx
│   │   └── UserManagement.jsx
│   └── auth/            # Authentication pages
│       ├── LoginPage.jsx
│       ├── RegisterPage.jsx
│       ├── AccountTypeSelection.jsx
│       └── StudentInfoPage.jsx
├── contexts/            # React Context providers
│   ├── AuthContext.jsx
│   ├── LanguageContext.jsx
│   └── ThemeContext.jsx
├── services/            # API service layer
│   └── api/
│       ├── authService.js
│       ├── newsService.js
│       ├── updatesService.js
│       └── [feature]Service.js
├── utils/               # Utility functions
├── hooks/               # Custom React hooks
├── assets/              # Static assets
├── App.jsx              # Main application component
└── main.jsx             # Application entry point
```

## Context Providers

### AuthContext

**File Location:** `client/src/contexts/AuthContext.jsx`

**Purpose:** Manages authentication state and user session.

**Implementation:**

```javascript
// client/src/contexts/AuthContext.jsx:14-102
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    const initAuth = () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const { token: newToken, ...userData } = response;
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setToken(newToken);
    setUser(userData);
    
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'Admin' || user?.role === 'SuperAdmin';
  const isSuperAdmin = user?.role === 'SuperAdmin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isSuperAdmin,
        login,
        register,
        logout,
        deleteAccount,
        addStudentInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

**Provided Values:**
- `user`: Current user object
- `token`: JWT authentication token
- `loading`: Initial loading state
- `isAuthenticated`: Boolean authentication status
- `isAdmin`: Boolean admin/superadmin check
- `isSuperAdmin`: Boolean superadmin check
- `login()`: Login function
- `register()`: Registration function
- `logout()`: Logout function
- `deleteAccount()`: Account deletion function
- `addStudentInfo()`: Student info addition function

**Usage:**

```javascript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginPrompt />;
  }
  
  return <div>Welcome, {user.profileName}</div>;
};
```

### LanguageContext

**File Location:** `client/src/contexts/LanguageContext.jsx`

**Purpose:** Manages i18n state and RTL layout switching.

**Provided Values:**
- `language`: Current language ('en' or 'ar')
- `direction`: Text direction ('ltr' or 'rtl')
- `changeLanguage()`: Language switching function
- `t()`: Translation function from i18next

**Implementation:**

```javascript
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'ar';
  });

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, direction, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
```

### ThemeContext

**File Location:** `client/src/contexts/ThemeContext.jsx`

**Purpose:** Manages light/dark theme switching.

**Provided Values:**
- `theme`: Current theme ('light' or 'dark')
- `toggleTheme()`: Theme switching function

**Implementation:**

```javascript
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

## Routing Configuration

**File Location:** `client/src/App.jsx`

**Route Structure:**

```javascript
<BrowserRouter>
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<HomePage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/activities" element={<ActivitiesPage />} />
    <Route path="/departments" element={<DepartmentsPage />} />
    <Route path="/schedules" element={<SchedulesPage />} />
    <Route path="/materials" element={<MaterialsPage />} />
    <Route path="/grades" element={<ProtectedRoute><GradesPage /></ProtectedRoute>} />
    
    {/* Auth Routes */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/account-type" element={<AccountTypeSelection />} />
    <Route path="/student-info" element={<StudentInfoPage />} />
    
    {/* Protected Admin Routes */}
    <Route path="/admin" element={
      <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
        <AdminDashboard />
      </ProtectedRoute>
    } />
    
    <Route path="/admin/news" element={
      <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
        <NewsManagement />
      </ProtectedRoute>
    } />
    
    {/* SuperAdmin Only Routes */}
    <Route path="/admin/users" element={
      <ProtectedRoute allowedRoles={['SuperAdmin']}>
        <UserManagement />
      </ProtectedRoute>
    } />
  </Routes>
</BrowserRouter>
```

## Protected Route Implementation

**File Location:** `client/src/components/common/ProtectedRoute.jsx`

The guard enforces, in order: authentication, student-info completion, and role
requirements. Role checks use the `requireAdmin` and `requireSuperAdmin` flags
(an Admin or SuperAdmin satisfies `requireAdmin`; only a SuperAdmin satisfies
`requireSuperAdmin`).

```javascript
const ProtectedRoute = ({ children, requireAdmin = false, requireSuperAdmin = false }) => {
  const { isAuthenticated, isAdmin, isSuperAdmin, loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Students must complete their profile before accessing protected features.
  if (user?.userType === 'Student' && user?.requiresStudentInfo) {
    return <Navigate to="/auth/student-info" replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};
```

## Admin Layout and Navigation

**File Location:** `client/src/components/layout/AdminLayout.jsx`

All `/admin/*` routes render inside `AdminLayout`, which provides a consistent
shell so every management page is reachable from one place. Previously the
management pages had routes but no navigation links, making them reachable only
by typing the URL.

Features:
- Responsive sidebar: fixed on desktop, slide-in drawer with overlay on mobile.
- Role-based links: the User Management link is only shown to SuperAdmin.
- RTL aware: the sidebar anchors right and slides correctly in Arabic.
- Top bar with theme toggle, language toggle, current user, Back to Site, and logout.
- Dark mode support throughout.

The nested route structure wraps the layout once and applies role guards per child:

```javascript
<Route
  path="/admin"
  element={
    <ProtectedRoute requireAdmin>
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<AdminDashboard />} />
  <Route path="news" element={<NewsManagement />} />
  {/* ...other management pages... */}
  <Route
    path="users"
    element={
      <ProtectedRoute requireSuperAdmin>
        <UserManagement />
      </ProtectedRoute>
    }
  />
</Route>
```

## Error Handling

**File Location:** `client/src/components/common/ErrorBoundary.jsx`

A top-level `ErrorBoundary` wraps the application in `main.jsx`. Any uncaught
render error is caught and a localized fallback UI is shown (with Reload and Go
Home actions) instead of an unrecoverable blank screen. The error detail is only
rendered in development builds.

## Service Layer

### API Client Configuration

**File Location:** `client/src/services/api.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Service Pattern

**Example: authService.js**

```javascript
import api from './api';

export const authService = {
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  register: async (data) => {
    return await api.post('/auth/register', data);
  },

  addStudentInfo: async (studentInfo) => {
    return await api.post('/auth/student-info', studentInfo);
  },

  deleteAccount: async () => {
    return await api.delete('/auth/account');
  },
};
```

## State Management Pattern

**Local State:** useState for component-specific state
**Global State:** Context API for shared state
**Server State:** React Query pattern (fetch on mount, cache)

**Example Component:**

```javascript
const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
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

    fetchNews();
  }, []);

  const handleCreate = async (newsData) => {
    const created = await newsService.create(newsData);
    setNews([created, ...news]);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {isAdmin && <CreateNewsButton onClick={handleCreate} />}
      <NewsList items={news} />
    </div>
  );
};
```

## Component Composition

**Layout Pattern:**

```javascript
// App.jsx
<ThemeProvider>
  <LanguageProvider>
    <AuthProvider>
      <Router>
        <Layout>
          <Routes />
        </Layout>
      </Router>
    </AuthProvider>
  </LanguageProvider>
</ThemeProvider>
```

**Page Pattern:**

```javascript
const HomePage = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();

  return (
    <div className={`page ${theme}`}>
      <Header />
      <main>
        <h1>{t('home.title')}</h1>
        <NewsSection />
        <UpdatesSection />
      </main>
      <Footer />
    </div>
  );
};
```

## Styling Approach

**Tailwind CSS Utility Classes:**

```javascript
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
  {t('button.submit')}
</button>
```

**Dark Mode Support:**

```javascript
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content
</div>
```

**RTL Support:**

```javascript
<div className="text-left rtl:text-right">
  {content}
</div>
```

## Code References

**Frontend:**
- Main App: `client/src/App.jsx`
- Entry Point: `client/src/main.jsx`
- Auth Context: `client/src/contexts/AuthContext.jsx:14-102`
- Language Context: `client/src/contexts/LanguageContext.jsx`
- Theme Context: `client/src/contexts/ThemeContext.jsx`
- API Client: `client/src/services/api.js`
- Auth Service: `client/src/services/api/authService.js`

## Performance Considerations

- Lazy loading for routes (React.lazy)
- Memoization for expensive computations (useMemo)
- Callback memoization (useCallback)
- Virtual scrolling for large lists
- Image optimization and lazy loading
- Code splitting by route

## Testing Considerations

**Key Test Scenarios:**
1. Context providers initialization
2. Protected route access control
3. API service error handling
4. Token expiration handling
5. Language switching
6. Theme switching
7. Form validation
8. Responsive design

## Dashboard Charts

**File Location:** `client/src/pages/admin/AdminDashboard.jsx`

**Library:** recharts (installed as a dependency)

**Purpose:** Displays interactive pie and bar charts on the Admin Dashboard providing visual data analytics for administrators.

**Charts:**
- Pie Charts: User Roles Distribution, User Type Distribution, Students by Gender, Students by Study Type, Content Distribution
- Bar Charts: Students per Branch, Students per Stage, Materials per Branch, Schedules per Day, Monthly Registrations, Content Created per Month

**Features:**
- Responsive grid layout (2 columns on desktop, 1 on mobile)
- Dark mode support via custom tooltip component
- Bilingual labels (English/Arabic) using nameAr field from API
- Loading spinner while fetching data
- Graceful empty state when no data is available
- Authorization: accessible to Admin and SuperAdmin roles (AdminOnly policy)

**Data Source:** `GET /api/usermanagement/dashboard-stats` endpoint

---

## Home Page (Portal Landing)

**File Location:** `client/src/pages/public/HomePage.jsx`

**Purpose:** Acts as the main entry point for the college portal, guiding visitors and authenticated users to the most relevant sections.

**Layout Sections:**
- Hero: Gradient banner with the college name, tagline, and role-aware call-to-action buttons.
  - Guests: "Get Started" (registration) and "Explore Schedules".
  - Admin/SuperAdmin: "Go to Dashboard" and "Explore Schedules".
  - Authenticated non-admin: "Explore Schedules".
- Quick Access grid: Shortcut cards to Schedules, Course Materials, Grades, Activities, Departments, and About, each with an icon and short description.
- Latest News: Two-column responsive card grid with image (or placeholder), date, title, and excerpt. Admin-only inline add/edit/delete controls are preserved.

**Features:**
- Fully responsive (1/2/3 column grids depending on breakpoint)
- Dark mode support across all sections
- RTL-aware spacing and directional icons
- All localized via the `home.*` i18n keys (English/Arabic)
- Role authority preserved: content management actions remain gated behind the `isAdmin` flag

---

## Materials Page (Card Grid)

**File Location:** `client/src/pages/public/MaterialsPage.jsx`

**Layout:** Responsive card grid (1 col mobile, 2 col desktop). Each material is rendered as an individual card displaying title, file type badge, description excerpt, metadata (branch, stage, study type, course, uploader), and an action bar with download/edit/delete buttons.

**Role Authority:**
- Download: available to all users
- Add: Faculty and Admin/SuperAdmin (`isFacultyOrAdmin`)
- Edit/Delete per card: Faculty and Admin/SuperAdmin (`isFacultyOrAdmin`)

---

## Grades Page (Card Grid)

**File Location:** `client/src/pages/public/GradesPage.jsx`

**Layout:** Responsive card grid (1 col mobile, 2 col tablet, 3 col desktop). Each grade is rendered as an individual card showing subject name, file type badge, metadata (branch, stage, study type, file name, uploader), and an action bar.

**Role Authority:**
- Download: available to all users
- Add: Faculty and Admin/SuperAdmin (`isFacultyOrAdmin`)
- Edit/Delete per card: Admin/SuperAdmin always; Faculty only for their own uploads (`canModify`)

---

## Departments Page (Public)

**File Location:** `client/src/pages/public/DepartmentsPage.jsx`

**Layout:** Responsive card grid (1 col mobile, 2 col tablet, 3 col desktop). Each department card shows:
- Primary name in the current interface language (h3, bold)
- Alternate-language name as subtitle (smaller, gray)
- Description (if present, truncated to 2 lines)
- Category footer with icon

**Bilingual Name Display:**
- Arabic mode: shows `nameAr` as title, `nameEn` as subtitle
- English mode: shows `nameEn` as title, `nameAr` as subtitle
- This ensures both language names are always visible regardless of interface language

**Role Authority:**
- View: available to all users
- Add/Edit/Delete: Admin only (`isAdmin`) - edit/delete buttons visible on hover

---

## Admin Management Pages (Table and Card UI)

**Files:**
- `client/src/pages/admin/ActivitiesManagement.jsx`
- `client/src/pages/admin/NewsManagement.jsx`
- `client/src/pages/admin/MaterialsManagement.jsx`
- `client/src/pages/admin/SchedulesManagement.jsx`
- `client/src/pages/admin/DepartmentsManagement.jsx`

**Table Improvements (Activities, News, Materials, Schedules):**
- Container: `rounded-xl` with `border` and `shadow-sm` for clear boundaries in dark mode
- Header: `bg-gray-50 dark:bg-gray-900/50` with `font-semibold` for stronger visual hierarchy
- Header alignment: `text-start` (logical property) ensures correct alignment in both LTR and RTL
- Rows: `hover:bg-gray-50 dark:hover:bg-gray-700/40` for interactive feedback
- Body dividers: lighter `divide-gray-100 dark:divide-gray-700/50` to reduce visual noise
- First column uses `font-medium` to emphasize the primary data field
- Secondary columns use `text-gray-600 dark:text-gray-300` for clear hierarchy
- Time display (Schedules): trimmed from HH:MM:SS to HH:MM via `.slice(0, 5)`

**Action Buttons (all 5 pages):**
- Replaced bare icon links with `p-2 rounded-lg` buttons with hover backgrounds
- Edit: `hover:bg-primary-50 dark:hover:bg-primary-900/30`
- Delete: `hover:bg-red-50 dark:hover:bg-red-900/30`
- Download (Materials): `hover:bg-green-50 dark:hover:bg-green-900/30`

**Card Improvements (Departments):**
- Added `border border-gray-200 dark:border-gray-700` and `hover:shadow-md` transition
- Consistent action button styling with table pages

**Error Handling:**
- Replaced `alert()` calls in `handleSubmit` with inline `formError` state across all 5 pages
- Error display uses `AlertCircle` icon with red border styling, consistent with SchedulesManagement pattern
- ASP.NET validation errors are extracted from `response.data.errors` when `message` is absent

**RTL Alignment (all 5 pages):**
- "Add" buttons use `gap-2` instead of `mr-2` on icons for direction-agnostic spacing
- Icon margins in flex containers use `rtl:ml-2 rtl:mr-0` pattern where `gap` is not applicable

**Bug Fix (MaterialsManagement):**
- Replaced hardcoded `http://localhost:5000` download URL with `import.meta.env.VITE_API_BASE_URL`

---

## Future Enhancements

- Implement React Query for server state
- Add service workers for offline support
- Implement virtual scrolling
- Add skeleton loading states
- Implement optimistic UI updates
- Add error boundaries
- Implement analytics tracking
- Add performance monitoring
