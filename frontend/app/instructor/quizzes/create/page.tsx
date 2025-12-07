'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  Plus,
  X,
  Save,
  ArrowLeft,
  BookOpen,
  FileText,
  Clock,
  Target,
  HelpCircle,
  Trash2,
  AlertCircle,
  Award,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  _id: string;
  title: string;
  thumbnail?: string;
}

interface Lesson {
  _id: string;
  title: string;
  course: string;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export default function CreateQuizPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  // Quiz Type Selection
  const [quizType, setQuizType] = useState<'course' | 'lesson'>('course');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    lesson: '', // Optional for course-level quizzes
    passingScore: 80,
    timeLimit: 30,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    },
  ]);

  useEffect(() => {
    if (!user || user.role !== 'instructor') {
      router.push('/');
      return;
    }
    fetchCourses();
  }, [user, router]);

  useEffect(() => {
    if (formData.course && quizType === 'lesson') {
      fetchLessons(formData.course);
    } else {
      setLessons([]);
      setFormData(prev => ({ ...prev, lesson: '' }));
    }
  }, [formData.course, quizType]);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/instructor/my-courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast.error('Failed to load courses');
    }
  };

  const fetchLessons = async (courseId: string) => {
    try {
      setLoadingLessons(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lessons?course=${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setLessons(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
      toast.error('Failed to load lessons');
    } finally {
      setLoadingLessons(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length === 1) {
      toast.error('Quiz must have at least one question');
      return;
    }
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(
      questions.map(q =>
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map(q =>
        q.id === questionId
          ? { ...q, options: q.options.map((opt, idx) => (idx === optionIndex ? value : opt)) }
          : q
      )
    );
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a quiz title');
      return false;
    }
    if (!formData.course) {
      toast.error('Please select a course');
      return false;
    }
    if (quizType === 'lesson' && !formData.lesson) {
      toast.error('Please select a lesson for lesson-based quiz');
      return false;
    }
    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1} is empty`);
        return false;
      }
      const filledOptions = q.options.filter(opt => opt.trim());
      if (filledOptions.length < 2) {
        toast.error(`Question ${i + 1} must have at least 2 options`);
        return false;
      }
      if (!q.options[q.correctAnswer]?.trim()) {
        toast.error(`Question ${i + 1} has invalid correct answer`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (publish: boolean = false) => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Map difficulty to backend format
      const difficultyMap: Record<string, string> = {
        easy: 'beginner',
        medium: 'intermediate',
        hard: 'advanced',
      };

      const quizData = {
        title: formData.title,
        description: formData.description,
        course: formData.course,
        ...(quizType === 'lesson' && formData.lesson ? { lesson: formData.lesson } : {}), // Only include lesson if selected
        topic: formData.title, // Use title as topic
        passingScore: formData.passingScore,
        timeLimit: formData.timeLimit,
        difficulty: difficultyMap[formData.difficulty] || 'intermediate',
        questions: questions.map(q => ({
          type: 'mcq', // Default to multiple choice
          question: q.question,
          options: q.options.filter(opt => opt.trim()),
          correctAnswer: q.correctAnswer.toString(),
          explanation: q.explanation && q.explanation.trim().length >= 10 
            ? q.explanation 
            : 'No explanation provided for this question.',
        })),
        isPublished: publish,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create quiz');
      }

      toast.success(publish ? 'Quiz created and published!' : 'Quiz saved as draft');
      router.push('/instructor/quizzes');
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      toast.error(error.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-green-50 px-3 py-2 rounded-lg mb-4 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back to Quizzes
          </button>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Quiz</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Build engaging quizzes for your students</p>
            </div>
          </div>
        </div>

        {/* Quiz Type Selection */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-green-100 mb-4 sm:mb-6">
          <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-3">
            Quiz Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setQuizType('course')}
              className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                quizType === 'course'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <Award className={`w-5 h-5 sm:w-6 sm:h-6 mt-1 flex-shrink-0 ${quizType === 'course' ? 'text-green-600' : 'text-gray-400'}`} />
                <div className="text-left">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">Course-Level Quiz (Quiz Arena)</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Create a quiz for the entire course. Students can access it from Quiz Arena.
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setQuizType('lesson')}
              className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                quizType === 'lesson'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <BookOpen className={`w-5 h-5 sm:w-6 sm:h-6 mt-1 flex-shrink-0 ${quizType === 'lesson' ? 'text-green-600' : 'text-gray-400'}`} />
                <div className="text-left">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">Lesson-Based Quiz</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Create a quiz tied to a specific lesson. Students take it after the lesson.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-green-100 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            Basic Information
          </h2>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-900 mb-2">
                Quiz Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white text-gray-900 text-sm sm:text-base border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="e.g., JavaScript Basics Quiz"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-900 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white text-gray-900 text-sm sm:text-base border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="Brief description of the quiz..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-900 mb-2">
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.course}
                  onChange={e => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white text-gray-900 text-sm sm:text-base border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {quizType === 'lesson' && (
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-900 mb-2">
                    Lesson <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.lesson}
                    onChange={e => setFormData({ ...formData, lesson: e.target.value })}
                    disabled={!formData.course || loadingLessons}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white text-gray-900 text-sm sm:text-base border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {loadingLessons ? 'Loading lessons...' : 'Select a lesson'}
                    </option>
                    {lessons.map(lesson => (
                      <option key={lesson._id} value={lesson._id}>
                        {lesson.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-900 mb-2 flex items-center gap-1">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingScore}
                  onChange={e => setFormData({ ...formData, passingScore: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white text-gray-900 text-sm sm:text-base border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-900 mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.timeLimit}
                  onChange={e => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white text-gray-900 text-sm sm:text-base border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder="0 = No limit"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-900 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white text-gray-900 text-sm sm:text-base border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-green-100 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              Questions ({questions.length})
            </h2>
            <button
              onClick={addQuestion}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {questions.map((question, qIndex) => (
              <div key={question.id} className="border-2 border-green-100 rounded-lg p-4 sm:p-6 bg-green-50/30">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900">Question {qIndex + 1}</h3>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(question.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-900 mb-2">
                      Question Text <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={question.question}
                      onChange={e => updateQuestion(question.id, 'question', e.target.value)}
                      rows={2}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white text-gray-900 text-sm sm:text-base border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      placeholder="Enter your question..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-900 mb-2">
                      Options <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2 sm:gap-3">
                          <input
                            type="radio"
                            checked={question.correctAnswer === optIndex}
                            onChange={() => updateQuestion(question.id, 'correctAnswer', optIndex)}
                            className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 focus:ring-green-500 flex-shrink-0"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={e => updateOption(question.id, optIndex, e.target.value)}
                            className="flex-1 px-3 sm:px-4 py-2 bg-white text-gray-900 text-sm sm:text-base border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            placeholder={`Option ${optIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2">
                      Select the radio button for the correct answer
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-900 mb-2">
                      Explanation (Optional)
                    </label>
                    <textarea
                      value={question.explanation}
                      onChange={e => updateQuestion(question.id, 'explanation', e.target.value)}
                      rows={2}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white text-gray-900 text-sm sm:text-base border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      placeholder="Explain why this is the correct answer..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-green-100">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
            <button
              onClick={() => router.back()}
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border-2 border-green-200 text-gray-700 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              {loading ? 'Creating...' : 'Create & Publish'}
            </button>
          </div>
        </div>

        {/* Info Alert */}
        <div className="mt-4 sm:mt-6 bg-green-50 border-2 border-green-200 rounded-lg p-3 sm:p-4">
          <div className="flex gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-green-800">
              <p className="font-semibold mb-1">
                {quizType === 'course' ? 'Course-Level Quiz (Quiz Arena)' : 'Lesson-Based Quiz'}
              </p>
              <p>
                {quizType === 'course'
                  ? 'This quiz will be available in Quiz Arena for all enrolled students in the selected course.'
                  : 'This quiz will be attached to the selected lesson and students can take it after completing the lesson.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
