import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Settings as SettingsIcon, 
  User, 
  AtSign, 
  Camera, 
  Instagram, 
  Youtube, 
  Twitter, 
  BookText as TikTok, 
  Save, 
  Loader2,
  Bookmark,
  TrendingUp,
  TrendingDown,
  Minus,
  Trash2,
  ExternalLink,
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react';

interface SavedContent {
  id: string;
  content_id: string;
  platform: string;
  content_data: {
    caption: string;
    thumbnailUrl: string;
    videoUrl: string;
    username: string;
    userAvatar: string;
    metrics: {
      likes: number;
      comments: number;
      shares: number;
      saves: number;
      views: number;
    };
  };
  created_at: string;
}

const niches = [
  'comedy',
  'dance',
  'fashion',
  'food',
  'beauty',
  'fitness',
  'education',
  'lifestyle',
  'travel',
  'gaming'
];

const platforms = [
  { name: 'Instagram', icon: Instagram },
  { name: 'TikTok', icon: TikTok },
  { name: 'YouTube', icon: Youtube },
  { name: 'Twitter', icon: Twitter }
];

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'saved', label: 'Saved Content' }
];

function calculateViralityScore(metrics: SavedContent['content_data']['metrics']): {
  score: 'high' | 'medium' | 'low';
  value: number;
} {
  if (!metrics || !metrics.views) {
    return { score: 'low', value: 0 };
  }

  const {
    shares = 0,
    saves = 0,
    comments = 0,
    likes = 0,
    views = 1
  } = metrics;

  const weightedScore = 
    (shares * 2) +
    (saves * 1.5) +
    (comments * 1) +
    (likes * 0.5);

  const normalizedScore = (weightedScore / views) * 100;

  if (normalizedScore > 15) {
    return { score: 'high', value: normalizedScore };
  } else if (normalizedScore > 8) {
    return { score: 'medium', value: normalizedScore };
  } else {
    return { score: 'low', value: normalizedScore };
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profile, setProfile] = useState({
    full_name: '',
    avatar_url: '',
    primary_niche: '',
    connected_accounts: {} as Record<string, string>
  });
  const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [viralityFilter, setViralityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    fetchProfile();
    fetchSavedContent();
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile({
        full_name: data.full_name || '',
        avatar_url: data.avatar_url || '',
        primary_niche: data.primary_niche || '',
        connected_accounts: data.connected_accounts || {}
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedContent = async () => {
    try {
      setLoadingSaved(true);
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_content')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSavedContent(data || []);
    } catch (error) {
      console.error('Error fetching saved content:', error);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const { error } = await supabase
        .from('users')
        .update({
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          primary_niche: profile.primary_niche,
          connected_accounts: profile.connected_accounts,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: 'Failed to update profile. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setMessage(null);
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(data.path);

        setProfile(prev => ({
          ...prev,
          avatar_url: publicUrl
        }));
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage({
        type: 'error',
        text: 'Failed to upload avatar. Please try again.'
      });
    }
  };

  const handleRemoveSavedContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_content')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setSavedContent(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing saved content:', error);
    }
  };

  const getViralityIcon = (score: 'high' | 'medium' | 'low') => {
    switch (score) {
      case 'high':
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'low':
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getViralityBadgeColor = (score: 'high' | 'medium' | 'low') => {
    switch (score) {
      case 'high':
        return 'bg-red-500 bg-opacity-10 text-red-500 border border-red-500';
      case 'medium':
        return 'bg-green-500 bg-opacity-10 text-green-500 border border-green-500';
      case 'low':
        return 'bg-gray-500 bg-opacity-10 text-gray-500 border border-gray-500';
    }
  };

  const filteredContent = savedContent.filter(item => {
    if (viralityFilter === 'all') return true;
    const virality = calculateViralityScore(item.content_data.metrics);
    return virality.score === viralityFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <SettingsIcon className="h-6 w-6 text-purple-500 mr-2" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <div className="flex space-x-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500 bg-opacity-10 border border-green-500 text-green-500'
              : 'bg-red-500 bg-opacity-10 border border-red-500 text-red-500'
          }`}
        >
          {message.text}
        </div>
      )}

      {activeTab === 'profile' ? (
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <User className="h-5 w-5 text-purple-500 mr-2" />
              Profile Information
            </h2>

            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={profile.avatar_url || 'https://via.placeholder.com/100'}
                    alt="Profile"
                    className="h-20 w-20 rounded-full object-cover bg-gray-700"
                  />
                  <label className="absolute bottom-0 right-0 bg-purple-500 p-2 rounded-full cursor-pointer hover:bg-purple-600 transition-colors">
                    <Camera className="h-4 w-4 text-white" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <div>
                  <h3 className="font-medium">Profile Photo</h3>
                  <p className="text-sm text-gray-400">
                    Upload a new profile picture
                  </p>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Primary Niche */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Primary Niche
                </label>
                <select
                  value={profile.primary_niche}
                  onChange={(e) =>
                    setProfile({ ...profile, primary_niche: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a niche</option>
                  {niches.map((niche) => (
                    <option key={niche} value={niche}>
                      {niche.charAt(0).toUpperCase() + niche.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Connected Accounts Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <AtSign className="h-5 w-5 text-purple-500 mr-2" />
              Connected Accounts
            </h2>

            <div className="space-y-4">
              {platforms.map(({ name, icon: Icon }) => {
                const username = profile.connected_accounts[name.toLowerCase()];
                return (
                  <div
                    key={name}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-600 p-2 rounded-lg">
                        <Icon className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">{name}</h3>
                        <p className="text-sm text-gray-400">
                          {username ? `@${username}` : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <div className="relative flex-1 sm:max-w-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">@</span>
                      </div>
                      <input
                        type="text"
                        placeholder={`Enter ${name} username`}
                        value={username || ''}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            connected_accounts: {
                              ...profile.connected_accounts,
                              [name.toLowerCase()]: e.target.value
                            }
                          })
                        }
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg pl-8 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Saved Content Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Bookmark className="h-5 w-5 text-purple-500 mr-2" />
                Saved Content
              </h2>
              <select
                value={viralityFilter}
                onChange={(e) => setViralityFilter(e.target.value as typeof viralityFilter)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Virality</option>
                <option value="high">High Virality</option>
                <option value="medium">Medium Virality</option>
                <option value="low">Low Virality</option>
              </select>
            </div>

            {loadingSaved ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-gray-700 rounded-lg overflow-hidden animate-pulse">
                    <div className="aspect-video bg-gray-600" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-600 rounded w-3/4" />
                      <div className="h-4 bg-gray-600 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredContent.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.map(item => {
                  const virality = calculateViralityScore(item.content_data.metrics);
                  return (
                    <div key={item.id} className="bg-gray-700 rounded-lg overflow-hidden">
                      <div className="aspect-video relative group">
                        <img
                          src={item.content_data.thumbnailUrl}
                          alt={item.content_data.caption}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a
                            href={item.content_data.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                          >
                            Watch Content
                          </a>
                        </div>
                        <div className="absolute top-2 right-2 flex items-center space-x-2">
                          <div className={`px-3 py-1 rounded-full flex items-center space-x-2 ${getViralityBadgeColor(virality.score)}`}>
                            {getViralityIcon(virality.score)}
                            <span className="text-sm font-medium">
                              {virality.score.charAt(0).toUpperCase() + virality.score.slice(1)} Virality
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveSavedContent(item.id)}
                          className="absolute top-2 left-2 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-colors text-white hover:text-red-500"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <img
                            src={item.content_data.userAvatar}
                            alt={item.content_data.username}
                            className="h-6 w-6 rounded-full"
                          />
                          <span className="text-sm font-medium text-purple-400">
                            @{item.content_data.username}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                          {item.content_data.caption}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Heart className="h-4 w-4 mr-1" />
                              <span>{formatNumber(item.content_data.metrics.likes)}</span>
                            </div>
                            <div className="flex items-center">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              <span>{formatNumber(item.content_data.metrics.comments)}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Share2 className="h-4 w-4 mr-1" />
                              <span>{formatNumber(item.content_data.metrics.shares)}</span>
                            </div>
                            <div className="flex items-center">
                              <Bookmark className="h-4 w-4 mr-1" />
                              <span>{formatNumber(item.content_data.metrics.saves)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bookmark className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400">No saved content</h3>
                <p className="text-gray-500 mt-2">
                  Start saving content from the Explore page
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
