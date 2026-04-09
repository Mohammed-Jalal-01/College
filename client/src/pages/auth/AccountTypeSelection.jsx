import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GraduationCap, Users } from 'lucide-react'

const AccountTypeSelection = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSelection = (type) => {
    navigate('/auth/register', { state: { userType: type } })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('auth.chooseAccountType')}
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <button
            onClick={() => handleSelection('Student')}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-2 border-transparent hover:border-primary-500"
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="w-12 h-12 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('auth.student')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('auth.studentDescription', 'Register as a student to access course materials and schedules')}
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleSelection('Faculty')}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-2 border-transparent hover:border-primary-500"
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-12 h-12 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('auth.faculty')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('auth.facultyDescription', 'Register as faculty member to access teaching resources')}
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-400">
            {t('auth.alreadyHaveAccount')}{' '}
            <button
              onClick={() => navigate('/auth/login')}
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              {t('auth.loginHere')}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AccountTypeSelection
