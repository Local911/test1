import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { format, parseISO } from 'date-fns';
import { 
  Calendar,
  Clock,
  Trash2,
  Instagram,
  Youtube,
  Twitter,
  BookText as TikTok,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  Clock4
} from 'lucide-react';
import type { ScheduledPost } from '../types';
import SchedulePostModal from '../components/SchedulePostModal';
import PlatformSelectModal from '../components/PlatformSelectModal';

const platformIcons = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  tiktok: TikTok
};

const statusColors = {
  pending: 'text-yellow-500 bg-yellow-500 bg-opacity-10 border-yellow-500',
  published: 'text-green-500 bg-green-500 bg-opacity-10 border-green-500',
  failed: 'text-red-500 bg-red-500 bg-opacity-10 border-red-500'
};

const statusIcons = {
  pending: Clock4,
  published: CheckCircle,
  failed: XCircle
};

export default function Scheduler() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'tiktok' | 'twitter' | 'youtube'>('instagram');
  const [filter, setFilter] = useState<'all' | 'pending' | 'published' | 'failed'>('all');

  useEffect(() => {
    if (user) {
      fetchScheduledPosts();

      // Subscribe to changes
      const subscription = supabase
        .channel('scheduled_posts_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'scheduled_posts',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchScheduledPosts();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchScheduledPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user?.id)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setPosts(prev => prev.filter(post => post.id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handlePlatformSelect = (platform: typeof selectedPlatform) => {
    setSelectedPlatform(platform);
    setShowScheduleModal(true);
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Post Scheduler</h1>
          <p className="text-gray-400 mt-2">Schedule and manage your social media content</p>
        </div>
        <button
          onClick={() => setShowPlatformModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Schedule Post</span>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {(['all', 'pending', 'published', 'failed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => {
            const PlatformIcon = platformIcons[post.platform as keyof typeof platformIcons];
            const StatusIcon = statusIcons[post.status as keyof typeof statusIcons];
            
            return (
              <div key={post.id} className="bg-gray-800 rounded-lg overflow-hidden">
                {post.media_url && (
                  <div className="aspect-video relative">
                    <img
                      src={post.media_url}
                      alt="Post media"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="bg-gray-700 p-2 rounded-lg">
                        <PlatformIcon className="h-5 w-5 text-purple-500" />
                      </div>
                      <span className="text-sm font-medium">
                        {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                      </span>
                    </div>
                    <div className={`px-3 py-1 rounded-full border flex items-center space-x-1 ${statusColors[post.status as keyof typeof statusColors]}`}>
                      <StatusIcon className="h-4 w-4" />
                      <span className="text-sm capitalize">{post.status}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                    {post.caption}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{format(parseISO(post.scheduled_time), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{format(parseISO(post.scheduled_time), 'h:mm a')}</span>
                    </div>
                  </div>

                  {post.status === 'pending' && (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400">No scheduled posts</h3>
          <p className="text-gray-500 mt-2">
            Start scheduling your social media content
          </p>
        </div>
      )}

      {/* Platform Selection Modal */}
      <PlatformSelectModal
        isOpen={showPlatformModal}
        onClose={() => setShowPlatformModal(false)}
        onSelect={handlePlatformSelect}
      />

      {/* Schedule Post Modal */}
      <SchedulePostModal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          fetchScheduledPosts(); // Refresh posts after scheduling
        }}
        platform={selectedPlatform}
      />
    </div>
  );
}
