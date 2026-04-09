import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Shield, ShieldAlert, ArrowUpCircle, ArrowDownCircle, RefreshCw, X } from 'lucide-react';
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('userManagement.totalUsers')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-primary-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('userManagement.totalStudents')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('userManagement.totalFaculty')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalFaculty}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('userManagement.totalAdmins')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAdmins}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('userManagement.totalSuperAdmins')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSuperAdmins}</p>
              </div>
              <ShieldAlert className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('userManagement.filterByRole')}
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="All">{t('filters.all')}</option>
              <option value="SuperAdmin">{t('roles.superAdmin')}</option>
              <option value="Admin">{t('roles.admin')}</option>
              <option value="Regular">{t('roles.regular')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('userManagement.filterByType')}
            </label>
            <select
              value={filterUserType}
              onChange={(e) => setFilterUserType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="All">{t('filters.all')}</option>
              <option value="Student">{t('common.student')}</option>
              <option value="Faculty">{t('common.faculty')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('userManagement.displayId')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('userManagement.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('userManagement.email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('userManagement.type')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('userManagement.role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('userManagement.info')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                    {user.displayId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.profileName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getUserTypeBadge(user.userType)}`}>
                      {user.userType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.studentInfo && (
                      <div className="text-xs">
                        <div>{i18n.language === 'ar' ? user.studentInfo.branchNameAr : user.studentInfo.branchNameEn}</div>
                        <div>{i18n.language === 'ar' ? user.studentInfo.stageNameAr : user.studentInfo.stageNameEn}</div>
                      </div>
                    )}
                    {user.facultyInfo && user.facultyInfo.department && (
                      <div className="text-xs">{user.facultyInfo.department}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.userType === 'Faculty' && user.role === 'Regular' && (
                      <button
                        onClick={() => handlePromoteToAdmin(user.id)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-2"
                        title={t('userManagement.promoteToAdmin')}
                      >
                        <ArrowUpCircle className="w-5 h-5" />
                      </button>
                    )}
                    {user.role === 'Admin' && (
                      <button
                        onClick={() => handleDemoteToRegular(user.id)}
                        className="text-orange-600 hover:text-orange-900 dark:text-orange-400"
                        title={t('userManagement.demoteToRegular')}
                      >
                        <ArrowDownCircle className="w-5 h-5" />
                      </button>
                    )}
                    {user.role === 'SuperAdmin' && (
                      <span className="text-gray-400 text-xs">{t('userManagement.superAdminRole')}</span>
                    )}
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
