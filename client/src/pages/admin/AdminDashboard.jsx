import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { userManagementService } from '../../services/api/userManagementService'
import { 
  Users, 
  FileText, 
  Activity, 
  Newspaper, 
  Bell, 
  Calendar as CalendarIcon, 
  BookOpen, 
  Building2, 
  Info,
  Loader2
} from 'lucide-react'

const AdminDashboard = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await userManagementService.getUserStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const contentManagementLinks = [
    { to: '/admin/news', icon: Newspaper, label: t('content.news'), color: 'blue' },
    { to: '/admin/updates', icon: Bell, label: t('content.updates'), color: 'green' },
    { to: '/admin/activities', icon: Activity, label: t('content.activities'), color: 'purple' },
    { to: '/admin/departments', icon: Building2, label: t('content.departments'), color: 'orange' },
    { to: '/admin/about-college', icon: Info, label: t('content.aboutCollege'), color: 'indigo' },
    { to: '/admin/schedules', icon: CalendarIcon, label: t('admin.schedules'), color: 'pink' },
    { to: '/admin/materials', icon: BookOpen, label: t('admin.materials'), color: 'teal' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t('admin.dashboard')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('nav.profile')}: {user?.profileName}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats?.totalUsers ?? 0}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{t('admin.totalUsers')}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats?.totalStudents ?? 0}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{t('admin.totalStudents')}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats?.totalFaculty ?? 0}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{t('admin.totalFaculty')}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{contentManagementLinks.length}</h3>
            <p className="text-gray-600 dark:text-gray-400">{t('admin.contentManagement')}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('admin.contentManagement')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {contentManagementLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center p-4 bg-${link.color}-50 dark:bg-${link.color}-900/20 rounded-lg hover:shadow-md transition-all border-2 border-transparent hover:border-${link.color}-500`}
                >
                  <div className={`w-10 h-10 bg-${link.color}-100 dark:bg-${link.color}-900 rounded-lg flex items-center justify-center mr-3`}>
                    <Icon className={`w-5 h-5 text-${link.color}-600 dark:text-${link.color}-400`} />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {link.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('admin.userManagement')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Manage user roles, promote faculty to admin, and transfer super admin privileges.
          </p>
          <Link
            to="/admin/users"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Users className="w-5 h-5 mr-2" />
            {t('admin.userManagement')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
