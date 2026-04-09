import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save } from 'lucide-react';
import { aboutCollegeService } from '../../services/api/aboutCollegeService';

const AboutCollegeManagement = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    contentEn: '',
    contentAr: '',
  });

  useEffect(() => {
    fetchAboutCollege();
  }, []);

  const fetchAboutCollege = async () => {
    try {
      setLoading(true);
      const data = await aboutCollegeService.get();
      setFormData({
        contentEn: data.contentEn || '',
        contentAr: data.contentAr || '',
      });
    } catch (error) {
      console.error('Error fetching about college:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await aboutCollegeService.update(formData);
      alert(t('common.success'));
    } catch (error) {
      console.error('Error saving about college:', error);
      alert(error.response?.data?.message || t('common.error'));
    } finally {
      setSaving(false);
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
          {t('content.aboutCollege')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('content.contentEn')}
          </label>
          <textarea
            value={formData.contentEn}
            onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
            required
            rows="12"
            placeholder="Enter content in English..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('content.contentAr')}
          </label>
          <textarea
            value={formData.contentAr}
            onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
            required
            rows="12"
            placeholder="أدخل المحتوى بالعربية..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            dir="rtl"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AboutCollegeManagement;
