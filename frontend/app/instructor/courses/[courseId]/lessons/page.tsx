'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, Plus, Edit, Trash2, FileQuestion, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';

interface Lesson {
  _id: string;
  title: string;
  description: string;
  estimatedTime: number;
  difficulty: string;
  order: number;
  hasQuiz?: boolean;
}

export default function CourseLessonsPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { token } = useAuthStore();

  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseAndLessons();
  }, [courseId]);

  const fetchCourseAndLessons = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Fetching course:', courseId);
      console.log('🔑 Token:', token ? 'Present' : 'Missing');
      
      // Fetch course
      const courseRes = await axios.get(`http://localhost:5000/api/v1/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('✅ Course response:', courseRes.data);
      setCourse(courseRes.data.data || courseRes.data);

      // Fetch lessons for this course
      console.log('🔍 Fetching lessons with URL:', `http://localhost:5000/api/v1/lessons?course=${courseId}`);
      const lessonsRes = await axios.get(`http://localhost:5000/api/v1/lessons?course=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('✅ Lessons API full response:', lessonsRes);
      console.log('📦 Lessons data:', lessonsRes.data);
      console.log('📦 Lessons data.data:', lessonsRes.data?.data);
      console.log('📦 Type of data.data:', Array.isArray(lessonsRes.data?.data) ? 'Array' : typeof lessonsRes.data?.data);
      
      // Handle different response structures
      let lessonsList = [];
      if (lessonsRes.data?.data?.lessons) {
        console.log('📚 Using data.data.lessons path');
        lessonsList = lessonsRes.data.data.lessons;
      } else if (Array.isArray(lessonsRes.data?.data)) {
        console.log('📚 Using data.data array path');
        lessonsList = lessonsRes.data.data;
      } else if (Array.isArray(lessonsRes.data)) {
        console.log('📚 Using data array path');
        lessonsList = lessonsRes.data;
      }
      
      console.log('✅ Final parsed lessons list:', lessonsList);
      console.log('📊 Lessons count:', lessonsList.length);
      
      // Check if each lesson has a quiz
      const lessonsWithQuizStatus = await Promise.all(
        lessonsList.map(async (lesson: Lesson) => {
          try {
            console.log(`🔍 Checking quiz for lesson ${lesson._id}:`, lesson.title);
            const quizRes = await axios.get(
              `http://localhost:5000/api/v1/quizzes?lesson=${lesson._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(`📊 Quiz response for ${lesson.title}:`, quizRes.data);
            
            // Check both data and data.data for quizzes array
            const quizzes = Array.isArray(quizRes.data.data) 
              ? quizRes.data.data 
              : (Array.isArray(quizRes.data) ? quizRes.data : []);
            
            const hasQuiz = quizzes.length > 0;
            console.log(`✅ Lesson "${lesson.title}" has quiz:`, hasQuiz, '| Quiz count:', quizzes.length);
            
            return {
              ...lesson,
              hasQuiz: hasQuiz,
            };
          } catch (error) {
            console.error(`❌ Error checking quiz for lesson ${lesson.title}:`, error);
            return { ...lesson, hasQuiz: false };
          }
        })
      );

      setLessons(lessonsWithQuizStatus.sort((a, b) => a.order - b.order));
    } catch (error: any) {
      console.error('Error fetching data:', error);
      console.error('Error response:', error.response?.data);
      console.error('Status:', error.response?.status);
      toast.error('Failed to load course lessons', {
        description: error.response?.data?.message || 'Please restart the backend server.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    toast.promise(
      axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      {
        loading: 'Deleting lesson...',
        success: () => {
          fetchCourseAndLessons();
          return 'Lesson deleted successfully';
        },
        error: (error: any) => {
          console.error('Error deleting lesson:', error);
          return error.response?.data?.message || 'Failed to delete lesson';
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/instructor/courses')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to My Courses
          </button>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{course?.title}</h1>
                <p className="text-gray-600 mb-4">{course?.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium">
                    📚 {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}
                  </span>
                  <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-medium">
                    ✅ {lessons.filter(l => l.hasQuiz).length} with Quiz
                  </span>
                  <span className={`px-4 py-2 rounded-full font-medium ${
                    course?.isPremium 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {course?.isPremium ? `💰 ৳${course.price}` : '🆓 Free'}
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-medium capitalize">
                    📊 {course?.difficulty}
                  </span>
                </div>
              </div>
              <button
                onClick={() => router.push(`/instructor/courses/${courseId}/lessons/create`)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={20} />
                Add Lesson
              </button>
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Course Lessons</h2>
            <p className="text-sm text-gray-600 mt-1">
              Lessons are unlocked sequentially. Students must pass each quiz (80%+) to unlock the next lesson.
            </p>
          </div>

          {lessons.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No lessons yet</h3>
              <p className="text-gray-500 mb-6">Start building your course by adding your first lesson</p>
              <button
                onClick={() => router.push(`/instructor/courses/${courseId}/lessons/create`)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Create First Lesson
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {lessons.map((lesson, index) => (
                <div key={lesson._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Order Number */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                      {lesson.order || index + 1}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{lesson.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">{lesson.description}</p>
                          
                          <div className="flex items-center gap-3 text-sm">
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              {lesson.difficulty}
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              {lesson.estimatedTime} min
                            </span>
                            {lesson.order === 1 ? (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                                <Unlock size={14} />
                                Always Unlocked
                              </span>
                            ) : (
                              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded flex items-center gap-1">
                                <Lock size={14} />
                                Requires Previous Quiz
                              </span>
                            )}
                            {lesson.hasQuiz ? (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                                <FileQuestion size={14} />
                                Quiz Created
                              </span>
                            ) : (
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded flex items-center gap-1">
                                <FileQuestion size={14} />
                                No Quiz
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {!lesson.hasQuiz && (
                            <button
                              onClick={() => router.push(`/instructor/courses/${courseId}/lessons/${lesson._id}/quiz/create`)}
                              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm flex items-center gap-2"
                              title="Create Quiz"
                            >
                              <FileQuestion size={16} />
                              Create Quiz
                            </button>
                          )}
                          <button
                            onClick={() => router.push(`/instructor/lessons/${lesson._id}/edit`)}
                            className="text-gray-600 hover:text-blue-600 p-2"
                            title="Edit Lesson"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson._id)}
                            className="text-gray-600 hover:text-red-600 p-2"
                            title="Delete Lesson"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Lesson Workflow</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Create lessons in the order you want students to learn</li>
            <li>Create a quiz for each lesson (minimum 80% passing score required)</li>
            <li>First lesson is always unlocked for enrolled students</li>
            <li>Students must pass each quiz to unlock the next lesson</li>
            <li>After completing all lessons, students receive a certificate</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
