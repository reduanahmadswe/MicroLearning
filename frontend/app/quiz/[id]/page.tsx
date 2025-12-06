'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Brain,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { quizAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { Quiz, Question } from '@/types';

const QUESTIONS_PER_PAGE = 5;

export default function QuizPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    if (quizId) {
      loadQuiz();
      setStartTime(Date.now()); // Track when quiz started
    }
  }, [quizId]);

  useEffect(() => {
    if (quiz?.timeLimit && timeLeft === null) {
      setTimeLeft(quiz.timeLimit * 60); // Convert minutes to seconds
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev && prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getQuiz(quizId);
      setQuiz(response.data.data);
    } catch (error: any) {
      toast.error('Failed to load quiz');
      console.error(error);
      router.push('/quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: any) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  const getTotalPages = () => {
    if (!quiz) return 0;
    return Math.ceil(quiz.questions.length / QUESTIONS_PER_PAGE);
  };

  const getCurrentPageQuestions = () => {
    if (!quiz) return [];
    const startIndex = currentPage * QUESTIONS_PER_PAGE;
    const endIndex = startIndex + QUESTIONS_PER_PAGE;
    return quiz.questions.slice(startIndex, endIndex).map((q, idx) => ({
      question: q,
      globalIndex: startIndex + idx,
    }));
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < getTotalPages() - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    const answeredCount = Object.keys(answers).length;
    if (answeredCount < quiz.questions.length) {
      const unanswered = quiz.questions.length - answeredCount;
      if (!confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      // Calculate time taken in seconds
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);

      // Format answers according to backend validation schema
      const formattedAnswers = quiz.questions.map((q, index) => {
        let answer = answers[index];
        
        // Convert answer based on question type
        if (answer === undefined || answer === null) {
          answer = '';
        } else if (q.type === 'mcq' && typeof answer === 'number') {
          // For MCQ, convert option index to actual option text
          answer = q.options[answer] || answer.toString();
          console.log(`Q${index + 1}: Selected option index ${answers[index]} → "${answer}"`);
        } else if (typeof answer === 'number') {
          // For other types, convert to string
          answer = answer.toString();
        } else if (typeof answer === 'boolean') {
          // For true/false, convert to string
          answer = answer.toString();
        } else if (Array.isArray(answer)) {
          // Keep array as is (for multi-select)
          answer = answer.map(a => String(a));
        } else {
          // Ensure it's a string
          answer = String(answer);
        }
        
        return {
          questionIndex: index,
          answer: answer,
        };
      });

      // Use the correct endpoint
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          quizId: quizId,
          answers: formattedAnswers,
          timeTaken: timeTaken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Submission error details:', errorData);
        console.error('Sent data:', { quizId, answers: formattedAnswers, timeTaken });
        throw new Error(errorData.message || 'Failed to submit quiz');
      }

      const result = await response.json();
      console.log('Quiz submission successful:', result);
      console.log('📊 Full result structure:', JSON.stringify(result, null, 2));
      
      // Extract data from response
      const attemptData = result.data?.attempt;
      const resultId = attemptData?._id;
      const score = result.data?.results?.score || attemptData?.score || 0;
      const passed = result.data?.results?.passed || attemptData?.passed || false;
      
      console.log('📊 Attempt ID:', resultId);
      console.log('🎯 Score:', score, '%');
      console.log('✅ Passed:', passed);
      
      toast.success(`Quiz submitted! Score: ${score}%`);
      
      // Navigate to results page
      if (resultId) {
        console.log('🔄 Redirecting to results page:', `/quiz/${quizId}/results/${resultId}`);
        router.push(`/quiz/${quizId}/results/${resultId}`);
      } else {
        console.error('❌ No result ID found in response:', result);
        toast.error('Failed to get quiz results');
        router.push(`/quiz`);
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => Object.keys(answers).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz not found</h2>
          <Link href="/quiz">
            <Button>Back to Quizzes</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const currentPageQuestions = getCurrentPageQuestions();
  const totalPages = getTotalPages();
  const progress = (Object.keys(answers).length / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Link href="/quiz">
                <Button variant="ghost" size="sm" className="h-8 sm:h-9">
                  <ChevronLeft className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Exit</span>
                </Button>
              </Link>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 truncate">{quiz.title}</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  Page {currentPage + 1} of {totalPages} • {quiz.questions.length} Questions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {timeLeft !== null && (
                <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg ${
                  timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="font-mono font-bold text-xs sm:text-sm">{formatTime(timeLeft)}</span>
                </div>
              )}
              <Button
                onClick={() => setShowConfirmSubmit(true)}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-xs sm:text-sm h-8 sm:h-9 flex-1 sm:flex-none"
              >
                <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Submit</span>
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 sm:mt-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
              <span>Progress</span>
              <span className="font-medium text-green-600">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-600 to-teal-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Questions List */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {currentPageQuestions.map(({ question, globalIndex }) => (
              <Card key={globalIndex} id={`question-${globalIndex}`} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs sm:text-sm font-semibold text-gray-500">
                          Question {globalIndex + 1}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-green-700 bg-green-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                          {question.points} pts
                        </span>
                      </div>
                      <CardTitle className="text-base sm:text-lg leading-snug">
                        {question.question}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 pt-0">
                  {/* MCQ Options */}
                  {question.type === 'mcq' && question.options && (
                    <div className="space-y-2.5 sm:space-y-3">
                      {question.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerChange(globalIndex, index)}
                          className={`w-full p-3 sm:p-4 text-left rounded-lg border-2 transition-all touch-manipulation ${
                            answers[globalIndex] === index
                              ? 'border-green-600 bg-green-50 shadow-sm'
                              : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              answers[globalIndex] === index
                                ? 'border-green-600 bg-green-600'
                                : 'border-gray-300'
                            }`}>
                              {answers[globalIndex] === index && (
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="font-medium text-gray-900 text-sm sm:text-base">{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* True/False */}
                  {question.type === 'true-false' && (
                    <div className="space-y-2.5 sm:space-y-3">
                      {['True', 'False'].map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerChange(globalIndex, index === 0)}
                          className={`w-full p-3 sm:p-4 text-left rounded-lg border-2 transition-all touch-manipulation ${
                            answers[globalIndex] === (index === 0)
                              ? 'border-green-600 bg-green-50 shadow-sm'
                              : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              answers[globalIndex] === (index === 0)
                                ? 'border-green-600 bg-green-600'
                                : 'border-gray-300'
                            }`}>
                              {answers[globalIndex] === (index === 0) && (
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="font-medium text-gray-900 text-sm sm:text-base">{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Fill in the Blank */}
                  {question.type === 'fill-blank' && (
                    <div>
                      <input
                        type="text"
                        value={answers[globalIndex] || ''}
                        onChange={(e) => handleAnswerChange(globalIndex, e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 focus:outline-none text-sm sm:text-base transition-all"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 sm:mt-6 p-3 sm:p-4 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
              <Button
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                variant="outline"
                className="h-9 sm:h-10 text-xs sm:text-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>
              
              <div className="text-xs sm:text-sm font-medium text-gray-600">
                <span className="hidden sm:inline">Page </span>{currentPage + 1} / {totalPages}
              </div>
              
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                variant="outline"
                className="h-9 sm:h-10 text-xs sm:text-sm"
              >
                <span className="sm:hidden">Next</span>
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:ml-1" />
              </Button>
            </div>
          </div>

          {/* Question Navigator - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-24 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900">Question Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto pr-1">
                  {quiz.questions.map((_, index) => {
                    const pageIndex = Math.floor(index / QUESTIONS_PER_PAGE);
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentPage(pageIndex);
                          setTimeout(() => {
                            const element = document.getElementById(`question-${index}`);
                            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 100);
                        }}
                        className={`w-full aspect-square rounded-lg font-medium text-xs transition-all ${
                          pageIndex === currentPage && index >= currentPage * QUESTIONS_PER_PAGE && index < (currentPage + 1) * QUESTIONS_PER_PAGE
                            ? 'bg-gradient-to-br from-green-600 to-teal-600 text-white ring-2 ring-green-300 shadow-md'
                            : answers[index] !== undefined
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title={`Question ${index + 1}`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-semibold text-gray-900">{quiz.questions.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Answered:</span>
                    <span className="font-semibold text-green-600">{getAnsweredCount()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Remaining:</span>
                    <span className="font-semibold text-orange-600">{quiz.questions.length - getAnsweredCount()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <Card className="w-full max-w-md mx-auto shadow-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <span>Submit Quiz?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Are you sure you want to submit this quiz? You won't be able to change your answers after submission.
              </p>
              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-3.5 sm:p-4 rounded-lg space-y-2 text-sm border border-green-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total Questions:</span>
                  <span className="font-semibold text-gray-900">{quiz.questions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Answered:</span>
                  <span className="font-semibold text-green-600">{getAnsweredCount()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Unanswered:</span>
                  <span className="font-semibold text-orange-600">
                    {quiz.questions.length - getAnsweredCount()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmSubmit(false)}
                  disabled={submitting}
                  className="flex-1 h-10 sm:h-11 text-sm sm:text-base"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 h-10 sm:h-11 text-sm sm:text-base font-medium"
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
