import React, { useState, useEffect } from 'react';
import { 
  Pencil, 
  Wand2,
  RefreshCw,
  Copy,
  CheckCircle,
  Loader2,
  Play,
  Video,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { SavedContent } from '../types';

export default function Script() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState('');
  const [copied, setCopied] = useState(false);
  const [showVideoSelect, setShowVideoSelect] = useState(false);
  const [savedVideos, setSavedVideos] = useState<SavedContent[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<SavedContent | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedVideos();
    }
  }, [user]);

  const fetchSavedVideos = async () => {
    try {
      setLoadingSaved(true);
      const { data, error } = await supabase
        .from('saved_content')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedVideos(data || []);
    } catch (err) {
      console.error('Error fetching saved videos:', err);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleSelectVideo = (video: SavedContent) => {
    setSelectedVideo(video);
    setShowVideoSelect(false);
    // Pre-fill prompt with video information
    setPrompt(`Create a script similar to this video about ${video.content_data.caption}`);
  };

  const handleGenerateScript = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    // TODO: Implement script generation with AI
    // This is a placeholder response
    setTimeout(() => {
      setScript(`Here's a script based on ${selectedVideo ? 'the selected video' : 'your prompt'}:

🎥 Opening Shot:
[Energetic music fades in]
${selectedVideo ? `Similar to @${selectedVideo.content_data.username}'s style` : 'Close-up shot'}

👋 Introduction:
"Hey everyone! Today we're diving into something really exciting..."

🎯 Main Points:
1. First key point with example
2. Demonstration of concept
3. Real-world application

💡 Tips & Tricks:
- Pro tip #1
- Important reminder
- Key takeaway

🔚 Closing:
"If you found this helpful, don't forget to like and follow for more content!"

#trending #viral #content`);
      setLoading(false);
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearSelection = () => {
    setSelectedVideo(null);
    setPrompt('');
    setScript('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Script AI</h1>
          <p className="text-gray-400 mt-2">Generate engaging scripts for your content</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        {/* Video Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Reference Video (Optional)
          </label>
          {selectedVideo ? (
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="aspect-video w-24 relative rounded overflow-hidden">
                    <img
                      src={selectedVideo.content_data.thumbnailUrl}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white line-clamp-1">
                      @{selectedVideo.content_data.username}
                    </p>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                      {selectedVideo.content_data.caption}
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearSelection}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowVideoSelect(true)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-4 text-left hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <Video className="h-5 w-5 text-gray-400" />
              <span className="text-gray-400">Select a saved video as reference</span>
            </button>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            What would you like to create a script about?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Create a script for a 60-second TikTok video about productivity tips..."
            className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleGenerateScript}
            disabled={loading || !prompt.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                <span>Generate Script</span>
              </>
            )}
          </button>

          <button
            onClick={clearSelection}
            disabled={loading || (!prompt && !selectedVideo)}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        {script && (
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Generated Script</h3>
              <button
                onClick={handleCopy}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {copied ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-gray-300 font-mono text-sm">
              {script}
            </pre>
          </div>
        )}
      </div>

      {/* Video Selection Modal */}
      {showVideoSelect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full m-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Select a Video</h2>
              <button
                onClick={() => setShowVideoSelect(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingSaved ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
              </div>
            ) : savedVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                {savedVideos.map(video => (
                  <button
                    key={video.id}
                    onClick={() => handleSelectVideo(video)}
                    className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors text-left"
                  >
                    <div className="aspect-video relative rounded overflow-hidden mb-3">
                      <img
                        src={video.content_data.thumbnailUrl}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <p className="font-medium text-white mb-1">
                      @{video.content_data.username}
                    </p>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {video.content_data.caption}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Video className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400">No saved videos</h3>
                <p className="text-gray-500 mt-2">
                  Save some videos from the Hunter AI page first
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
