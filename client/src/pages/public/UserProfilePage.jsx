import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, ArrowLeft, GraduationCap, Users } from 'lucide-react';
import { userService } from '../../services/api/userService';

const UserProfilePage = () => {
  const { displayId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.getProfile(displayId);
        setUser(data);
      } catch (err) {
        setError(err.response?.data?.message || t('search.userNotFound'));
      } finally {
        setLoading(false);
      }
    };

    if (displayId) {
      fetchUserProfile();
    }
  }, [displayId, t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('search.userNotFound')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.backToHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-12">
            <div className="flex items-center">
              <div className="w-24 h-24 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-6 text-white">
                <h1 className="text-3xl font-bold">{user.profileName}</h1>
                <p className="text-primary-100 mt-1 text-lg">{t(`common.${user.userType.toLowerCase()}`)}</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Users className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t('search.accountId')}
                  </h3>
                </div>
                <p className="text-2xl font-mono font-bold text-primary-600 dark:text-primary-400">
                  {user.displayId}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <User className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t('search.accountType')}
                  </h3>
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {t(`common.${user.userType.toLowerCase()}`)}
                </p>
              </div>
            </div>

            {user.studentInfo && (
              <div className="mt-6">
                <div className="flex items-center mb-4">
                  <GraduationCap className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('search.studentInformation')}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {t('studentInfo.gender')}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t(`studentInfo.${user.studentInfo.gender.toLowerCase()}`)}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {t('studentInfo.branch')}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {i18n.language === 'ar' ? user.studentInfo.branchName : user.studentInfo.branchName}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {t('studentInfo.studyType')}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {i18n.language === 'ar' ? user.studentInfo.studyTypeName : user.studentInfo.studyTypeName}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {t('studentInfo.stage')}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {i18n.language === 'ar' ? user.studentInfo.stageName : user.studentInfo.stageName}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
