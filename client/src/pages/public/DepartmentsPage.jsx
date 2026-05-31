import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { departmentsService } from '../../services/api/departmentsService'
import { Building2, Users, Plus, Pencil, Trash2, X, Loader2, AlertCircle } from 'lucide-react'

const DepartmentsPage = () => {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { isAdmin } = useAuth()
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDept, setEditingDept] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '' })

  useEffect(() => { fetchDepartments() }, [])

  const fetchDepartments = async () => {
    try { setLoading(true); const data = await departmentsService.getAll(); setDepartments(data) }
    catch (err) { console.error('Error fetching departments:', err) } finally { setLoading(false) }
  }

  const resetForm = () => { setForm({ nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '' }); setEditingDept(null); setShowForm(false); setError('') }

  const handleEdit = (dept) => {
    setForm({ nameEn: dept.nameEn, nameAr: dept.nameAr, descriptionEn: dept.descriptionEn || '', descriptionAr: dept.descriptionAr || '' })
    setEditingDept(dept); setShowForm(true); setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (!form.nameEn.trim() || !form.nameAr.trim()) { setError(t('materials.allFieldsRequired')); return }
    try {
      setSubmitting(true)
      if (editingDept) { await departmentsService.update(editingDept.id, form) } else { await departmentsService.create(form) }
      resetForm(); await fetchDepartments()
    } catch (err) { setError(err.response?.data?.message || t('common.error')) } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.confirmDelete'))) return
    try { await departmentsService.delete(id); await fetchDepartments() } catch (err) { console.error('Error:', err) }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Building2 className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t('nav.departments')}</h1>
        </div>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-5 h-5 mr-2" />{t('content.addDepartment')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : departments.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow relative group">
              {isAdmin && (
                <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(dept)} className="p-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600"><Pencil className="w-3 h-3" /></button>
                  <button onClick={() => handleDelete(dept.id)} className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700"><Trash2 className="w-3 h-3" /></button>
                </div>
              )}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6">
                <div className="flex items-center justify-center"><Building2 className="w-12 h-12 text-white" /></div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">{language === 'ar' ? dept.nameAr : dept.nameEn}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-4">{language === 'ar' ? dept.descriptionAr : dept.descriptionEn}</p>
                <div className="flex items-center justify-center text-sm text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Users className="w-4 h-4 mr-1" /><span>{t('content.departments')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <p className="text-gray-600 dark:text-gray-400 text-lg text-center">
            {language === 'ar' ? 'معلومات الأقسام والوحدات ستظهر هنا.' : 'Department and unit information will be displayed here.'}
          </p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingDept ? t('content.editDepartment') : t('content.addDepartment')}</h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('content.nameEn')}</label>
                <input type="text" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('content.nameAr')}</label>
                <input type="text" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} dir="rtl" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('content.descriptionEn')}</label>
                <textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('content.descriptionAr')}</label>
                <textarea value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} rows={3} dir="rtl" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{t('common.cancel')}</button>
                <button type="submit" disabled={submitting} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('common.saving')}</> : (editingDept ? t('admin.update') : t('admin.create'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DepartmentsPage
