'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { postAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { Image, Video, Globe, Users, Lock, X } from 'lucide-react';

interface CreatePostProps {
  onPostCreated: (post: any) => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddImage = () => {
    if (imageUrlInput.trim()) {
      setImages([...images, imageUrlInput.trim()]);
      setImageUrlInput('');
      setShowImageInput(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // At least one of content, images, or video must be present
    if (!content.trim() && images.length === 0 && !videoUrl.trim()) {
      toast.error('Please add some content, image, or video to your post');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const postData: any = {
        visibility,
      };
      
      // Only add fields if they have values
      if (content.trim()) {
        postData.content = content.trim();
      }
      
      if (images.length > 0) {
        postData.images = images;
      }
      
      if (videoUrl.trim()) {
        postData.video = videoUrl.trim();
      }
      
      console.log('Creating post with data:', postData);
      
      const response = await postAPI.createPost(postData);

      console.log('Post created successfully:', response.data);
      onPostCreated(response.data.data);
      
      // Reset form
      setContent('');
      setImages([]);
      setVideoUrl('');
      setVisibility('public');
      setShowImageInput(false);
      setShowVideoInput(false);
    } catch (error: any) {
      console.error('Failed to create post:', error);
      console.error('Error response data:', error?.response?.data);
      console.error('🔴 Validation errorDetails:', error?.response?.data?.errorDetails);
      console.error('Error details:', {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
      });
      toast.error(error?.response?.data?.message || error?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border-0 p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4">
        {/* User Avatar */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.name || 'User'}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            (user?.name?.charAt(0) || 'U').toUpperCase()
          )}
        </div>

        {/* Text Input */}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white resize-none text-gray-900 placeholder-gray-400 transition-all duration-200"
            rows={3}
          />
        </div>
      </div>

      {/* Image URLs */}
      {images.length > 0 && (
        <div className="mt-4 space-y-2">
          {images.map((img, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-teal-50 p-3 rounded-xl border border-green-100">
              <img src={img} alt={`Preview ${idx + 1}`} className="w-16 h-16 object-cover rounded-lg shadow-md" />
              <span className="flex-1 text-sm text-gray-700 truncate font-medium">{img}</span>
              <button
                onClick={() => handleRemoveImage(idx)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Video URL */}
      {videoUrl && (
        <div className="mt-4 bg-gradient-to-r from-green-50 to-teal-50 p-3 rounded-xl flex items-center gap-3 border border-green-100">
          <Video className="w-5 h-5 text-teal-600" />
          <span className="flex-1 text-sm text-gray-700 truncate font-medium">{videoUrl}</span>
          <button onClick={() => setVideoUrl('')} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      {/* Image URL Input */}
      {showImageInput && (
        <div className="mt-4 flex items-center gap-2">
          <input
            type="url"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="Paste image URL..."
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white text-gray-900 placeholder-gray-400 transition-all duration-200"
            onKeyPress={(e) => e.key === 'Enter' && handleAddImage()}
          />
          <button
            onClick={handleAddImage}
            className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 font-semibold shadow-md transition-all duration-200 hover:scale-105"
          >
            Add
          </button>
          <button
            onClick={() => {
              setShowImageInput(false);
              setImageUrlInput('');
            }}
            className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Video URL Input */}
      {showVideoInput && (
        <div className="mt-4 flex items-center gap-2">
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Paste YouTube/Vimeo URL..."
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white text-gray-900 placeholder-gray-400 transition-all duration-200"
          />
          <button
            onClick={() => setShowVideoInput(false)}
            className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 font-semibold shadow-md transition-all duration-200 hover:scale-105"
          >
            Done
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Add Image Button */}
          <button
            onClick={() => setShowImageInput(!showImageInput)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-green-50 rounded-xl transition-all duration-200 border border-transparent hover:border-green-200"
            disabled={showVideoInput}
          >
            <Image className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">Photo</span>
          </button>

          {/* Add Video Button */}
          <button
            onClick={() => setShowVideoInput(!showVideoInput)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-red-50 rounded-xl transition-all duration-200 border border-transparent hover:border-red-200"
            disabled={showImageInput}
          >
            <Video className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium">Video</span>
          </button>

          {/* Visibility Selector */}
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as any)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium text-gray-700 cursor-pointer transition-all duration-200"
          >
            <option value="public">🌍 Public</option>
            <option value="friends">👥 Friends</option>
            <option value="private">🔒 Private</option>
          </select>
        </div>

        {/* Post Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || (!content.trim() && images.length === 0 && !videoUrl)}
          className="px-8 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-600 disabled:hover:to-teal-600 font-semibold shadow-md transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
}
