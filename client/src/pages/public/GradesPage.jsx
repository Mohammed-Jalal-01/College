import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClipboardList,
  Download,
  FileSpreadsheet,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { gradesService } from '../../services/api/gradesService';
import { referenceDataService } from '../../services/api/referenceDataService';
import { useAuth } from '../../contexts/AuthContext';

const GradesPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [branches, setBranches] = useState([]);
  const [studyTypes, setStudyTypes] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    branchId: '',
    studyTypeId: '',
    stageId: '',
  });
  const [formData, setFormData] = useState({
    subjectName: '',
    branchId: '',
    studyTypeId: '',
    stageId: '',
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
    fetchGrades();
  }, [filters]);

  const fetchReferenceData = async () => {
    try {
      const [branchesData, studyTypesData, stagesData] = await Promise.all([
        referenceDataService.getBranches(),
        referenceDataService.getStudyTypesForRegistration(),
        referenceDataService.getStages(),
      ]);
      setBranches(branchesData);
      setStudyTypes(studyTypesData);
      setStages(stagesData);
    } catch (err) {
      console.error('Error fetching reference data:', err);
    }
  };

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const data = await gradesService.getAll(filters);
      setGrades(data);
      if (data.length > 0 && !activeTab) {
        setActiveTab(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching grades:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setActiveTab(null);
  };

  const handleResetFilters = () => {
    setFilters({ branchId: '', studyTypeId: '', stageId: '' });
    setActiveTab(null);
  };

  const resetForm = () => {
    setFormData({
      subjectName: '',
      branchId: '',
      studyTypeId: '',
      stageId: '',
      file: null,
    });
    setEditingGrade(null);
    setShowForm(false);
    setError('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenEdit = (grade) => {
    setFormData({
      subjectName: grade.subjectName,
      branchId: grade.branchId,
      studyTypeId: grade.studyTypeId,
      stageId: grade.stageId,
      file: null,
    });
    setEditingGrade(grade);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.subjectName.trim()) {
      setError(t('grades.subjectRequired'));
      return;
    }
    if (!formData.branchId || !formData.studyTypeId || !formData.stageId) {
      setError(t('grades.allFieldsRequired'));
      return;
    }
    if (!editingGrade && !formData.file) {
      setError(t('grades.fileRequired'));
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('subjectName', formData.subjectName.trim());
      data.append('branchId', formData.branchId);
      data.append('studyTypeId', formData.studyTypeId);
      data.append('stageId', formData.stageId);
      if (formData.file) {
        data.append('file', formData.file);
      }

      if (editingGrade) {
        await gradesService.update(editingGrade.id, data);
      } else {
        await gradesService.create(data);
      }

      resetForm();
      await fetchGrades();
    } catch (err) {
      const message =
        err.response?.data?.message || t('common.error');
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (gradeId) => {
    if (!window.confirm(t('grades.confirmDelete'))) return;

    try {
      await gradesService.delete(gradeId);
      if (activeTab === gradeId) {
        setActiveTab(null);
      }
      await fetchGrades();
    } catch (err) {
      console.error('Error deleting grade:', err);
    }
  };

  const activeGrade = grades.find((g) => g.id === activeTab);

  const canModify = (grade) => {
    if (!isFacultyOrAdmin) return false;
    if (user?.role === 'Admin' || user?.role === 'SuperAdmin') return true;
    return grade.uploadedBy === user?.userId;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          {t('nav.grades')}
        </h1>
        {isFacultyOrAdmin && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('grades.addGrade')}
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('filters.filterBy')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.branchId}
            onChange={(e) => handleFilterChange('branchId', e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">
              {t('filters.all')} - {t('filters.branch')}
            </option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {i18n.language === 'ar' ? branch.nameAr : branch.nameEn}
              </option>
            ))}
          </select>

          <select
            value={filters.studyTypeId}
            onChange={(e) => handleFilterChange('studyTypeId', e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">
              {t('filters.all')} - {t('filters.studyType')}
            </option>
            {studyTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {i18n.language === 'ar' ? type.nameAr : type.nameEn}
              </option>
            ))}
          </select>

          <select
            value={filters.stageId}
            onChange={(e) => handleFilterChange('stageId', e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">
              {t('filters.all')} - {t('filters.stage')}
            </option>
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {i18n.language === 'ar' ? stage.nameAr : stage.nameEn}
              </option>
            ))}
          </select>

          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {t('filters.reset')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : grades.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {t('grades.noGrades')}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <nav className="flex" aria-label="Tabs">
              {grades.map((grade) => (
                <button
                  key={grade.id}
                  onClick={() => setActiveTab(grade.id)}
                  className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === grade.id
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    {grade.subjectName}
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {activeGrade && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {activeGrade.subjectName}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      <span className="font-medium">{t('filters.branch')}:</span>{' '}
                      {i18n.language === 'ar'
                        ? activeGrade.branchNameAr
                        : activeGrade.branchNameEn}
                    </p>
                    <p>
                      <span className="font-medium">{t('filters.stage')}:</span>{' '}
                      {i18n.language === 'ar'
                        ? activeGrade.stageNameAr
                        : activeGrade.stageNameEn}
                    </p>
                    <p>
                      <span className="font-medium">
                        {t('filters.studyType')}:
                      </span>{' '}
                      {i18n.language === 'ar'
                        ? activeGrade.studyTypeNameAr
                        : activeGrade.studyTypeNameEn}
                    </p>
                    <p>
                      <span className="font-medium">
                        {t('grades.uploadedBy')}:
                      </span>{' '}
                      {activeGrade.uploadedByName}
                    </p>
                    <p>
                      <span className="font-medium">
                        {t('grades.fileName')}:
                      </span>{' '}
                      {activeGrade.originalFileName}
                    </p>
                    <p>
                      <span className="font-medium">
                        {t('grades.fileType')}:
                      </span>{' '}
                      <span className="uppercase">{activeGrade.fileType}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${activeGrade.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t('common.download')}
                  </a>
                  {canModify(activeGrade) && (
                    <>
                      <button
                        onClick={() => handleOpenEdit(activeGrade)}
                        className="flex items-center px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(activeGrade.id)}
                        className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
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
                {editingGrade ? t('grades.editGrade') : t('grades.addGrade')}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('grades.subjectName')}
                </label>
                <input
                  type="text"
                  value={formData.subjectName}
                  onChange={(e) =>
                    setFormData({ ...formData, subjectName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  maxLength={200}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('filters.branch')}
                </label>
                <select
                  value={formData.branchId}
                  onChange={(e) =>
                    setFormData({ ...formData, branchId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                >
                  <option value="">{t('filters.selectBranch')}</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {i18n.language === 'ar' ? branch.nameAr : branch.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('filters.stage')}
                </label>
                <select
                  value={formData.stageId}
                  onChange={(e) =>
                    setFormData({ ...formData, stageId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                >
                  <option value="">{t('filters.selectStage')}</option>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {i18n.language === 'ar' ? stage.nameAr : stage.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('filters.studyType')}
                </label>
                <select
                  value={formData.studyTypeId}
                  onChange={(e) =>
                    setFormData({ ...formData, studyTypeId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                >
                  <option value="">{t('filters.selectStudyType')}</option>
                  {studyTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {i18n.language === 'ar' ? type.nameAr : type.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('grades.file')}
                  {editingGrade && (
                    <span className="text-gray-400 font-normal">
                      {' '}
                      ({t('grades.leaveEmptyToKeep')})
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) =>
                      setFormData({ ...formData, file: e.target.files[0] })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-900 dark:file:text-primary-300"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ods,.ppt,.pptx,.png,.jpg,.jpeg,.txt,.zip,.rar"
                    required={!editingGrade}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t('grades.allowedTypes')}: PDF, DOC, DOCX, XLS, XLSX, CSV,
                  ODS, PPT, PPTX, PNG, JPG, TXT, ZIP, RAR (max 50MB)
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('common.saving')}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {editingGrade ? t('admin.update') : t('admin.create')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradesPage;
