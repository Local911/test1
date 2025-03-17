import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LineChart as LineChartIcon, 
  Users, 
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
  Bookmark,
  ExternalLink,
  Heart,
  MessageCircle,
  Share2,
  ChevronRight,
  Search,
  Calendar
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { SavedContent } from '../types';
import SchedulePostModal from '../components/SchedulePostModal';

interface TrendingVideo {
  id: string;
  platform: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  creator: {
    username: string;
    avatar: string;
  };
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  timestamp: string;
  viralityScore: number;
}

const chartData = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 2000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 1890 },
  { name: 'Sat', value: 2390 },
  { name: 'Sun', value: 3490 },
];

const stats = [
  { 
    icon: TrendingUp,
    label: 'Active Trends',
    value: '24',
    change: '+12%',
    positive: true
  },
  {
    icon: Users,
    label: 'Competitors Tracked',
    value: '15',
    change: '+3',
    positive: true
  },
  {
    icon: Bell,
    label: 'Alert Triggers',
    value: '8',
    change: '-2',
    positive: false
  },
  {
    icon: LineChartIcon,
    label: 'Avg. Engagement',
    value: '22.4%',
    change: '+5.2%',
    positive: true
  }
];

const categories = [
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

const timeframes = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' }
];

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function calculateViralityScore(metrics: TrendingVideo['metrics']): {
  score: 'high' | 'medium' | 'low';
  value: number;
} {
  const weightedScore = 
    (metrics.shares * 2) + 
    (metrics.comments * 1.5) + 
    (metrics.likes * 1);

  const normalizedScore = (weightedScore / metrics.views) * 100;

  if (normalizedScore > 15) {
    return { score: 'high', value: normalizedScore };
  } else if (normalizedScore > 8) {
    return { score: 'medium', value: normalizedScore };
  } else {
    return { score: 'low', value: normalizedScore };
  }
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'tiktok' | 'twitter' | 'youtube'>('instagram');
  const [trendingVideos, setTrendingVideos] = useState<TrendingVideo[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedContent();
      fetchTrendingVideos();
    }
  }, [user]);

  const fetchSavedContent = async () => {
    try {
      setLoadingSaved(true);
      const { data, error } = await supabase
        .from('saved_content')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setSavedContent(data || []);
    } catch (err) {
      console.error('Error fetching saved content:', err);
    } finally {
      setLoadingSaved(false);
    }
  };

  const fetchTrendingVideos = async () => {
    try {
      setLoadingTrends(true);

      // Get user's niche
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('primary_niche')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;

      const userNiche = userData?.primary_niche || 'general';

      // Fetch trending videos in user's niche
      const { data: trendsData, error: trendsError } = await supabase
        .from('platform_trends')
        .select(`
          id,
          platform,
          title,
          url,
          thumbnail_url,
          creator_username,
          creator_metrics,
          metrics,
          engagement,
          created_at
        `)
        .eq('category', userNiche)
        .eq('content_type', 'video')
        .order('created_at', { ascending: false })
        .limit(6);

      if (trendsError) throw trendsError;

      const formattedTrends: TrendingVideo[] = (trendsData || []).map(trend => ({
        id: trend.id,
        platform: trend.platform,
        title: trend.title,
        thumbnailUrl: trend.thumbnail_url || 'https://images.unsplash.com/photo-1611162616475-46b635cb6868',
        videoUrl: trend.url || '#',
        creator: {
          username: trend.creator_username || 'anonymous',
          avatar: (trend.creator_metrics as any)?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
        },
        metrics: {
          views: (trend.metrics as any)?.views || 0,
          likes: (trend.metrics as any)?.likes || 0,
          comments: (trend.metrics as any)?.comments || 0,
          shares: (trend.metrics as any)?.shares || 0
        },
        timestamp: trend.created_at,
        viralityScore: calculateViralityScore({
          views: (trend.metrics as any)?.views || 0,
          likes: (trend.metrics as any)?.likes || 0,
          comments: (trend.metrics as any)?.comments || 0,
          shares: (trend.metrics as any)?.shares || 0
        }).value
      }));

      setTrendingVideos(formattedTrends);
    } catch (err) {
      console.error('Error fetching trending videos:', err);
    } finally {
      setLoadingTrends(false);
    }
  };

  const handleSearch = () => {
    navigate('/dashboard/explore', {
      state: {
        searchTerm,
        selectedCategory,
        selectedTimeframe
      }
    });
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Quick Search Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Search className="h-6 w-6 text-purple-500 mr-2" />
            <h2 className="text-xl font-semibold">Quick Content Search</h2>
          </div>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Calendar className="h-5 w-5" />
            <span>Schedule Post</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search keywords..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {timeframes.map(timeframe => (
                <option key={timeframe.value} value={timeframe.value}>
                  {timeframe.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <Search className="h-5 w-5 mr-2" />
            Search Content
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-gray-800 rounded-lg p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="bg-gray-700 p-2 sm:p-3 rounded-lg">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
                </div>
                <span className={`text-xs sm:text-sm font-medium ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mt-3 sm:mt-4">{stat.value}</h3>
              <p className="text-xs sm:text-sm text-gray-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Trend Performance</h2>
        <div className="h-60 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trending Videos */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <TrendingUp className="h-6 w-6 text-purple-500 mr-2" />
            Trending in Your Niche
          </h2>
          <Link
            to="/dashboard/explore"
            className="text-purple-400 hover:text-purple-300 flex items-center"
          >
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {loadingTrends ? (
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
        ) : trendingVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingVideos.map(video => {
              const virality = calculateViralityScore(video.metrics);
              return (
                <div key={video.id} className="bg-gray-700 rounded-lg overflow-hidden">
                  <div className="aspect-video relative group">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a
                        href={video.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
                      >
                        Watch Video
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className={`px-3 py-1 rounded-full flex items-center space-x-2 ${getViralityBadgeColor(virality.score)}`}>
                        {getViralityIcon(virality.score)}
                        <span className="text-sm font-medium">
                          {virality.score.charAt(0).toUpperCase() + virality.score.slice(1)} Virality
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <img
                        src={video.creator.avatar}
                        alt={video.creator.username}
                        className="h-6 w-6 rounded-full"
                      />
                      <span className="text-sm font-medium text-purple-400">
                        @{video.creator.username}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                      {video.title}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          <span>{formatNumber(video.metrics.likes)}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          <span>{formatNumber(video.metrics.comments)}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Share2 className="h-4 w-4 mr-1" />
                        <span>{formatNumber(video.metrics.shares)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400">No trending videos found</h3>
            <p className="text-gray-500 mt-2">
              Try exploring different categories or check back later
            </p>
          </div>
        )}
      </div>

      {/* Saved Content Preview */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center">
            <Bookmark className="h-5 w-5 text-purple-500 mr-2" />
            Recently Saved
          </h2>
          <Link
            to="/dashboard/saved"
            className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
          >
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {loadingSaved ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-700 rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-600" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-3/4" />
                  <div className="h-4 bg-gray-600 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : savedContent.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedContent.map(item => (
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
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                      Watch Content
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </div>
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
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bookmark className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400">No saved content yet</h3>
            <p className="text-gray-500 mt-2">
              Start saving content from the Explore page
            </p>
          </div>
        )}
      </div>

      {/* Schedule Post Modal */}
      <SchedulePostModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        platform={selectedPlatform}
      />
    </div>
  );
}
