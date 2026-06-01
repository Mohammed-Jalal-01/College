import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard,
  Newspaper,
  Activity,
  Building2,
  Info,
  CalendarDays,
  BookOpen,
  Users,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  LogOut,
  Home
} from 'lucide-react'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { language, toggleLanguage } = useLanguage()
  const { user, isSuperAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { to: '/admin', label: t('admin.nav.dashboard', 'Dashboard'), icon: LayoutDashboard, end: true },
    { to: '/admin/news', label: t('content.news', 'News'), icon: Newspaper },
    { to: '/admin/activities', label: t('nav.activities', 'Activities'), icon: Activity },
    { to: '/admin/departments', label: t('nav.departments', 'Departments'), icon: Building2 },
    { to: '/admin/about-college', label: t('content.aboutCollege', 'About College'), icon: Info },
    { to: '/admin/schedules', label: t('nav.schedules', 'Schedules'), icon: CalendarDays },
    { to: '/admin/materials', label: t('nav.materials', 'Materials'), icon: BookOpen },
  ]

  if (isSuperAdmin) {
    navItems.push({ to: '/admin/users', label: t('admin.userManagement', 'User Management'), icon: Users })
  }

  const closeSidebar = () => setSidebarOpen(false)

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-600 text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <Link to="/admin" onClick={closeSidebar} className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">CS</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white">
            {t('admin.dashboard', 'Dashboard')}
          </span>
        </Link>
        <button
          onClick={closeSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label={t('common.close', 'Close')}
        >
          <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={closeSidebar} className={navLinkClass}>
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          <span className="truncate">{t('admin.nav.backToSite', 'Back to Site')}</span>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-transform duration-300 lg:translate-x-0 ${
          language === 'ar'
            ? 'right-0 border-l ' + (sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0')
            : 'left-0 border-r ' + (sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
        }`}
      >
        {sidebar}
      </aside>

      <div className={language === 'ar' ? 'lg:pr-64' : 'lg:pl-64'}>
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={t('common.menu', 'Menu')}
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          <div className="flex items-center gap-2 ms-auto">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={t('common.toggleTheme', 'Toggle theme')}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
              aria-label={t('common.toggleLanguage', 'Toggle language')}
            >
              <Globe className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {language === 'ar' ? 'EN' : 'AR'}
              </span>
            </button>

            <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[10rem] truncate">
              {user?.profileName}
            </span>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              aria-label={t('nav.logout', 'Logout')}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
