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
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
const BAR_COLOR = '#6366f1'

const StatCard = ({ icon: Icon, value, label, loading, bgColor, iconColor }) => (
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

const ChartCard = ({ title, children, noData }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
    {noData ? (
      <div className="flex items-center justify-center h-56 text-gray-400 dark:text-gray-500 text-sm">
        {noData}
      </div>
    ) : (
      children
    )}
  </div>
)

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm text-gray-900 dark:text-white font-medium">{payload[0].name}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">{payload[0].value}</p>
      </div>
    )
  }
  return null
}

const renderPieLabel = ({ percent, cx, x, y }) => {
  if (percent < 0.05) return null
  const label = `${(percent * 100).toFixed(0)}%`
  const textAnchor = x > cx ? 'start' : 'end'
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      dominantBaseline="central"
      fill="#9ca3af"
      fontSize={11}
    >
      {label}
    </text>
  )
}

const AdminDashboard = () => {
  const { t, i18n } = useTranslation()
  const { user, isSuperAdmin } = useAuth()
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [chartData, setChartData] = useState(null)
  const [chartLoading, setChartLoading] = useState(true)

  const isArabic = i18n.language === 'ar'

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

    const fetchChartData = async () => {
      try {
        const data = await userManagementService.getDashboardStats()
        setChartData(data)
      } catch (error) {
        console.error('Failed to fetch chart data:', error)
      } finally {
        setChartLoading(false)
      }
    }

    fetchStats()
    fetchChartData()
  }, [])

  const getLocalizedData = (items, filterZero = false) => {
    if (!items) return []
    let result = items.map(item => ({
      ...item,
      name: isArabic && item.nameAr ? item.nameAr : item.name
    }))
    if (filterZero) {
      result = result.filter(item => item.value > 0)
    }
    return result
  }

  const renderPieChart = (data, title) => {
    const localized = getLocalizedData(data, true)
    return (
      <ChartCard
        title={title}
        noData={!localized.length ? t('admin.charts.noData') : null}
      >
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={localized}
              cx="50%"
              cy="45%"
              outerRadius={75}
              innerRadius={30}
              dataKey="value"
              label={renderPieLabel}
              labelLine={true}
              paddingAngle={2}
            >
              {localized.map((_, index) => (
                <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={40}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs text-gray-600 dark:text-gray-300">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    )
  }

  const renderBarChart = (data, title) => {
    const localized = getLocalizedData(data)
    return (
      <ChartCard
        title={title}
        noData={!localized.length ? t('admin.charts.noData') : null}
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={localized} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={{ stroke: '#4b5563' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={{ stroke: '#4b5563' }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    )
  }

  return (
    <div>
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

        {chartLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : chartData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {renderPieChart(chartData.roleDistribution, t('admin.charts.roleDistribution'))}
            {renderPieChart(chartData.userTypeDistribution, t('admin.charts.userTypeDistribution'))}
            {renderPieChart(chartData.studentsByGender, t('admin.charts.studentsByGender'))}
            {renderPieChart(chartData.studentsByStudyType, t('admin.charts.studentsByStudyType'))}
            {renderPieChart(chartData.contentDistribution, t('admin.charts.contentDistribution'))}
            {renderBarChart(chartData.studentsPerBranch, t('admin.charts.studentsPerBranch'))}
            {renderBarChart(chartData.studentsPerStage, t('admin.charts.studentsPerStage'))}
            {renderBarChart(chartData.materialsPerBranch, t('admin.charts.materialsPerBranch'))}
            {renderBarChart(chartData.schedulesPerDay, t('admin.charts.schedulesPerDay'))}
            {renderBarChart(chartData.monthlyRegistrations, t('admin.charts.monthlyRegistrations'))}
            {renderBarChart(chartData.contentPerMonth, t('admin.charts.contentPerMonth'))}
          </div>
        ) : null}

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
  )
}

export default AdminDashboard
