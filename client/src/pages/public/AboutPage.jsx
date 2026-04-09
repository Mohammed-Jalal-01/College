import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../contexts/LanguageContext'
import { aboutCollegeService } from '../../services/api/aboutCollegeService'
import { Info } from 'lucide-react'

const AboutPage = () => {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const [aboutContent, setAboutContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAboutCollege = async () => {
      try {
        setLoading(true)
        const data = await aboutCollegeService.get()
        setAboutContent(data)
      } catch (error) {
        console.error('Error fetching about college:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAboutCollege()
  }, [])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center mb-8">
        <Info className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-3" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          {t('nav.about')}
        </h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : aboutContent ? (
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
              {language === 'ar' ? aboutContent.contentAr : aboutContent.contentEn}
            </p>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            {language === 'ar'
              ? 'معلومات عن الكلية ستظهر هنا. يمكن للمسؤول تحديث هذا المحتوى.'
              : 'Information about the college will appear here. Admins can update this content.'}
          </p>
        )}
      </div>
    </div>
  )
}

export default AboutPage
