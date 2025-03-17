import React from 'react';
import { X, Instagram, Youtube, Twitter, BookText as TikTok } from 'lucide-react';

interface PlatformSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (platform: 'instagram' | 'tiktok' | 'twitter' | 'youtube') => void;
}

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: Instagram },
  { id: 'tiktok', name: 'TikTok', icon: TikTok },
  { id: 'youtube', name: 'YouTube', icon: Youtube },
  { id: 'twitter', name: 'Twitter', icon: Twitter }
] as const;

export default function PlatformSelectModal({ isOpen, onClose, onSelect }: PlatformSelectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Select Platform</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 touch-manipulation"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {platforms.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                onSelect(id as typeof platforms[number]['id']);
                onClose();
              }}
              className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors flex flex-col items-center space-y-2 min-h-[80px] touch-manipulation"
            >
              <Icon className="h-8 w-8 text-purple-500" />
              <span className="text-sm font-medium">{name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
