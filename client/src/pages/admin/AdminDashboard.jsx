import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { userManagementService } from '../../services/api/userManagementService'
import { 
  Users, 
  Shield,
  Loader2
} from 'lucide-react'

const AdminDashboard = () => {
  const { t } = useTranslation()
  const { user, isSuperAdmin } = useAuth()
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
        </div>

        {isSuperAdmin && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('admin.userManagement')}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('admin.userManagementDesc')}
            </p>
            <Link
              to="/admin/users"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Users className="w-5 h-5 mr-2" />
              {t('admin.userManagement')}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
