import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { schedulesService } from '../../services/api/schedulesService';
import { referenceDataService } from '../../services/api/referenceDataService';

const SchedulesPage = () => {
  const { t, i18n } = useTranslation();
  const [schedules, setSchedules] = useState([]);
  const [branches, setBranches] = useState([]);
  const [studyTypes, setStudyTypes] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    branchId: '',
    studyTypeId: '',
    stageId: '',
  });

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
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await schedulesService.getAll(filters);
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleResetFilters = () => {
    setFilters({
      branchId: '',
      studyTypeId: '',
      stageId: '',
    });
  };

  const groupedSchedules = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.day]) {
      acc[schedule.day] = [];
    }
    acc[schedule.day].push(schedule);
    return acc;
  }, {});

  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        {t('nav.schedules')}
      </h1>

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
            <option value="">{t('filters.all')} - {t('filters.branch')}</option>
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
            <option value="">{t('filters.all')} - {t('filters.studyType')}</option>
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
            <option value="">{t('filters.all')} - {t('filters.stage')}</option>
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
      ) : schedules.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {t('schedules.noSchedules')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {daysOrder.map((day) => {
            const daySchedules = groupedSchedules[day];
            if (!daySchedules || daySchedules.length === 0) return null;

            return (
              <div key={day} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-primary-600 px-6 py-3">
                  <h3 className="text-xl font-bold text-white">
                    {t(`schedules.${day.toLowerCase()}`)}
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                          {i18n.language === 'ar' ? schedule.subjectNameAr : schedule.subjectNameEn}
                        </h4>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{schedule.startTime} - {schedule.endTime}</span>
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
    </div>
  );
};

export default SchedulesPage;
