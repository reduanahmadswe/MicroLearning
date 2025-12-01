'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, BookOpen, Save } from 'lucide-react';
import { toast } from 'sonner';

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
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading lesson...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/instructor/courses/${lesson?.course}/lessons`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Lessons
          </button>

          <div className="flex items-center gap-3">
            <div className="bg-blue-500 text-white p-3 rounded-lg">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Edit Lesson</h1>
              <p className="text-gray-600">Update lesson content and details</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Lesson Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lessonData.title}
                onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Introduction to Variables"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Short Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lessonData.description}
                onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the lesson"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Lesson Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={lessonData.content}
                onChange={(e) => setLessonData({ ...lessonData, content: e.target.value })}
                rows={12}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write the full lesson content here..."
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                You can use Markdown formatting for better presentation
              </p>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lessonData.topic}
                onChange={(e) => setLessonData({ ...lessonData, topic: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Variables, Functions, Arrays"
                required
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Difficulty Level <span className="text-red-500">*</span>
              </label>
              <select
                value={lessonData.difficulty}
                onChange={(e) => setLessonData({ ...lessonData, difficulty: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Estimated Time */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Estimated Time (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={lessonData.estimatedTime}
                onChange={(e) => setLessonData({ ...lessonData, estimatedTime: parseInt(e.target.value) || 10 })}
                min="5"
                max="120"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Lesson Order <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={lessonData.order}
                onChange={(e) => setLessonData({ ...lessonData, order: parseInt(e.target.value) || 1 })}
                min="1"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Order determines the sequence in which lessons are unlocked
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Changing the lesson order may affect how students progress through the course.
                The first lesson is always unlocked, while others require passing the previous quiz.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 font-medium"
              >
                <Save size={20} />
                {saving ? 'Updating...' : 'Update Lesson'}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/instructor/courses/${lesson?.course}/lessons`)}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-medium"
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
