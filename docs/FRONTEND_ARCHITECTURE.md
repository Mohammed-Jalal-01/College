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
│   │   └── Footer.jsx
│   ├── auth/            # Authentication components
│   └── common/          # Shared components
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

```javascript
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
```

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

## Future Enhancements

- Implement React Query for server state
- Add service workers for offline support
- Implement virtual scrolling
- Add skeleton loading states
- Implement optimistic UI updates
- Add error boundaries
- Implement analytics tracking
- Add performance monitoring
