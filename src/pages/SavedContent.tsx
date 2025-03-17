import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Bookmark,
  TrendingUp,
  TrendingDown,
  Minus,
  Trash2,
  ExternalLink,
  Heart,
  MessageCircle,
  Share2,
  Loader2
} from 'lucide-react';
import type { SavedContent } from '../types';

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

export default function SavedContent() {
  const { user } = useAuth();
  const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viralityFilter, setViralityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    if (user) {
      fetchSavedContent();
    }
  }, [user]);

  const fetchSavedContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_content')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedContent(data || []);
    } catch (error) {
      console.error('Error fetching saved content:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Saved Content</h1>
          <p className="text-gray-400 mt-2">Review and manage your saved content</p>
        </div>
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

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-700" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredContent.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map(item => {
            const virality = calculateViralityScore(item.content_data.metrics);
            return (
              <div key={item.id} className="bg-gray-800 rounded-lg overflow-hidden">
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
  );
}
