import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { newsService } from '../../services/api/newsService'
import { Newspaper, Plus, Pencil, Trash2, X, Loader2, AlertCircle, ImageIcon } from 'lucide-react'

const HomePage = () => {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { isAdmin } = useAuth()
  const [allNews, setAllNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewsForm, setShowNewsForm] = useState(false)
  const [editingNews, setEditingNews] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [newsForm, setNewsForm] = useState({ title: '', content: '', image: null })

  const apiBase = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const newsData = await newsService.getFeatured()
      setAllNews(newsData)
    } catch (err) {
      console.error('Error fetching homepage data:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const resetNewsForm = () => { setNewsForm({ title: '', content: '', image: null }); setEditingNews(null); setShowNewsForm(false); setError('') }

  const handleEditNews = (news) => {
    setNewsForm({ title: news.titleEn || '', content: news.contentEn || '', image: null })
    setEditingNews(news); setShowNewsForm(true); setError('')
  }

  const handleSubmitNews = async (e) => {
    e.preventDefault(); setError('')
    if (!newsForm.title.trim() || !newsForm.content.trim()) { setError(t('materials.allFieldsRequired')); return }
    try {
      setSubmitting(true)
      const data = new FormData()
      data.append('title', newsForm.title.trim())
      data.append('content', newsForm.content.trim())
      data.append('isFeatured', 'true')
      if (newsForm.image) data.append('image', newsForm.image)
      if (editingNews) { await newsService.update(editingNews.id, data) } else { await newsService.create(data) }
      resetNewsForm(); await fetchData()
    } catch (err) { setError(err.response?.data?.message || t('common.error')) } finally { setSubmitting(false) }
  }

  const handleDeleteNews = async (id) => {
    if (!window.confirm(t('admin.confirmDelete'))) return
    try { await newsService.delete(id); await fetchData() } catch (err) { console.error('Error:', err) }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">{t('home.welcome')}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {language === 'ar' ? 'منصة إدارة شاملة لكلية علوم الحاسوب' : 'Comprehensive management platform for Computer Science College'}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Newspaper className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('home.featuredNews')}</h2>
          </div>
          {isAdmin && <button onClick={() => { resetNewsForm(); setShowNewsForm(true) }} className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"><Plus className="w-4 h-4" /></button>}
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
        ) : allNews.length > 0 ? (
          <div className="space-y-4">
            {allNews.map((news) => (
              <div key={news.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 group relative">
                {isAdmin && (
                  <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditNews(news)} className="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"><Pencil className="w-3 h-3" /></button>
                    <button onClick={() => handleDeleteNews(news.id)} className="p-1 bg-red-600 text-white rounded hover:bg-red-700"><Trash2 className="w-3 h-3" /></button>
                  </div>
                )}
                {news.imageUrl && (
                  <div className="w-full h-48 mb-3 rounded-lg overflow-hidden">
                    <img src={`${apiBase}${news.imageUrl}`} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{language === 'ar' ? news.titleAr : news.titleEn}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{language === 'ar' ? news.contentAr : news.contentEn}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(news.createdAt)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">{language === 'ar' ? 'لا توجد أخبار مميزة حالياً' : 'No featured news at the moment'}</p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/departments" className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">6</div>
          <p className="text-gray-700 dark:text-gray-300">{language === 'ar' ? 'الاقسام' : 'Departments'}</p>
        </Link>
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">4</div>
          <p className="text-gray-700 dark:text-gray-300">{language === 'ar' ? 'أنواع الدراسة' : 'Study Types'}</p>
        </div>
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">4</div>
          <p className="text-gray-700 dark:text-gray-300">{language === 'ar' ? 'المراحل' : 'Stages'}</p>
        </div>
      </div>

      {showNewsForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingNews ? t('content.editNews') : t('content.addNews')}</h2>
              <button onClick={resetNewsForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmitNews} className="p-6 space-y-4">
              {error && <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('content.title')}</label>
                <input type="text" value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('content.content')}</label>
                <textarea value={newsForm.content} onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })} rows={4} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"><div className="flex items-center gap-1"><ImageIcon className="w-4 h-4" />{t('about.uploadImage')}</div></label>
                <input type="file" accept="image/*" onChange={(e) => setNewsForm({ ...newsForm, image: e.target.files[0] })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-900 dark:file:text-primary-300" />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('about.imageOptional')}</p>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={resetNewsForm} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{t('common.cancel')}</button>
                <button type="submit" disabled={submitting} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('common.saving')}</> : (editingNews ? t('admin.update') : t('admin.create'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
