import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { newsService } from '../../services/api/newsService'
import { Newspaper, Plus, Pencil, Trash2, X, Loader2, AlertCircle, ImageIcon, Calendar, BookOpen, GraduationCap, Activity, Building2, Info, ArrowRight, LayoutDashboard } from 'lucide-react'

const HomePage = () => {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { isAdmin, isAuthenticated } = useAuth()
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

  const quickLinks = [
    { to: '/schedules', icon: Calendar, label: t('nav.schedules'), desc: t('home.features.schedulesDesc') },
    { to: '/materials', icon: BookOpen, label: t('nav.materials'), desc: t('home.features.materialsDesc') },
    { to: '/grades', icon: GraduationCap, label: t('nav.grades'), desc: t('home.features.gradesDesc') },
    { to: '/activities', icon: Activity, label: t('nav.activities'), desc: t('home.features.activitiesDesc') },
    { to: '/departments', icon: Building2, label: t('nav.departments'), desc: t('home.features.departmentsDesc') },
    { to: '/about', icon: Info, label: t('nav.about'), desc: t('home.features.aboutDesc') },
  ]

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-12 md:px-12 md:py-16 mb-12 shadow-xl">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute -top-12 -right-12 rtl:-left-12 rtl:right-auto w-64 h-64 rounded-full bg-white"></div>
          <div className="absolute -bottom-16 -left-8 rtl:-right-8 rtl:left-auto w-72 h-72 rounded-full bg-white"></div>
        </div>
        <div className="relative max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">{t('home.welcome')}</h1>
          <p className="text-lg md:text-xl text-primary-100 mb-8">{t('home.tagline')}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            {isAdmin ? (
              <Link to="/admin" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-colors">
                <LayoutDashboard className="w-5 h-5" />{t('home.goToDashboard')}
              </Link>
            ) : !isAuthenticated ? (
              <Link to="/auth/account-type" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-colors">
                {t('home.getStarted')}<ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </Link>
            ) : null}
            <Link to="/schedules" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500/30 text-white font-semibold rounded-lg border border-white/40 hover:bg-primary-500/50 transition-colors">
              <Calendar className="w-5 h-5" />{t('home.explore')}
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('home.quickAccess')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('home.quickAccessSubtitle')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map(({ to, icon: Icon, label, desc }) => (
            <Link key={to} to={to} className="group flex items-start gap-4 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-700 transition-all hover:-translate-y-0.5">
              <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{label}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Newspaper className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-2 rtl:ml-2 rtl:mr-0" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('home.latestNews')}</h2>
          </div>
          {isAdmin && <button onClick={() => { resetNewsForm(); setShowNewsForm(true) }} className="inline-flex items-center gap-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"><Plus className="w-4 h-4" />{t('content.addNews')}</button>}
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
        ) : allNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allNews.map((news) => (
              <article key={news.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden group relative transition-shadow">
                {isAdmin && (
                  <div className="absolute top-2 right-2 rtl:left-2 rtl:right-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={() => handleEditNews(news)} className="p-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600"><Pencil className="w-3 h-3" /></button>
                    <button onClick={() => handleDeleteNews(news.id)} className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700"><Trash2 className="w-3 h-3" /></button>
                  </div>
                )}
                {news.imageUrl ? (
                  <div className="w-full h-48 overflow-hidden">
                    <img src={`${apiBase}${news.imageUrl}`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-primary-50 dark:bg-primary-900/20">
                    <Newspaper className="w-12 h-12 text-primary-300 dark:text-primary-700" />
                  </div>
                )}
                <div className="p-5">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{formatDate(news.createdAt)}</p>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{language === 'ar' ? news.titleAr : news.titleEn}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{language === 'ar' ? news.contentAr : news.contentEn}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 text-center">
            <Newspaper className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">{t('home.noNews')}</p>
          </div>
        )}
      </section>

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
