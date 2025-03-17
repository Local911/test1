import React, { useState } from 'react';
import { useAlerts } from '../hooks/useAlerts';
import { 
  Bell,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';

const platforms = ['TikTok', 'Instagram', 'YouTube', 'Twitter'] as const;

export default function Alerts() {
  const { alerts, loading, error, createAlert, updateAlert, deleteAlert, toggleAlert } = useAlerts();
  const [showModal, setShowModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    keywords: [] as string[],
    platforms: [] as string[],
    threshold: 50,
    enabled: true
  });
  const [keywordInput, setKeywordInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAlert) {
        await updateAlert(editingAlert, formData);
      } else {
        await createAlert(formData);
      }
      setShowModal(false);
      setEditingAlert(null);
      setFormData({ keywords: [], platforms: [], threshold: 50, enabled: true });
    } catch (err) {
      console.error('Failed to save alert:', err);
    }
  };

  const handleEdit = (alert: typeof alerts[0]) => {
    setFormData({
      keywords: alert.keywords,
      platforms: alert.platforms,
      threshold: alert.threshold,
      enabled: alert.enabled
    });
    setEditingAlert(alert.id);
    setShowModal(true);
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keyword)
    });
  };

  if (error) {
    return (
      <div className="text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Alert Settings</h1>
          <p className="text-gray-400 mt-2">Get notified when trends match your criteria</p>
        </div>
        <button
          onClick={() => {
            setEditingAlert(null);
            setFormData({ keywords: [], platforms: [], threshold: 50, enabled: true });
            setShowModal(true);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>New Alert</span>
        </button>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))
        ) : alerts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400">No alerts set up yet</h3>
            <p className="text-gray-500 mt-2">Create your first alert to start tracking trends</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${alert.enabled ? 'bg-purple-500 bg-opacity-20' : 'bg-gray-700'}`}>
                    <Bell className={`h-5 w-5 ${alert.enabled ? 'text-purple-500' : 'text-gray-400'}`} />
                  </div>
                  <button
                    onClick={() => toggleAlert(alert.id, !alert.enabled)}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.enabled 
                        ? 'bg-purple-500 bg-opacity-10 text-purple-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {alert.enabled ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(alert)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {alert.keywords.map(keyword => (
                      <span
                        key={keyword}
                        className="bg-gray-700 text-white text-sm px-2 py-1 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Platforms</h4>
                  <div className="flex flex-wrap gap-2">
                    {alert.platforms.map(platform => (
                      <span
                        key={platform}
                        className="bg-gray-700 text-white text-sm px-2 py-1 rounded"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Growth Threshold</h4>
                  <span className="text-white font-medium">{alert.threshold}%</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-purple-500" />
                <h2 className="text-2xl font-bold">
                  {editingAlert ? 'Edit Alert' : 'New Alert'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Keywords
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter a keyword"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-lg"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map(keyword => (
                    <span
                      key={keyword}
                      className="bg-gray-700 text-white text-sm px-2 py-1 rounded flex items-center"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="ml-2 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Platforms */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Platforms
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {platforms.map(platform => (
                    <label
                      key={platform}
                      className="flex items-center space-x-2 bg-gray-700 p-3 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.platforms.includes(platform)}
                        onChange={(e) => {
                          const newPlatforms = e.target.checked
                            ? [...formData.platforms, platform]
                            : formData.platforms.filter(p => p !== platform);
                          setFormData({ ...formData, platforms: newPlatforms });
                        }}
                        className="form-checkbox h-4 w-4 text-purple-600 rounded focus:ring-purple-500 bg-gray-600 border-gray-500"
                      />
                      <span className="text-white">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Growth Threshold (%)
                </label>
                <input
                  type="number"
                  value={formData.threshold}
                  onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                  max="1000"
                />
              </div>

              {/* Enabled/Disabled */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="form-checkbox h-5 w-5 text-purple-600 rounded focus:ring-purple-500 bg-gray-600 border-gray-500"
                />
                <span className="text-white">Enable Alert</span>
              </label>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {editingAlert ? 'Update Alert' : 'Create Alert'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
