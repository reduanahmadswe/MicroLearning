'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, Plus, Edit, Trash2, FileQuestion, Lock, Unlock } from 'lucide-react';

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
      
      console.log('Fetching course:', courseId);
      // Fetch course
      const courseRes = await axios.get(`http://localhost:5000/api/v1/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Course response:', courseRes.data);
      setCourse(courseRes.data.data || courseRes.data);

      // Fetch lessons for this course
      const lessonsRes = await axios.get(`http://localhost:5000/api/v1/lessons?course=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Lessons API response:', lessonsRes.data);
      const lessonsList = lessonsRes.data.data || lessonsRes.data || [];
      
      // Check if each lesson has a quiz
      const lessonsWithQuizStatus = await Promise.all(
        lessonsList.map(async (lesson: Lesson) => {
          try {
            const quizRes = await axios.get(
              `http://localhost:5000/api/v1/quizzes?lesson=${lesson._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return {
              ...lesson,
              hasQuiz: quizRes.data.data?.length > 0,
            };
          } catch (error) {
            return { ...lesson, hasQuiz: false };
          }
        })
      );

      setLessons(lessonsWithQuizStatus.sort((a, b) => a.order - b.order));
    } catch (error: any) {
      console.error('Error fetching data:', error);
      console.error('Error response:', error.response?.data);
      console.error('Status:', error.response?.status);
      alert(error.response?.data?.message || 'Failed to load course lessons. Please restart the backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson? This will also delete any associated quizzes.')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/v1/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Lesson deleted successfully');
      fetchCourseAndLessons();
    } catch (error: any) {
      console.error('Error deleting lesson:', error);
      alert(error.response?.data?.message || 'Failed to delete lesson');
    }
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
              <div>
                <h1 className="text-3xl font-bold mb-2">{course?.title}</h1>
                <p className="text-gray-600">{course?.description}</p>
                <div className="mt-4 flex gap-4 text-sm">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    {lessons.length} Lessons
                  </span>
                  <span className={`px-3 py-1 rounded-full ${
                    course?.isPremium 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {course?.isPremium ? `Paid - ৳${course.price}` : 'Free Course'}
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
              <p className="text-gray-500 mb-4">No lessons created yet</p>
              <button
                onClick={() => router.push(`/instructor/courses/${courseId}/lessons/create`)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
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
