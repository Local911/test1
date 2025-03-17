import React, { useState, useCallback, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Clock, X, Loader2, Image as ImageIcon, Video, Link, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SchedulePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: 'instagram' | 'tiktok' | 'twitter' | 'youtube';
}

export default function SchedulePostModal({ isOpen, onClose, platform }: SchedulePostModalProps) {
  const { user } = useAuth();
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout>();

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const resetForm = useCallback(() => {
    setScheduledDate(null);
    setCaption('');
    setMedia(null);
    setMediaPreview('');
    setError(null);
    setSuccess(false);
    setIsDragging(false);
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  }, []);

  const handleClose = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    onClose();
    resetForm();
  }, [onClose, resetForm]);

  const validateFile = (file: File): boolean => {
    // Validate file size (max 50MB)
    if (file.size > 52428800) {
      setError('File size must be less than 50MB');
      return false;
    }

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Only image and video files are allowed');
      return false;
    }

    return true;
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) return;

    setMedia(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set dragging to false if we're leaving the dropzone
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!validateFile(file)) return;

    setMedia(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      if (!scheduledDate) {
        throw new Error('Please select a date and time');
      }

      if (!caption.trim()) {
        throw new Error('Please enter a caption');
      }

      // Validate scheduled time is in the future
      if (scheduledDate <= new Date()) {
        throw new Error('Scheduled time must be in the future');
      }

      // Upload media if present
      let mediaUrl = '';
      if (media) {
        const fileExt = media.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('scheduled-posts')
          .upload(filePath, media, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('scheduled-posts')
            .getPublicUrl(data.path);
          mediaUrl = publicUrl;
        }
      }

      // Save scheduled post to database
      const { error: dbError } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: user.id,
          platform,
          scheduled_time: scheduledDate.toISOString(),
          caption,
          media_url: mediaUrl || null,
          status: 'pending'
        });

      if (dbError) throw dbError;

      setSuccess(true);
      
      // Wait for 2 seconds to show success message before closing
      closeTimeoutRef.current = setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error('Error scheduling post:', err);
      setError(err instanceof Error ? err.message : 'Failed to schedule post');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 max-w-lg w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Calendar className="h-5 w-5 text-purple-500 mr-2" />
            Schedule Post
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors p-2 touch-manipulation"
            aria-label="Close modal"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-500 bg-opacity-10 border border-green-500 rounded-lg text-green-500">
            Post scheduled successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Schedule Date & Time
            </label>
            <DatePicker
              selected={scheduledDate}
              onChange={(date) => setScheduledDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
              placeholderText="Select date and time"
              popperProps={{
                strategy: "fixed"
              }}
              popperClassName="react-datepicker-popper"
              calendarClassName="bg-gray-800 border border-gray-700"
              dayClassName={() => "text-white hover:bg-purple-500"}
              monthClassName={() => "text-white"}
              timeClassName={() => "text-white"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 resize-none"
              placeholder="Write your caption..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Media (Optional)
            </label>
            <div 
              ref={dropZoneRef}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative ${isDragging ? 'border-purple-500' : 'border-gray-600'} border-2 border-dashed rounded-lg transition-colors`}
            >
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaChange}
                className="hidden"
                id="media-upload"
              />
              <label 
                htmlFor="media-upload"
                className="flex flex-col items-center justify-center p-6 sm:p-8 cursor-pointer min-h-[120px]"
              >
                {mediaPreview ? (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="h-40 w-full object-cover rounded"
                  />
                ) : (
                  <>
                    <div className="bg-gray-700 p-4 rounded-full mb-4">
                      <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                    </div>
                    <p className="text-gray-400 text-center mb-2">
                      Drag and drop your media here, or tap to select
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports images and videos up to 50MB
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[44px] touch-manipulation"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2 flex-shrink-0" />
                Scheduling...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2 flex-shrink-0" />
                Schedule Post
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
