import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldAlert } from 'lucide-react'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {t('auth.registrationClosed')}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {t('auth.registrationClosedMessage')}
          </p>

          <button
            onClick={() => navigate('/auth/login')}
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            {t('auth.goToLogin')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
