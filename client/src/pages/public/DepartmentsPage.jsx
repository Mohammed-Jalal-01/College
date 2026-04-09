import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../contexts/LanguageContext'
import { departmentsService } from '../../services/api/departmentsService'
import { Building2, Users } from 'lucide-react'

const DepartmentsPage = () => {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true)
        const data = await departmentsService.getAll()
        setDepartments(data)
      } catch (error) {
        console.error('Error fetching departments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center mb-8">
        <Building2 className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-3" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          {t('nav.departments')}
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : departments.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6">
                <div className="flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                  {language === 'ar' ? dept.nameAr : dept.nameEn}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                  {language === 'ar' ? dept.descriptionAr : dept.descriptionEn}
                </p>
                <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{t('content.departments')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <p className="text-gray-600 dark:text-gray-400 text-lg text-center">
            {language === 'ar'
              ? 'معلومات الأقسام والوحدات ستظهر هنا.'
              : 'Department and unit information will be displayed here.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default DepartmentsPage
