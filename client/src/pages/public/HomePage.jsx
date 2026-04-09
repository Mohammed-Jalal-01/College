import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../contexts/LanguageContext'
import { newsService } from '../../services/api/newsService'
import { updatesService } from '../../services/api/updatesService'
import { Newspaper, Bell } from 'lucide-react'

const HomePage = () => {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const [featuredNews, setFeaturedNews] = useState([])
  const [latestUpdates, setLatestUpdates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [newsData, updatesData] = await Promise.all([
          newsService.getFeatured(),
          updatesService.getAll()
        ])
        setFeaturedNews(newsData.slice(0, 3))
        setLatestUpdates(updatesData.slice(0, 3))
      } catch (error) {
        console.error('Error fetching homepage data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {t('home.welcome')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {language === 'ar' 
            ? 'منصة إدارة شاملة لكلية علوم الحاسوب'
            : 'Comprehensive management platform for Computer Science College'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Newspaper className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('home.featuredNews')}
            </h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : featuredNews.length > 0 ? (
            <div className="space-y-4">
              {featuredNews.map((news) => (
                <div key={news.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {language === 'ar' ? news.titleAr : news.titleEn}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {language === 'ar' ? news.contentAr : news.contentEn}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {formatDate(news.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'ar'
                ? 'لا توجد أخبار مميزة حالياً'
                : 'No featured news at the moment'}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Bell className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('home.latestUpdates')}
            </h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : latestUpdates.length > 0 ? (
            <div className="space-y-4">
              {latestUpdates.map((update) => (
                <div key={update.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {language === 'ar' ? update.titleAr : update.titleEn}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {language === 'ar' ? update.contentAr : update.contentEn}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {formatDate(update.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'ar'
                ? 'لا توجد تحديثات حالياً'
                : 'No updates at the moment'}
            </p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">6</div>
          <p className="text-gray-700 dark:text-gray-300">
            {language === 'ar' ? 'التخصصات' : 'Branches'}
          </p>
        </div>
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">4</div>
          <p className="text-gray-700 dark:text-gray-300">
            {language === 'ar' ? 'أنواع الدراسة' : 'Study Types'}
          </p>
        </div>
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">4</div>
          <p className="text-gray-700 dark:text-gray-300">
            {language === 'ar' ? 'المراحل' : 'Stages'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default HomePage
