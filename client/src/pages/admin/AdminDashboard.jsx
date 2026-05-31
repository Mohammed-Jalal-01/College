import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { userManagementService } from '../../services/api/userManagementService'
import { 
  Users, 
  GraduationCap,
  BookOpen,
  Shield,
  ShieldAlert,
  Loader2
} from 'lucide-react'

const StatCard = ({ icon: value, label, loading, bgColor, iconColor }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : value}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{label}</p>
      </div>
    </div>
  </div>
)

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
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {t('admin.dashboard')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t('nav.profile')}: {user?.profileName}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          <StatCard
            icon={Users}
            value={stats?.totalUsers ?? 0}
            label={t('admin.totalUsers')}
            loading={statsLoading}
            bgColor="bg-primary-50 dark:bg-primary-900/30"
            iconColor="text-primary-600 dark:text-primary-400"
          />
          <StatCard
            icon={GraduationCap}
            value={stats?.totalStudents ?? 0}
            label={t('admin.totalStudents')}
            loading={statsLoading}
            bgColor="bg-green-50 dark:bg-green-900/30"
            iconColor="text-green-600 dark:text-green-400"
          />
          <StatCard
            icon={BookOpen}
            value={stats?.totalFaculty ?? 0}
            label={t('admin.totalFaculty')}
            loading={statsLoading}
            bgColor="bg-blue-50 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            icon={Shield}
            value={stats?.totalAdmins ?? 0}
            label={t('admin.totalAdmins')}
            loading={statsLoading}
            bgColor="bg-amber-50 dark:bg-amber-900/30"
            iconColor="text-amber-600 dark:text-amber-400"
          />
          <StatCard
            icon={ShieldAlert}
            value={stats?.totalSuperAdmins ?? 0}
            label={t('admin.totalDean')}
            loading={statsLoading}
            bgColor="bg-red-50 dark:bg-red-900/30"
            iconColor="text-red-600 dark:text-red-400"
          />
        </div>

        {isSuperAdmin && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-2" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('admin.userManagement')}
              </h2>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              {t('admin.userManagementDesc')}
            </p>
            <Link
              to="/admin/users"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
            >
              <Users className="w-4 h-4 mr-2" />
              {t('admin.userManagement')}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
