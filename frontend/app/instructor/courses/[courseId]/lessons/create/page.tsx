'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from '@/components/ui/rich-text-editor';

export default function CreateLessonForCoursePage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { token } = useAuthStore();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    content: '',
    topic: '',
    tags: '',
    difficulty: 'beginner',
    estimatedTime: 10,
    thumbnailUrl: '',
    videoUrl: '',
  });

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/v1/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourse(res.data.data);
    } catch (error: any) {
      console.error('Error fetching course:', error);
      toast.error(error.response?.data?.message || 'Failed to load course');
      router.push('/instructor/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lessonData.title || !lessonData.description || !lessonData.content || !lessonData.topic) {
      toast.warning('Please fill in all required fields (title, description, content, topic)');
      return;
    }

    if (lessonData.content.length < 50) {
      toast.warning('Content must be at least 50 characters');
      return;
    }

    if (lessonData.description.length < 10) {
      toast.warning('Description must be at least 10 characters');
      return;
    }

    const payload = {
      ...lessonData,
      course: courseId,
      estimatedTime: Number(lessonData.estimatedTime),
      tags: lessonData.tags.split(',').map(t => t.trim()).filter(t => t),
    };

    try {
      setSubmitting(true);

      const res = await axios.post(
        'http://localhost:5000/api/v1/lessons/create',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const createdLesson = res.data.data;
      
      toast.success('Lesson created successfully!', {
        description: 'Would you like to create a quiz for this lesson?',
        action: {
          label: 'Create Quiz',
          onClick: () => router.push(`/instructor/courses/${courseId}/lessons/${createdLesson._id}/quiz/create`)
        },
        cancel: {
          label: 'View Lessons',
          onClick: () => router.push(`/instructor/courses/${courseId}/lessons`)
        },
        duration: 5000,
      });
      
      // Auto redirect after 5 seconds if no action
      setTimeout(() => {
        router.push(`/instructor/courses/${courseId}/lessons`);
      }, 5000);
    } catch (error: any) {
      console.error('Error creating lesson:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error details:', error.response?.data?.errorDetails);
      console.error('Payload sent:', payload);
      
      const errorMsg = error.response?.data?.errorDetails?.[0]?.message || 
                      error.response?.data?.message || 
                      'Failed to create lesson';
      toast.error('Failed to create lesson', {
        description: errorMsg
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading course...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/instructor/courses/${courseId}/lessons`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Course Lessons
          </button>
          
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="text-blue-500" size={32} />
              <div>
                <p className="text-sm text-gray-500">Creating lesson for:</p>
                <h1 className="text-2xl font-bold">{course?.title}</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold mb-4">Create New Lesson</h2>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lessonData.title}
                onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Introduction to Variables"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {lessonData.title.length}/200 characters (minimum 3)
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={lessonData.description}
                onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of what students will learn"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {lessonData.description.length}/1000 characters (minimum 10 required)
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Content <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={lessonData.content}
                onChange={(value) => setLessonData({ ...lessonData, content: value })}
                placeholder="Write your lesson content with rich formatting..."
              />
              <p className="text-xs text-gray-500 mt-2">
                Use the toolbar to format your lesson with headings, bold, italic, lists, links, and images
              </p>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lessonData.topic}
                onChange={(e) => setLessonData({ ...lessonData, topic: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., JavaScript Fundamentals"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Main topic or category for this lesson</p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={lessonData.tags}
                onChange={(e) => setLessonData({ ...lessonData, tags: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., javascript, variables, programming"
              />
            </div>

            {/* Row: Difficulty & Estimated Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty <span className="text-red-500">*</span>
                </label>
                <select
                  value={lessonData.difficulty}
                  onChange={(e) => setLessonData({ ...lessonData, difficulty: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Time (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={lessonData.estimatedTime}
                  onChange={(e) => setLessonData({ ...lessonData, estimatedTime: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">1-60 minutes</p>
              </div>
            </div>

            {/* Thumbnail URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail URL (optional)
              </label>
              <input
                type="url"
                value={lessonData.thumbnailUrl}
                onChange={(e) => setLessonData({ ...lessonData, thumbnailUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL (optional)
              </label>
              <input
                type="url"
                value={lessonData.videoUrl}
                onChange={(e) => setLessonData({ ...lessonData, videoUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex items-center justify-between border-t">
            <button
              type="button"
              onClick={() => router.push(`/instructor/courses/${courseId}/lessons`)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
