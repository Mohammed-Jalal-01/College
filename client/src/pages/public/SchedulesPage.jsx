import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { schedulesService } from '../../services/api/schedulesService';
import { referenceDataService } from '../../services/api/referenceDataService';
import { useAuth } from '../../contexts/AuthContext';

const SchedulesPage = () => {
  const { t, i18n } = useTranslation();
  const { isAdmin } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [branches, setBranches] = useState([]);
  const [studyTypes, setStudyTypes] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    branchId: '',
    studyTypeId: '',
    stageId: '',
  });
  const [formData, setFormData] = useState({
    subjectNameEn: '',
    subjectNameAr: '',
    instructorName: '',
    roomNumber: '',
    day: '',
    startTime: '',
    endTime: '',
    branchId: '',
    studyTypeId: '',
    stageId: '',
  });

  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    fetchSchedules();
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

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await schedulesService.getAll(filters);
      setSchedules(data);
    } catch (err) {
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleResetFilters = () => {
    setFilters({ branchId: '', studyTypeId: '', stageId: '' });
  };

  const resetForm = () => {
    setFormData({
      subjectNameEn: '', subjectNameAr: '', instructorName: '', roomNumber: '',
      day: '', startTime: '', endTime: '', branchId: '', studyTypeId: '', stageId: '',
    });
    setEditingSchedule(null);
    setShowForm(false);
    setError('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenEdit = (schedule) => {
    setFormData({
      subjectNameEn: schedule.subjectNameEn,
      subjectNameAr: schedule.subjectNameAr,
      instructorName: schedule.instructorName,
      roomNumber: schedule.roomNumber || '',
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      branchId: schedule.branchId,
      studyTypeId: schedule.studyTypeId,
      stageId: schedule.stageId,
    });
    setEditingSchedule(schedule);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.subjectNameEn.trim() || !formData.subjectNameAr.trim() || !formData.instructorName.trim()) {
      setError(t('schedules.allFieldsRequired'));
      return;
    }
    if (!formData.day || !formData.startTime || !formData.endTime) {
      setError(t('schedules.allFieldsRequired'));
      return;
    }
    if (!formData.branchId || !formData.studyTypeId || !formData.stageId) {
      setError(t('schedules.allFieldsRequired'));
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        subjectNameEn: formData.subjectNameEn.trim(),
        subjectNameAr: formData.subjectNameAr.trim(),
        instructorName: formData.instructorName.trim(),
        roomNumber: formData.roomNumber.trim() || null,
        day: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
        branchId: formData.branchId,
        studyTypeId: formData.studyTypeId,
        stageId: formData.stageId,
      };

      if (editingSchedule) {
        await schedulesService.update(editingSchedule.id, payload);
      } else {
        await schedulesService.create(payload);
      }

      resetForm();
      await fetchSchedules();
    } catch (err) {
      const data = err.response?.data;
      let msg = data?.message;
      if (!msg && data?.errors) {
        const firstKey = Object.keys(data.errors)[0];
        msg = data.errors[firstKey]?.[0];
      }
      setError(msg || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    try {
      await schedulesService.delete(id);
      await fetchSchedules();
    } catch (err) {
      console.error('Error deleting schedule:', err);
    }
  };

  const groupedSchedules = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.day]) acc[schedule.day] = [];
    acc[schedule.day].push(schedule);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          {t('nav.schedules')}
        </h1>
        {isAdmin && (
          <button onClick={handleOpenCreate} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-5 h-5 mr-2" />
            {t('admin.addSchedule')}
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('filters.filterBy')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <button onClick={handleResetFilters} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            {t('filters.reset')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">{t('schedules.noSchedules')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {daysOrder.map((day) => {
            const daySchedules = groupedSchedules[day];
            if (!daySchedules || daySchedules.length === 0) return null;

            return (
              <div key={day} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-primary-600 px-6 py-3">
                  <h3 className="text-xl font-bold text-white">{t(`schedules.${day.toLowerCase()}`)}</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {daySchedules.map((schedule) => (
                      <div key={schedule.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow relative group">
                        {isAdmin && (
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenEdit(schedule)} className="p-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button onClick={() => handleDelete(schedule.id)} className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                          {i18n.language === 'ar' ? schedule.subjectNameAr : schedule.subjectNameEn}
                        </h4>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            <span>{schedule.startTime?.slice(0, 5)} - {schedule.endTime?.slice(0, 5)}</span>
                          </div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            <span>{schedule.instructorName}</span>
                          </div>
                          {schedule.roomNumber && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{schedule.roomNumber}</span>
                            </div>
                          )}
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                              {i18n.language === 'ar' ? schedule.branchNameAr : schedule.branchNameEn}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingSchedule ? t('admin.editSchedule') : t('admin.addSchedule')}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('schedules.subjectEn')}</label>
                  <input type="text" value={formData.subjectNameEn} onChange={(e) => setFormData({ ...formData, subjectNameEn: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('schedules.subjectAr')}</label>
                  <input type="text" value={formData.subjectNameAr} onChange={(e) => setFormData({ ...formData, subjectNameAr: e.target.value })} dir="rtl" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('schedules.instructor')}</label>
                  <input type="text" value={formData.instructorName} onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('schedules.room')}</label>
                  <input type="text" value={formData.roomNumber} onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('schedules.day')}</label>
                <select value={formData.day} onChange={(e) => setFormData({ ...formData, day: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" required>
                  <option value="">{t('schedules.selectDay')}</option>
                  {daysOrder.map((d) => (<option key={d} value={d}>{t(`schedules.${d.toLowerCase()}`)}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('schedules.startTime')}</label>
                  <input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('schedules.endTime')}</label>
                  <input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" required />
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
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{t('common.cancel')}</button>
                <button type="submit" disabled={submitting} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('common.saving')}</>) : (editingSchedule ? t('admin.update') : t('admin.create'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulesPage;
