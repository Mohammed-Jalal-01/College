import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../contexts/LanguageContext'
import { activitiesService } from '../../services/api/activitiesService'
import { Calendar, MapPin } from 'lucide-react'

const ActivitiesPage = () => {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const data = await activitiesService.getAll()
        setActivities(data.sort((a, b) => new Date(b.date) - new Date(a.date)))
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center mb-8">
        <Calendar className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-3" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          {t('nav.activities')}
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : activities.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4">
                <div className="flex items-center text-white">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span className="font-semibold">{formatDate(activity.date)}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {language === 'ar' ? activity.titleAr : activity.titleEn}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {language === 'ar' ? activity.descriptionAr : activity.descriptionEn}
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{t('content.createdAt')}: {formatDate(activity.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <p className="text-gray-600 dark:text-gray-400 text-lg text-center">
            {language === 'ar'
              ? 'لا توجد أنشطة حالياً. سيتم عرض الأنشطة هنا.'
              : 'No activities at the moment. Activities will be displayed here.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default ActivitiesPage
