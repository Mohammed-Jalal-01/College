import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { referenceDataService } from '../../services/api/referenceDataService'
import { Loader2 } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

const StudentInfoPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { addStudentInfo, user } = useAuth()
  const { language } = useLanguage()

  const [formData, setFormData] = useState({
    gender: '',
    branchId: '',
    studyTypeId: '',
    stageId: '',
  })

  const [branches, setBranches] = useState([])
  const [studyTypes, setStudyTypes] = useState([])
  const [stages, setStages] = useState([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesData, studyTypesData, stagesData] = await Promise.all([
          referenceDataService.getBranches(),
          referenceDataService.getStudyTypesForRegistration(),
          referenceDataService.getStages(),
        ])

        setBranches(branchesData)
        setStudyTypes(studyTypesData)
        setStages(stagesData)
      } catch (error) {
        setApiError(t('error.loadingData', 'Failed to load data. Please refresh the page.'))
      } finally {
        setDataLoading(false)
      }
    }

    if (user?.userType !== 'Student') {
      navigate('/')
      return
    }

    fetchData()
  }, [user, navigate, t])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.gender) {
      newErrors.gender = t('validation.required', 'This field is required')
    }

    if (!formData.branchId) {
      newErrors.branchId = t('validation.required', 'This field is required')
    }

    if (!formData.studyTypeId) {
      newErrors.studyTypeId = t('validation.required', 'This field is required')
    }

    if (!formData.stageId) {
      newErrors.stageId = t('validation.required', 'This field is required')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await addStudentInfo(formData)
      navigate('/')
    } catch (error) {
      setApiError(error.response?.data?.message || t('error.savingInfo', 'Failed to save information. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('auth.studentInfo')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('auth.completeProfile', 'Please complete your profile information')}
            </p>
          </div>

          {apiError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.gender')}
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.gender
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:outline-none transition-colors`}
              >
                <option value="">{t('common.select', 'Select...')}</option>
                <option value="Male">{t('auth.male')}</option>
                <option value="Female">{t('auth.female')}</option>
              </select>
              {errors.gender && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gender}</p>}
            </div>

            <div>
              <label htmlFor="branchId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.branch')}
              </label>
              <select
                id="branchId"
                name="branchId"
                value={formData.branchId}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.branchId
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:outline-none transition-colors`}
              >
                <option value="">{t('common.select', 'Select...')}</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {language === 'ar' ? branch.nameAr : branch.nameEn}
                  </option>
                ))}
              </select>
              {errors.branchId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.branchId}</p>}
            </div>

            <div>
              <label htmlFor="studyTypeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.studyType')}
              </label>
              <select
                id="studyTypeId"
                name="studyTypeId"
                value={formData.studyTypeId}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.studyTypeId
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:outline-none transition-colors`}
              >
                <option value="">{t('common.select', 'Select...')}</option>
                {studyTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {language === 'ar' ? type.nameAr : type.nameEn}
                  </option>
                ))}
              </select>
              {errors.studyTypeId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.studyTypeId}</p>}
            </div>

            <div>
              <label htmlFor="stageId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.stage')}
              </label>
              <select
                id="stageId"
                name="stageId"
                value={formData.stageId}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.stageId
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:outline-none transition-colors`}
              >
                <option value="">{t('common.select', 'Select...')}</option>
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {language === 'ar' ? stage.nameAr : stage.nameEn}
                  </option>
                ))}
              </select>
              {errors.stageId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.stageId}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('common.loading')}</span>
                </>
              ) : (
                <span>{t('auth.continue')}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default StudentInfoPage
