import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, X, Upload, Download } from 'lucide-react';
import { materialsService } from '../../services/api/materialsService';
import { referenceDataService } from '../../services/api/referenceDataService';

const MaterialsManagement = () => {
  const { t, i18n } = useTranslation();
  const [materials, setMaterials] = useState([]);
  const [branches, setBranches] = useState([]);
  const [studyTypes, setStudyTypes] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    branchId: '',
    studyTypeId: '',
    stageId: '',
    course: '',
    titleEn: '',
    titleAr: '',
    descriptionEn: '',
    descriptionAr: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [materialsData, branchesData, studyTypesData, stagesData] = await Promise.all([
        materialsService.getAll(),
        referenceDataService.getBranches(),
        referenceDataService.getStudyTypes(),
        referenceDataService.getStages(),
      ]);
      setMaterials(materialsData);
      setBranches(branchesData);
      setStudyTypes(studyTypesData);
      setStages(stagesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingMaterial && !selectedFile) {
      alert(t('materials.fileRequired'));
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('branchId', formData.branchId);
      formDataToSend.append('studyTypeId', formData.studyTypeId);
      formDataToSend.append('stageId', formData.stageId);
      formDataToSend.append('course', formData.course);
      formDataToSend.append('titleEn', formData.titleEn);
      formDataToSend.append('titleAr', formData.titleAr);
      formDataToSend.append('descriptionEn', formData.descriptionEn || '');
      formDataToSend.append('descriptionAr', formData.descriptionAr || '');
      
      if (selectedFile) {
        formDataToSend.append('file', selectedFile);
      }

      if (editingMaterial) {
        await materialsService.update(editingMaterial.id, formDataToSend);
      } else {
        await materialsService.create(formDataToSend);
      }
      
      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving material:', error);
      alert(error.response?.data?.message || t('common.error'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.confirmDelete'))) {
      try {
        await materialsService.delete(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting material:', error);
        alert(error.response?.data?.message || t('common.error'));
      }
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      branchId: material.branchId,
      studyTypeId: material.studyTypeId,
      stageId: material.stageId,
      course: material.course,
      titleEn: material.titleEn,
      titleAr: material.titleAr,
      descriptionEn: material.descriptionEn || '',
      descriptionAr: material.descriptionAr || '',
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMaterial(null);
    setSelectedFile(null);
    setFormData({
      branchId: '',
      studyTypeId: '',
      stageId: '',
      course: '',
      titleEn: '',
      titleAr: '',
      descriptionEn: '',
      descriptionAr: '',
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(t('materials.fileTooLarge'));
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.materials')}
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('admin.addMaterial')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('materials.title')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('materials.course')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('filters.branch')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('filters.stage')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('materials.fileType')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {materials.map((material) => (
                <tr key={material.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {i18n.language === 'ar' ? material.titleAr : material.titleEn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {material.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {i18n.language === 'ar' ? material.branchNameAr : material.branchNameEn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {i18n.language === 'ar' ? material.stageNameAr : material.stageNameEn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded text-xs uppercase">
                      {material.fileType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <a
                      href={`http://localhost:5000${material.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-900 dark:text-green-400 inline-block"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => handleEdit(material)}
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingMaterial ? t('admin.editMaterial') : t('admin.addMaterial')}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('filters.branch')}
                  </label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    {t('filters.studyType')}
                  </label>
                  <select
                    value={formData.studyTypeId}
                    onChange={(e) => setFormData({ ...formData, studyTypeId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    {t('filters.stage')}
                  </label>
                  <select
                    value={formData.stageId}
                    onChange={(e) => setFormData({ ...formData, stageId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    {t('materials.course')}
                  </label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{t('materials.selectCourse')}</option>
                    <option value="First">{t('filters.firstCourse')}</option>
                    <option value="Second">{t('filters.secondCourse')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('materials.titleEn')}
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('materials.titleAr')}
                  </label>
                  <input
                    type="text"
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('materials.descriptionEn')}
                  </label>
                  <textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('materials.descriptionAr')}
                  </label>
                  <textarea
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('materials.file')} {!editingMaterial && '*'}
                  </label>
                  <div className="flex items-center space-x-2">
                    <label className="flex-1 flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
                      <Upload className="w-5 h-5 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedFile ? selectedFile.name : t('materials.chooseFile')}
                      </span>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
                        className="hidden"
                        required={!editingMaterial}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('materials.allowedTypes')}: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP, RAR (Max 50MB)
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingMaterial ? t('common.update') : t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsManagement;
