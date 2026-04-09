import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Download, FileText } from 'lucide-react';
import { materialsService } from '../../services/api/materialsService';
import { referenceDataService } from '../../services/api/referenceDataService';

const MaterialsPage = () => {
  const { t, i18n } = useTranslation();
  const [materials, setMaterials] = useState([]);
  const [branches, setBranches] = useState([]);
  const [studyTypes, setStudyTypes] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    branchId: '',
    studyTypeId: '',
    stageId: '',
    course: '',
  });

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
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await materialsService.getAll(filters);
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
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
      course: '',
    });
  };

  const getFileIcon = (fileType) => {
    return <FileText className="w-8 h-8 text-primary-600 dark:text-primary-400" />;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        {t('nav.materials')}
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('filters.filterBy')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

          <select
            value={filters.course}
            onChange={(e) => handleFilterChange('course', e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{t('filters.all')} - {t('filters.course')}</option>
            <option value="First">{t('filters.firstCourse')}</option>
            <option value="Second">{t('filters.secondCourse')}</option>
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
      ) : materials.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {t('materials.noMaterials')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <div
              key={material.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {getFileIcon(material.fileType)}
                  </div>
                  <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded text-xs uppercase font-semibold">
                    {material.fileType}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {i18n.language === 'ar' ? material.titleAr : material.titleEn}
                </h3>

                {(material.descriptionEn || material.descriptionAr) && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {i18n.language === 'ar' ? material.descriptionAr : material.descriptionEn}
                  </p>
                )}

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex justify-between">
                    <span className="font-medium">{t('filters.branch')}:</span>
                    <span>{i18n.language === 'ar' ? material.branchNameAr : material.branchNameEn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t('filters.stage')}:</span>
                    <span>{i18n.language === 'ar' ? material.stageNameAr : material.stageNameEn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t('materials.course')}:</span>
                    <span>{material.course}</span>
                  </div>
                </div>

                <a
                  href={`http://localhost:5000${material.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('common.download')}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialsPage;
