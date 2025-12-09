'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface QuizQuestion {
  question: string;
  type: 'mcq' | 'true-false';
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

export default function CreateQuizForLessonPage() {
  const { courseId, lessonId } = useParams();
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
    fetchData();
  }, [lessonId, courseId]);

  const fetchData = async () => {
    try {
      // Fetch lesson
      const lessonRes = await axios.get(`https://microlearnignbackend.vercel.app/api/v1/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const lessonData = lessonRes.data.data;
      setLesson(lessonData);

      // Fetch course
      const courseRes = await axios.get(`https://microlearnignbackend.vercel.app/api/v1/courses/${courseId || lessonData.course}`, {
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
      toast.error('Failed to load lesson', {
        description: error.response?.data?.message
      });
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
      toast.warning('Please add at least one question');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1}`, { description: 'Question text is required' });
        return;
      }
      if (!q.correctAnswer.trim()) {
        toast.error(`Question ${i + 1}`, { description: 'Correct answer is required' });
        return;
      }
      if (q.type === 'mcq' && q.options.some(opt => !opt.trim())) {
        toast.error(`Question ${i + 1}`, { description: 'All options must be filled' });
        return;
      }
    }

    try {
      setSaving(true);

      const payload = {
        ...quizData,
        course: courseId || lesson.course,
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

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/quiz/create`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Quiz created successfully!', {
        description: 'Redirecting to lessons page...'
      });
      setTimeout(() => router.push(`/instructor/courses/${courseId || lesson.course}/lessons`), 1000);
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz', {
        description: error.response?.data?.message
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-page-gradient">
        <div className="text-xl text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-gradient py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <button
            onClick={() => router.push(`/instructor/courses/${courseId || lesson?.course}/lessons`)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            ← Back to Course Lessons
          </button>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Create Quiz</h1>
          <p className="text-muted-foreground">Course: {course?.title}</p>
          <p className="text-muted-foreground">Lesson: {lesson?.title}</p>
          <div className="mt-2 bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded p-3 text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Students must score <strong>80% or higher</strong> to pass this quiz and unlock the next lesson.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quiz Details */}
          <div className="bg-card rounded-lg shadow p-6 border border-border">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Quiz Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Quiz Title</label>
                <input
                  type="text"
                  value={quizData.title}
                  onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Description</label>
                <textarea
                  value={quizData.description}
                  onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Passing Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quizData.passingScore}
                    onChange={(e) => setQuizData({ ...quizData, passingScore: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Time Limit (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={quizData.timeLimit}
                    onChange={(e) => setQuizData({ ...quizData, timeLimit: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-card rounded-lg shadow p-6 border border-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-foreground">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                + Add Question
              </button>
            </div>

            {questions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No questions added yet. Click "Add Question" to start.</p>
            ) : (
              <div className="space-y-6">
                {questions.map((question, qIndex) => (
                  <div key={qIndex} className="border border-border rounded p-4 bg-secondary/30">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-foreground">Question {qIndex + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">Question Type</label>
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                        >
                          <option value="mcq">Multiple Choice</option>
                          <option value="true-false">True/False</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">Question Text</label>
                        <textarea
                          value={question.question}
                          onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                          placeholder="Enter your question"
                          required
                        />
                      </div>

                      {question.type === 'mcq' && (
                        <div>
                          <label className="block text-sm font-medium mb-2 text-foreground">Options</label>
                          {question.options.map((option, oIndex) => (
                            <input
                              key={oIndex}
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 text-foreground"
                              placeholder={`Option ${oIndex + 1}`}
                              required
                            />
                          ))}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">Correct Answer</label>
                        {question.type === 'true-false' ? (
                          <select
                            value={question.correctAnswer}
                            onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
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
                            className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                            placeholder="Enter the correct answer exactly as it appears in options"
                            required
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">Explanation</label>
                        <textarea
                          value={question.explanation}
                          onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                          placeholder="Explain why this is the correct answer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">Points</label>
                        <input
                          type="number"
                          min="1"
                          value={question.points}
                          onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
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
              onClick={() => router.push('/instructor/lessons')}
              className="px-6 py-2 border border-border rounded hover:bg-secondary text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || questions.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
