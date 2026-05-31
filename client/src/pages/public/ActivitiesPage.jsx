import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { activitiesService } from '../../services/api/activitiesService'
import { Calendar, MapPin, Plus, Pencil, Trash2, X, Loader2, AlertCircle, ImageIcon } from 'lucide-react'

const ActivitiesPage = () => {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { isAdmin } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', content: '', date: '', image: null })

  const apiBase = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'

  useEffect(() => { fetchActivities() }, [])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const data = await activitiesService.getAll()
      setActivities(data.sort((a, b) => new Date(b.date) - new Date(a.date)))
    } catch (err) { console.error('Error fetching activities:', err) } finally { setLoading(false) }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const resetForm = () => { setForm({ title: '', content: '', date: '', image: null }); setEditingActivity(null); setShowForm(false); setError('') }

  const handleEdit = (activity) => {
    setForm({ title: activity.titleEn || '', content: activity.contentEn || '', date: activity.date?.split('T')[0] || '', image: null })
    setEditingActivity(activity); setShowForm(true); setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (!form.title.trim() || !form.content.trim()) { setError(t('materials.allFieldsRequired')); return }
    try {
      setSubmitting(true)
      const data = new FormData()
      data.append('title', form.title.trim())
      data.append('content', form.content.trim())
      if (form.date) data.append('date', form.date)
      if (form.image) data.append('image', form.image)
      if (editingActivity) { await activitiesService.update(editingActivity.id, data) } else { await activitiesService.create(data) }
      resetForm(); await fetchActivities()
    } catch (err) { setError(err.response?.data?.message || t('common.error')) } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.confirmDelete'))) return
    try { await activitiesService.delete(id); await fetchActivities() } catch (err) { console.error('Error:', err) }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Calendar className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t('nav.activities')}</h1>
        </div>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-5 h-5 mr-2" />{t('content.addActivity')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : activities.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow relative group">
              {isAdmin && (
                <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(activity)} className="p-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600"><Pencil className="w-3 h-3" /></button>
                  <button onClick={() => handleDelete(activity.id)} className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700"><Trash2 className="w-3 h-3" /></button>
                </div>
              )}
              {activity.imageUrl ? (
                <div className="w-full h-48 overflow-hidden">
                  <img src={`${apiBase}${activity.imageUrl}`} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4">
                  <div className="flex items-center text-white">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span className="font-semibold">{formatDate(activity.date)}</span>
                  </div>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{language === 'ar' ? activity.titleAr : activity.titleEn}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{language === 'ar' ? activity.contentAr : activity.contentEn}</p>
                <div className="flex items-center text-sm text-gray-500">
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
            {language === 'ar' ? 'لا توجد أنشطة حالياً. سيتم عرض الأنشطة هنا.' : 'No activities at the moment. Activities will be displayed here.'}
          </p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingActivity ? t('content.editActivity') : t('content.addActivity')}</h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('content.title')}</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('content.content')}</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('content.date')}</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"><div className="flex items-center gap-1"><ImageIcon className="w-4 h-4" />{t('about.uploadImage')}</div></label>
                <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-900 dark:file:text-primary-300" />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('about.imageOptional')}</p>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{t('common.cancel')}</button>
                <button type="submit" disabled={submitting} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('common.saving')}</> : (editingActivity ? t('admin.update') : t('admin.create'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivitiesPage
