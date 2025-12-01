'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface QuizQuestion {
  question: string;
  type: 'mcq' | 'true-false';
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

export default function CreateQuizForCourseLessonPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  const lessonId = params?.lessonId as string;
  const router = useRouter();
  const { token } = useAuthStore();

  const [lesson, setLesson] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    passingScore: 80,
    timeLimit: 30,
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    if (courseId && lessonId) {
      fetchData();
    }
  }, [courseId, lessonId]);

  const fetchData = async () => {
    try {
      // Fetch lesson
      const lessonRes = await axios.get(`http://localhost:5000/api/v1/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const lessonData = lessonRes.data.data;
      setLesson(lessonData);

      // Fetch course
      const courseRes = await axios.get(`http://localhost:5000/api/v1/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourse(courseRes.data.data);
      
      // Set default quiz title and description
      setQuizData({
        ...quizData,
        title: `${lessonData.title} - Quiz`,
        description: `Test your knowledge on ${lessonData.title}`,
      });
    } catch (error: any) {
      console.error('Error fetching data:', error);
      alert(error.response?.data?.message || 'Failed to load data');
      router.push(`/instructor/courses/${courseId}/lessons`);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        type: 'mcq',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        points: 10,
      },
    ]);
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        alert(`Question ${i + 1}: Question text is required`);
        return;
      }
      if (!q.correctAnswer.trim()) {
        alert(`Question ${i + 1}: Correct answer is required`);
        return;
      }
      if (q.type === 'mcq' && q.options.some(opt => !opt.trim())) {
        alert(`Question ${i + 1}: All options must be filled`);
        return;
      }
      if (!q.explanation || q.explanation.trim().length < 10) {
        alert(`Question ${i + 1}: Explanation must be at least 10 characters`);
        return;
      }
    }

    const payload = {
      ...quizData,
      course: courseId,
      lesson: lessonId,
      topic: lesson.topic,
      difficulty: lesson.difficulty,
      questions: questions.map(q => ({
        type: q.type,
        question: q.question,
        options: q.type === 'mcq' ? q.options : undefined,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: q.points,
      })),
      isPublished: true,
    };

    try {
      setSaving(true);

      await axios.post('http://localhost:5000/api/v1/quizzes/create', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Quiz created successfully!');
      router.push(`/instructor/courses/${courseId}/lessons`);
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error validation details:', error.response?.data?.errorDetails);
      console.error('Payload sent:', payload);
      
      const errorMsg = error.response?.data?.errorDetails?.[0]?.message || 
                      error.response?.data?.message || 
                      'Failed to create quiz';
      alert(errorMsg);
    } finally {
      setSaving(false);
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
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => router.push(`/instructor/courses/${courseId}/lessons`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course Lessons
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Create Quiz</h1>
          <p className="text-gray-600">Course: {course?.title}</p>
          <p className="text-gray-600 mb-3">Lesson: {lesson?.title}</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            ⚠️ Students must score <strong>80% or higher</strong> to pass this quiz and unlock the next lesson.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quiz Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quiz Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quiz Title *</label>
                <input
                  type="text"
                  value={quizData.title}
                  onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  value={quizData.description}
                  onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Passing Score (%) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quizData.passingScore}
                    onChange={(e) => setQuizData({ ...quizData, passingScore: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: 80% (required to unlock next lesson)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Time Limit (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={quizData.timeLimit}
                    onChange={(e) => setQuizData({ ...quizData, timeLimit: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>

            {questions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No questions added yet. Click "Add Question" to start.</p>
            ) : (
              <div className="space-y-6">
                {questions.map((question, qIndex) => (
                  <div key={qIndex} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium">Question {qIndex + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Question Type</label>
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(qIndex, 'type', e.target.value as 'mcq' | 'true-false')}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="mcq">Multiple Choice</option>
                          <option value="true-false">True/False</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Question Text *</label>
                        <textarea
                          value={question.question}
                          onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your question"
                          required
                        />
                      </div>

                      {question.type === 'mcq' && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Options *</label>
                          {question.options.map((option, oIndex) => (
                            <input
                              key={oIndex}
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                              placeholder={`Option ${oIndex + 1}`}
                              required
                            />
                          ))}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium mb-1">Correct Answer *</label>
                        {question.type === 'true-false' ? (
                          <select
                            value={question.correctAnswer}
                            onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select...</option>
                            <option value="true">True</option>
                            <option value="false">False</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={question.correctAnswer}
                            onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter the correct answer exactly as it appears in options"
                            required
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Explanation *</label>
                        <textarea
                          value={question.explanation}
                          onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Explain why this is the correct answer (minimum 10 characters)"
                          required
                          minLength={10}
                        />
                        <p className="text-xs text-gray-500 mt-1">Minimum 10 characters required</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Points</label>
                        <input
                          type="number"
                          min="1"
                          value={question.points}
                          onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => router.push(`/instructor/courses/${courseId}/lessons`)}
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || questions.length === 0}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
