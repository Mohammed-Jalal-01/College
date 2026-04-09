import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../contexts/LanguageContext'

const Footer = () => {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>
            {language === 'ar'
              ? `© ${currentYear} كلية علوم الحاسوب. جميع الحقوق محفوظة.`
              : `© ${currentYear} Computer Science College. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
