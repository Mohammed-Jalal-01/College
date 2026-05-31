import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Download,
  FileText,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { materialsService } from '../../services/api/materialsService';
import { referenceDataService } from '../../services/api/referenceDataService';
import { useAuth } from '../../contexts/AuthContext';

const MaterialsPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [branches, setBranches] = useState([]);
  const [studyTypes, setStudyTypes] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    branchId: '',
    studyTypeId: '',
    stageId: '',
    course: '',
  });
  const [formData, setFormData] = useState({
    titleEn: '',
    titleAr: '',
    descriptionEn: '',
    descriptionAr: '',
    branchId: '',
    studyTypeId: '',
    stageId: '',
    course: '',
    file: null,
  });

  const isFacultyOrAdmin =
    user?.userType === 'Faculty' ||
    user?.role === 'Admin' ||
    user?.role === 'SuperAdmin';

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [filters]);

  const fetchReferenceData = async () => {
    try {
      const [branchesData, studyTypesData, stagesData] = await Promise.all([
        referenceDataService.getBranches(),
        referenceDataService.getStudyTypes(),
        referenceDataService.getStages(),
      ]);
      setBranches(branchesData);
      setStudyTypes(studyTypesData);
      setStages(stagesData);
    } catch (err) {
      console.error('Error fetching reference data:', err);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await materialsService.getAll(filters);
      setMaterials(data);
      if (data.length > 0 && !activeTab) {
        setActiveTab(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setActiveTab(null);
  };

  const handleResetFilters = () => {
    setFilters({ branchId: '', studyTypeId: '', stageId: '', course: '' });
    setActiveTab(null);
  };

  const resetForm = () => {
    setFormData({
      titleEn: '', titleAr: '', descriptionEn: '', descriptionAr: '',
      branchId: '', studyTypeId: '', stageId: '', course: '', file: null,
    });
    setEditingMaterial(null);
    setShowForm(false);
    setError('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenEdit = (material) => {
    setFormData({
      titleEn: material.titleEn,
      titleAr: material.titleAr,
      descriptionEn: material.descriptionEn || '',
      descriptionAr: material.descriptionAr || '',
      branchId: material.branchId,
      studyTypeId: material.studyTypeId,
      stageId: material.stageId,
      course: material.course,
      file: null,
    });
    setEditingMaterial(material);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.titleEn.trim() || !formData.titleAr.trim()) {
      setError(t('materials.titleRequired'));
      return;
    }
    if (!formData.branchId || !formData.studyTypeId || !formData.stageId || !formData.course) {
      setError(t('materials.allFieldsRequired'));
      return;
    }
    if (!editingMaterial && !formData.file) {
      setError(t('materials.fileRequired'));
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('titleEn', formData.titleEn.trim());
      data.append('titleAr', formData.titleAr.trim());
      data.append('descriptionEn', formData.descriptionEn.trim());
      data.append('descriptionAr', formData.descriptionAr.trim());
      data.append('branchId', formData.branchId);
      data.append('studyTypeId', formData.studyTypeId);
      data.append('stageId', formData.stageId);
      data.append('course', formData.course);
      if (formData.file) {
        data.append('file', formData.file);
      }

      if (editingMaterial) {
        await materialsService.update(editingMaterial.id, data);
      } else {
        await materialsService.create(data);
      }

      resetForm();
      await fetchMaterials();
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    try {
      await materialsService.delete(id);
      if (activeTab === id) setActiveTab(null);
      await fetchMaterials();
    } catch (err) {
      console.error('Error deleting material:', err);
    }
  };

  const activeMaterial = materials.find((m) => m.id === activeTab);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          {t('nav.materials')}
        </h1>
        {isFacultyOrAdmin && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('admin.addMaterial')}
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('filters.filterBy')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select value={filters.branchId} onChange={(e) => handleFilterChange('branchId', e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">{t('filters.all')} - {t('filters.branch')}</option>
            {branches.map((b) => (<option key={b.id} value={b.id}>{i18n.language === 'ar' ? b.nameAr : b.nameEn}</option>))}
          </select>
          <select value={filters.studyTypeId} onChange={(e) => handleFilterChange('studyTypeId', e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">{t('filters.all')} - {t('filters.studyType')}</option>
            {studyTypes.map((st) => (<option key={st.id} value={st.id}>{i18n.language === 'ar' ? st.nameAr : st.nameEn}</option>))}
          </select>
          <select value={filters.stageId} onChange={(e) => handleFilterChange('stageId', e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">{t('filters.all')} - {t('filters.stage')}</option>
            {stages.map((s) => (<option key={s.id} value={s.id}>{i18n.language === 'ar' ? s.nameAr : s.nameEn}</option>))}
          </select>
          <select value={filters.course} onChange={(e) => handleFilterChange('course', e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">{t('filters.all')} - {t('filters.course')}</option>
            <option value="First">{t('filters.firstCourse')}</option>
            <option value="Second">{t('filters.secondCourse')}</option>
          </select>
          <button onClick={handleResetFilters} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            {t('filters.reset')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">{t('materials.noMaterials')}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <nav className="flex" aria-label="Tabs">
              {materials.map((material) => (
                <button
                  key={material.id}
                  onClick={() => setActiveTab(material.id)}
                  className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === material.id
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    {i18n.language === 'ar' ? material.titleAr : material.titleEn}
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {activeMaterial && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {i18n.language === 'ar' ? activeMaterial.titleAr : activeMaterial.titleEn}
                  </h3>
                  {(activeMaterial.descriptionEn || activeMaterial.descriptionAr) && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {i18n.language === 'ar' ? activeMaterial.descriptionAr : activeMaterial.descriptionEn}
                    </p>
                  )}
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p><span className="font-medium">{t('filters.branch')}:</span> {i18n.language === 'ar' ? activeMaterial.branchNameAr : activeMaterial.branchNameEn}</p>
                    <p><span className="font-medium">{t('filters.stage')}:</span> {i18n.language === 'ar' ? activeMaterial.stageNameAr : activeMaterial.stageNameEn}</p>
                    <p><span className="font-medium">{t('filters.studyType')}:</span> {i18n.language === 'ar' ? activeMaterial.studyTypeNameAr : activeMaterial.studyTypeNameEn}</p>
                    <p><span className="font-medium">{t('materials.course')}:</span> {activeMaterial.course}</p>
                    <p><span className="font-medium">{t('materials.fileType')}:</span> <span className="uppercase">{activeMaterial.fileType}</span></p>
                    <p><span className="font-medium">{t('content.createdBy')}:</span> {activeMaterial.uploadedByName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${activeMaterial.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t('common.download')}
                  </a>
                  {isFacultyOrAdmin && (
                    <>
                      <button onClick={() => handleOpenEdit(activeMaterial)} className="flex items-center px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(activeMaterial.id)} className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingMaterial ? t('admin.editMaterial') : t('admin.addMaterial')}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('materials.titleEn')}</label>
                <input type="text" value={formData.titleEn} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" maxLength={200} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('materials.titleAr')}</label>
                <input type="text" value={formData.titleAr} onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" dir="rtl" maxLength={200} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('materials.descriptionEn')}</label>
                  <textarea value={formData.descriptionEn} onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })} rows={2} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('materials.descriptionAr')}</label>
                  <textarea value={formData.descriptionAr} onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })} rows={2} dir="rtl" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('filters.branch')}</label>
                <select value={formData.branchId} onChange={(e) => setFormData({ ...formData, branchId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" required>
                  <option value="">{t('filters.selectBranch')}</option>
                  {branches.map((b) => (<option key={b.id} value={b.id}>{i18n.language === 'ar' ? b.nameAr : b.nameEn}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('filters.stage')}</label>
                  <select value={formData.stageId} onChange={(e) => setFormData({ ...formData, stageId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" required>
                    <option value="">{t('filters.selectStage')}</option>
                    {stages.map((s) => (<option key={s.id} value={s.id}>{i18n.language === 'ar' ? s.nameAr : s.nameEn}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('filters.studyType')}</label>
                  <select value={formData.studyTypeId} onChange={(e) => setFormData({ ...formData, studyTypeId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" required>
                    <option value="">{t('filters.selectStudyType')}</option>
                    {studyTypes.map((st) => (<option key={st.id} value={st.id}>{i18n.language === 'ar' ? st.nameAr : st.nameEn}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('filters.course')}</label>
                <select value={formData.course} onChange={(e) => setFormData({ ...formData, course: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" required>
                  <option value="">{t('materials.selectCourse')}</option>
                  <option value="First">{t('filters.firstCourse')}</option>
                  <option value="Second">{t('filters.secondCourse')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('materials.file')}
                  {editingMaterial && <span className="text-gray-400 font-normal"> ({t('materials.leaveEmptyToKeep')})</span>}
                </label>
                <input type="file" onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-900 dark:file:text-primary-300" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ods,.ppt,.pptx,.png,.jpg,.jpeg,.txt,.zip,.rar" required={!editingMaterial} />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('materials.allowedTypes')}: PDF, DOC, DOCX, XLS, XLSX, CSV, ODS, PPT, PPTX, PNG, JPG, TXT, ZIP, RAR (max 50MB)</p>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{t('common.cancel')}</button>
                <button type="submit" disabled={submitting} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('common.saving')}</>) : (<><Upload className="w-4 h-4 mr-2" />{editingMaterial ? t('admin.update') : t('admin.create')}</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsPage;
