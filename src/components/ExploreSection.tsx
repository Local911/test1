import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Share2, Heart, MessageCircle, Bookmark, Loader2, TrendingDown, Minus, BookmarkPlus } from 'lucide-react';
import { InstagramService } from '../services/instagram/InstagramService';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';

interface ExploreResult {
  id: string;
  shortcode: string;
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
  timestamp: string;
}

interface SavedContent {
  id: string;
  content_id: string;
  user_id: string;
  content_data: ExploreResult;
  created_at: string;
}

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

const ITEMS_PER_PAGE = 6;

function calculateViralityScore(metrics: ExploreResult['metrics'] | undefined): {
  score: 'high' | 'medium' | 'low';
  value: number;
} {
  // Return default score if metrics are undefined
  if (!metrics || !metrics.views) {
    return { score: 'low', value: 0 };
  }

  // Ensure all metrics have default values
  const {
    shares = 0,
    saves = 0,
    comments = 0,
    likes = 0,
    views = 1 // Prevent division by zero
  } = metrics;

  // Calculate a weighted score based on engagement metrics
  const weightedScore = 
    (shares * 2) + // Shares have highest weight
    (saves * 1.5) + // Saves have second highest weight
    (comments * 1) + // Comments have medium weight
    (likes * 0.5); // Likes have lowest weight

  // Normalize the score based on views
  const normalizedScore = (weightedScore / views) * 100;

  // Determine virality level
  if (normalizedScore > 15) {
    return { score: 'high', value: normalizedScore };
  } else if (normalizedScore > 8) {
    return { score: 'medium', value: normalizedScore };
  } else {
    return { score: 'low', value: normalizedScore };
  }
}

export default function ExploreSection() {
  const { user } = useAuth();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('comedy');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [results, setResults] = useState<ExploreResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [savedContent, setSavedContent] = useState<Set<string>>(new Set());
  const [savingContent, setSavingContent] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Check if we have search parameters from the dashboard
    if (location.state) {
      const { searchTerm: initialSearchTerm, selectedCategory: initialCategory, selectedTimeframe: initialTimeframe } = location.state;
      
      if (initialSearchTerm) setSearchTerm(initialSearchTerm);
      if (initialCategory) setSelectedCategory(initialCategory);
      if (initialTimeframe) setSelectedTimeframe(initialTimeframe);
      
      // Trigger search with the initial parameters
      handleSearch(true);
    } else if (selectedCategory) {
      handleSearch(true);
    }
    fetchSavedContent();
  }, [location.state, selectedCategory, selectedTimeframe]);

  const fetchSavedContent = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_content')
        .select('content_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedContent(new Set(data.map(item => item.content_id)));
    } catch (err) {
      console.error('Error fetching saved content:', err);
    }
  };

  const handleSearch = async (reset: boolean = false) => {
    if (!selectedCategory && !searchTerm) {
      setError('Please enter a search term or select a category');
      return;
    }

    if (reset) {
      setPage(1);
      setHasMore(true);
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    setError(null);

    try {
      const instagramService = InstagramService.getInstance();
      const reels = await instagramService.fetchTrendingReels(
        selectedCategory || searchTerm,
        selectedTimeframe
      );

      const startIndex = reset ? 0 : (page - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newReels = reels.slice(startIndex, endIndex);

      setResults(prevResults => reset ? newReels : [...prevResults, ...newReels]);
      setHasMore(endIndex < reels.length);
      if (!reset) setPage(prev => prev + 1);
    } catch (err) {
      setError('Failed to fetch trending content. Please try again.');
      console.error('Error fetching trends:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSaveContent = async (content: ExploreResult) => {
    if (!user) return;

    try {
      setSavingContent(prev => new Set(prev).add(content.id));

      if (savedContent.has(content.id)) {
        // Unsave content
        const { error } = await supabase
          .from('saved_content')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', content.id);

        if (error) throw error;

        setSavedContent(prev => {
          const newSet = new Set(prev);
          newSet.delete(content.id);
          return newSet;
        });
      } else {
        // Save content
        const { error } = await supabase
          .from('saved_content')
          .insert({
            user_id: user.id,
            content_id: content.id,
            content_data: content,
            platform: 'instagram'
          });

        if (error) throw error;

        setSavedContent(prev => new Set(prev).add(content.id));
      }
    } catch (err) {
      console.error('Error saving content:', err);
    } finally {
      setSavingContent(prev => {
        const newSet = new Set(prev);
        newSet.delete(content.id);
        return newSet;
      });
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
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
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <TrendingUp className="h-6 w-6 text-purple-500 mr-2" />
        Explore Trending Content
      </h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(true)}
              placeholder="Search by keyword or topic..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="sm:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:w-48">
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
          onClick={() => handleSearch(true)}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Searching...
            </>
          ) : (
            'Search'
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-700 rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-600" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-600 rounded w-3/4" />
                <div className="h-4 bg-gray-600 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : results.length > 0 ? (
          results.map(result => {
            const virality = calculateViralityScore(result.metrics);
            const isSaved = savedContent.has(result.id);
            const isSaving = savingContent.has(result.id);

            return (
              <div key={result.id} className="bg-gray-700 rounded-lg overflow-hidden">
                <div className="aspect-video relative group">
                  <img
                    src={result.thumbnailUrl}
                    alt={result.caption}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a
                      href={result.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                    >
                      Watch Reel
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
                    onClick={() => handleSaveContent(result)}
                    disabled={isSaving}
                    className="absolute top-2 left-2 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-colors"
                  >
                    {isSaving ? (
                      <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                    ) : (
                      <BookmarkPlus className={`h-5 w-5 ${isSaved ? 'text-purple-500' : 'text-white'}`} />
                    )}
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <img
                      src={result.userAvatar}
                      alt={result.username}
                      className="h-6 w-6 rounded-full"
                    />
                    <span className="text-sm font-medium text-purple-400">@{result.username}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">{result.caption}</p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        <span>{formatNumber(result.metrics.likes)}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span>{formatNumber(result.metrics.comments)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Share2 className="h-4 w-4 mr-1" />
                        <span>{formatNumber(result.metrics.shares)}</span>
                      </div>
                      <div className="flex items-center">
                        <Bookmark className="h-4 w-4 mr-1" />
                        <span>{formatNumber(result.metrics.saves)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400">No results found</h3>
            <p className="text-gray-500 mt-2">Try different keywords or categories</p>
          </div>
        )}
      </div>

      {hasMore && !loading && (
        <div className="mt-8 text-center">
          <button
            onClick={() => handleSearch(false)}
            disabled={loadingMore}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading more...</span>
              </>
            ) : (
              <>
                <span>Load More</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
