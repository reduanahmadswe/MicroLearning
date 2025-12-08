'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, BookOpen, Save } from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from '@/components/ui/rich-text-editor';

export default function EditLessonPage() {
  const { lessonId } = useParams();
  const router = useRouter();
  const { token } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lesson, setLesson] = useState<any>(null);
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    content: '',
    topic: '',
    difficulty: 'beginner',
    estimatedTime: 10,
    order: 1,
  });

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/v1/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const lessonData = res.data.data;
      setLesson(lessonData);
      setLessonData({
        title: lessonData.title,
        description: lessonData.description,
        content: lessonData.content,
        topic: lessonData.topic,
        difficulty: lessonData.difficulty,
        estimatedTime: lessonData.estimatedTime,
        order: lessonData.order,
      });
    } catch (error: any) {
      console.error('Error fetching lesson:', error);
      toast.error('Failed to load lesson', {
        description: error.response?.data?.message
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lessonData.title || !lessonData.content || !lessonData.topic) {
      toast.warning('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);

      await axios.put(
        `http://localhost:5000/api/v1/lessons/${lessonId}`,
        lessonData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success('Lesson updated successfully!', {
        description: 'Redirecting back...'
      });
      
      setTimeout(() => {
        router.push(`/instructor/courses/${lesson.course}/lessons`);
      }, 1000);
    } catch (error: any) {
      console.error('Error updating lesson:', error);
      const errorMsg = error.response?.data?.errorDetails?.[0]?.message || 
                      error.response?.data?.message || 
                      'Failed to update lesson';
      toast.error('Failed to update lesson', {
        description: errorMsg
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading lesson...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/instructor/courses/${lesson?.course}/lessons`)}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Lessons
          </button>

          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-green-600 to-teal-600 text-white p-4 rounded-2xl shadow-lg">
              <BookOpen size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Lesson</h1>
              <p className="text-gray-600">Update lesson content and details</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border-2 border-green-100 p-8">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lesson Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lessonData.title}
                onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="e.g., Introduction to Variables"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Short Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lessonData.description}
                onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Brief description of the lesson"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lessonData.topic}
                onChange={(e) => setLessonData({ ...lessonData, topic: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="e.g., Variables, Functions, Arrays"
                required
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Difficulty Level <span className="text-red-500">*</span>
              </label>
              <select
                value={lessonData.difficulty}
                onChange={(e) => setLessonData({ ...lessonData, difficulty: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Estimated Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estimated Time (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={lessonData.estimatedTime}
                onChange={(e) => setLessonData({ ...lessonData, estimatedTime: parseInt(e.target.value) || 10 })}
                min="5"
                max="120"
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lesson Order <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={lessonData.order}
                onChange={(e) => setLessonData({ ...lessonData, order: parseInt(e.target.value) || 1 })}
                min="1"
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Order determines the sequence in which lessons are unlocked
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-800">
                <strong className="font-semibold">💡 Note:</strong> Changing the lesson order may affect how students progress through the course.
                The first lesson is always unlocked, while others require passing the previous quiz.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 flex items-center gap-2 font-semibold shadow-lg transition-all"
              >
                <Save size={20} />
                {saving ? 'Updating...' : 'Update Lesson'}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/instructor/courses/${lesson?.course}/lessons`)}
                className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-50 font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
