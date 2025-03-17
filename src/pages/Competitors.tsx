import React, { useState } from 'react';
import { useCompetitors } from '../hooks/useCompetitors';
import { Plus, Trash2, ExternalLink, Users } from 'lucide-react';

const platforms = ['TikTok', 'Instagram', 'YouTube', 'Twitter'] as const;

export default function Competitors() {
  const { competitors, loading, error, addCompetitor, removeCompetitor } = useCompetitors();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState({
    platform: platforms[0],
    username: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCompetitor({
        ...newCompetitor,
        followers: 0,
        engagement_rate: 0,
        top_posts: []
      });
      setShowAddModal(false);
      setNewCompetitor({ platform: platforms[0], username: '' });
    } catch (err) {
      console.error('Failed to add competitor:', err);
    }
  };

  if (error) {
    return (
      <div className="text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Competitor Analysis</h1>
          <p className="text-gray-400 mt-2">Track and analyze your competitors' performance</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Competitor</span>
        </button>
      </div>

      {/* Competitors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))
        ) : competitors.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400">No competitors added yet</h3>
            <p className="text-gray-500 mt-2">Start tracking your competitors by adding them here</p>
          </div>
        ) : (
          competitors.map(competitor => (
            <div key={competitor.id} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{competitor.username}</h3>
                  <p className="text-sm text-gray-400">{competitor.platform}</p>
                </div>
                <button
                  onClick={() => removeCompetitor(competitor.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Followers</span>
                  <span className="text-white font-medium">
                    {competitor.followers.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Engagement Rate</span>
                  <span className="text-white font-medium">
                    {competitor.engagement_rate.toFixed(2)}%
                  </span>
                </div>
              </div>

              <a
                href={`https://${competitor.platform.toLowerCase()}.com/${competitor.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View Profile</span>
              </a>
            </div>
          ))
        )}
      </div>

      {/* Add Competitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-purple-500" />
                <h2 className="text-2xl font-bold">Add Competitor</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Platform
                </label>
                <select
                  value={newCompetitor.platform}
                  onChange={(e) => setNewCompetitor({
                    ...newCompetitor,
                    platform: e.target.value as typeof platforms[number]
                  })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {platforms.map(platform => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={newCompetitor.username}
                  onChange={(e) => setNewCompetitor({
                    ...newCompetitor,
                    username: e.target.value
                  })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Add Competitor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
