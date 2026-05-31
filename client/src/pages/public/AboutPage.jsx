import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { aboutCollegeService } from '../../services/api/aboutCollegeService'
import { Info, Plus, Pencil, Trash2, X, Loader2, AlertCircle, ImageIcon } from 'lucide-react'

const AboutPage = () => {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { isAdmin } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ content: '', image: null })

  const apiBase = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const data = await aboutCollegeService.getAll()
      setPosts(Array.isArray(data) ? data : data ? [data] : [])
    } catch (err) { console.error('Error fetching about college:', err) } finally { setLoading(false) }
  }

  const resetForm = () => { setForm({ content: '', image: null }); setEditingPost(null); setShowForm(false); setError('') }

  const handleEdit = (post) => {
    setForm({ content: post.contentEn || '', image: null })
    setEditingPost(post); setShowForm(true); setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (!form.content.trim()) { setError(t('materials.allFieldsRequired')); return }
    try {
      setSubmitting(true)
      const data = new FormData()
      data.append('content', form.content.trim())
      if (form.image) data.append('image', form.image)
      if (editingPost) { await aboutCollegeService.update(editingPost.id, data) } else { await aboutCollegeService.create(data) }
      resetForm(); await fetchPosts()
    } catch (err) { setError(err.response?.data?.message || t('common.error')) } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.confirmDelete'))) return
    try { await aboutCollegeService.delete(id); await fetchPosts() } catch (err) { console.error('Error:', err) }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Info className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t('nav.about')}</h1>
        </div>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-5 h-5 mr-2" />{t('about.writeContent')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden relative group">
              {isAdmin && (
                <div className="absolute top-4 right-4 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(post)} className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(post.id)} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
              {post.imageUrl && (
                <div className="w-full max-h-96 overflow-hidden">
                  <img src={`${apiBase}${post.imageUrl}`} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-8">
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                  {language === 'ar' ? post.contentAr : post.contentEn}
                </p>
                <p className="text-xs text-gray-400 mt-4">{post.updatedByName}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <p className="text-gray-600 dark:text-gray-400 text-lg text-center leading-relaxed">
            {language === 'ar' ? 'معلومات عن الكلية ستظهر هنا.' : 'Information about the college will appear here.'}
          </p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingPost ? t('common.edit') : t('about.writeContent')}</h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('content.content')}</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <div className="flex items-center gap-1"><ImageIcon className="w-4 h-4" />{t('about.uploadImage')}</div>
                </label>
                <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-900 dark:file:text-primary-300" />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('about.imageOptional')}</p>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{t('common.cancel')}</button>
                <button type="submit" disabled={submitting} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('common.saving')}</> : (editingPost ? t('admin.update') : t('admin.create'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AboutPage
