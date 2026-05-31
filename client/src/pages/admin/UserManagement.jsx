import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, GraduationCap, BookOpen, Shield, ShieldAlert, ArrowUpCircle, ArrowDownCircle, RefreshCw, X } from 'lucide-react';
import { userManagementService } from '../../services/api/userManagementService';
import { useAuth } from '../../contexts/AuthContext';

const UserManagement = () => {
  const { t, i18n } = useTranslation();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [facultyUsers, setFacultyUsers] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterUserType, setFilterUserType] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        userManagementService.getAllUsers(),
        userManagementService.getUserStats(),
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (userId) => {
    if (window.confirm(t('userManagement.confirmPromote'))) {
      try {
        await userManagementService.promoteToAdmin(userId);
        await fetchData();
        alert(t('userManagement.promoteSuccess'));
      } catch (error) {
        console.error('Error promoting user:', error);
        alert(error.response?.data?.message || t('common.error'));
      }
    }
  };

  const handleDemoteToRegular = async (userId) => {
    if (window.confirm(t('userManagement.confirmDemote'))) {
      try {
        await userManagementService.demoteToRegular(userId);
        await fetchData();
        alert(t('userManagement.demoteSuccess'));
      } catch (error) {
        console.error('Error demoting user:', error);
        alert(error.response?.data?.message || t('common.error'));
      }
    }
  };

  const handleOpenTransferModal = async () => {
    try {
      const faculty = await userManagementService.getFacultyUsers();
      setFacultyUsers(faculty.filter(f => f.id !== currentUser?.id));
      setShowTransferModal(true);
    } catch (error) {
      console.error('Error fetching faculty:', error);
      alert(error.response?.data?.message || t('common.error'));
    }
  };

  const handleTransferSuperAdmin = async () => {
    if (!selectedFacultyId) {
      alert(t('userManagement.selectFaculty'));
      return;
    }

    if (window.confirm(t('userManagement.confirmTransfer'))) {
      try {
        await userManagementService.transferSuperAdmin(selectedFacultyId);
        alert(t('userManagement.transferSuccess'));
        window.location.href = '/';
      } catch (error) {
        console.error('Error transferring super admin:', error);
        alert(error.response?.data?.message || t('common.error'));
      }
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      SuperAdmin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      Admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Regular: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return badges[role] || badges.Regular;
  };

  const getUserTypeBadge = (userType) => {
    const badges = {
      Student: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Faculty: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return badges[userType] || badges.Student;
  };

  const filteredUsers = users.filter(user => {
    const roleMatch = filterRole === 'All' || user.role === filterRole;
    const typeMatch = filterUserType === 'All' || user.userType === filterUserType;
    return roleMatch && typeMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.userManagement')}
        </h1>
        <button
          onClick={handleOpenTransferModal}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          {t('userManagement.transferSuperAdmin')}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: t('userManagement.totalUsers'), value: stats.totalUsers, icon: Users, bg: 'bg-primary-50 dark:bg-primary-900/30', color: 'text-primary-600 dark:text-primary-400' },
            { label: t('userManagement.totalStudents'), value: stats.totalStudents, icon: GraduationCap, bg: 'bg-green-50 dark:bg-green-900/30', color: 'text-green-600 dark:text-green-400' },
            { label: t('userManagement.totalFaculty'), value: stats.totalFaculty, icon: BookOpen, bg: 'bg-purple-50 dark:bg-purple-900/30', color: 'text-purple-600 dark:text-purple-400' },
            { label: t('userManagement.totalAdmins'), value: stats.totalAdmins, icon: Shield, bg: 'bg-amber-50 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
            { label: t('userManagement.totalSuperAdmins'), value: stats.totalSuperAdmins, icon: ShieldAlert, bg: 'bg-red-50 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' },
          ].map((card, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{card.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{card.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t('userManagement.filterByRole')}
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="All">{t('filters.all')}</option>
              <option value="SuperAdmin">{t('roles.superAdmin')}</option>
              <option value="Admin">{t('roles.admin')}</option>
              <option value="Regular">{t('roles.regular')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t('userManagement.filterByType')}
            </label>
            <select
              value={filterUserType}
              onChange={(e) => setFilterUserType(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="All">{t('filters.all')}</option>
              <option value="Student">{t('common.student')}</option>
              <option value="Faculty">{t('common.faculty')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50">
                <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('userManagement.displayId')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('userManagement.name')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('userManagement.email')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('userManagement.type')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('userManagement.role')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('userManagement.info')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                    {user.displayId}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {user.profileName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUserTypeBadge(user.userType)}`}>
                      {user.userType}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {user.studentInfo && (
                      <div className="space-y-0.5">
                        <div>{i18n.language === 'ar' ? user.studentInfo.branchNameAr : user.studentInfo.branchNameEn}</div>
                        <div>{i18n.language === 'ar' ? user.studentInfo.stageNameAr : user.studentInfo.stageNameEn}</div>
                      </div>
                    )}
                    {user.facultyInfo && user.facultyInfo.department && (
                      <div>{user.facultyInfo.department}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {user.userType === 'Faculty' && user.role === 'Regular' && (
                        <button
                          onClick={() => handlePromoteToAdmin(user.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title={t('userManagement.promoteToAdmin')}
                        >
                          <ArrowUpCircle className="w-4 h-4" />
                        </button>
                      )}
                      {user.role === 'Admin' && (
                        <button
                          onClick={() => handleDemoteToRegular(user.id)}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                          title={t('userManagement.demoteToRegular')}
                        >
                          <ArrowDownCircle className="w-4 h-4" />
                        </button>
                      )}
                      {user.role === 'SuperAdmin' && (
                        <span className="text-xs text-gray-400">{t('userManagement.superAdminRole')}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('userManagement.transferSuperAdmin')}
              </h2>
              <button onClick={() => setShowTransferModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('userManagement.transferWarning')}
              </p>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('userManagement.selectNewSuperAdmin')}
              </label>
              <select
                value={selectedFacultyId}
                onChange={(e) => setSelectedFacultyId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
              >
                <option value="">{t('userManagement.selectFaculty')}</option>
                {facultyUsers.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.profileName} ({faculty.displayId}) - {faculty.role}
                  </option>
                ))}
              </select>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleTransferSuperAdmin}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {t('userManagement.transfer')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
