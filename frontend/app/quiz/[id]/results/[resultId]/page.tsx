'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
  Share2,
  Home,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { quizAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { QuizResult } from '@/types';

export default function QuizResultsPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  const resultId = params.resultId as string;

  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  const [nextLesson, setNextLesson] = useState<any>(null);

  useEffect(() => {
    if (resultId) {
      loadResult();
    }
  }, [resultId]);

  useEffect(() => {
    if (result?.passed && result.quiz.lesson) {
      loadNextLesson();
    }
  }, [result]);

  // Auto redirect to next lesson after 3 seconds if passed
  useEffect(() => {

    if (result?.passed && nextLesson) {
      const timer = setTimeout(() => {
        toast.success('Redirecting to next lesson...', { duration: 2000 });
        router.push(`/lessons/${nextLesson._id}`);
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    } else if (result?.passed && !nextLesson) {
    } else if (!result?.passed) {
    }
  }, [result, nextLesson, router]);

  const loadResult = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getQuizResult(resultId);
      setResult(response.data.data);
    } catch (error: any) {
      toast.error('Failed to load results');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadNextLesson = async () => {
    try {
      if (!result?.quiz.lesson) {
        return;
      }

      const token = localStorage.getItem('token');

      // Get current lesson details
      const lessonResponse = await fetch(`https://microlearning-backend-reduan.onrender.com/api/v1/lessons/${result.quiz.lesson}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!lessonResponse.ok) {
        return;
      }

      const lessonData = await lessonResponse.json();
      const currentLesson = lessonData.data;

      if (!currentLesson.course) {
        return;
      }

      const courseId = typeof currentLesson.course === 'string' ? currentLesson.course : currentLesson.course._id;

      // Get next lesson
      const nextResponse = await fetch(
        `https://microlearning-backend-reduan.onrender.com/api/v1/lessons?course=${courseId}&order=${(currentLesson.order || 0) + 1}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (nextResponse.ok) {
        const nextData = await nextResponse.json();
        if (nextData.data && nextData.data.length > 0) {
          setNextLesson(nextData.data[0]);
        } else {
        }
      } else {
      }
    } catch (error) {
      console.error('❌ Error loading next lesson:', error);
    }
  };

  const handleShare = () => {
    if (!result) return;

    const text = `I scored ${result.percentage}% on "${result.quiz.title}" quiz! 🎉`;

    if (navigator.share) {
      navigator.share({
        title: 'Quiz Results',
        text: text,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(text + '\n' + window.location.href);
      toast.success('Results copied to clipboard!');
    }
  };

  const handleRetake = () => {
    router.push(`/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Results not found</h2>
          <Link href="/quiz">
            <Button>Back to Quizzes</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const correctAnswers = result.answers.filter((a: any) => a.isCorrect).length;
  const incorrectAnswers = result.answers.length - correctAnswers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Quiz Results</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">{result.quiz.title}</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link href="/dashboard" className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full h-9 sm:h-10 text-xs sm:text-sm">
                  <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <Link href="/quiz" className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full h-9 sm:h-10 text-xs sm:text-sm">Back to Quizzes</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Result Card */}
        <Card className={`mb-4 sm:mb-6 lg:mb-8 shadow-lg ${result.passed ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50' : 'bg-gradient-to-br from-red-50 via-orange-50 to-pink-50'}`}>
          <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mb-3 sm:mb-4 shadow-md ${result.passed ? 'bg-gradient-to-br from-green-100 to-teal-100' : 'bg-gradient-to-br from-red-100 to-orange-100'
              }`}>
              {result.passed ? (
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-red-600" />
              )}
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {result.passed ? 'Congratulations! 🎉' : 'Keep Trying! 💪'}
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 sm:mb-6 px-2">
              {result.passed
                ? `You passed with a score of ${result.percentage}%`
                : `You scored ${result.percentage}%. Need ${result.quiz.passingScore}% to pass.`}
            </p>

            <div className="inline-block">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2">
                {result.percentage}%
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                {result.score} out of {result.quiz.questions.length * 10} points
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Correct</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{correctAnswers}</p>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Incorrect</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{incorrectAnswers}</p>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Time Taken</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {Math.floor(result.timeSpent / 60)}:{(result.timeSpent % 60).toString().padStart(2, '0')}
                  </p>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Accuracy</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{result.percentage}%</p>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pass - Next Lesson Unlocked Message */}
        {result.passed && nextLesson && (
          <Card className="mb-4 sm:mb-6 lg:mb-8 bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg">
            <CardContent className="p-4 sm:p-5 lg:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1">🎉 Quiz Passed - Next Lesson Unlocked!</h3>
                  <p className="text-white/90 text-xs sm:text-sm mb-2 sm:mb-3">
                    Congratulations! You scored {result.percentage}% and passed the quiz. You can now access:
                  </p>
                  <p className="font-semibold text-sm sm:text-base lg:text-lg">{nextLesson.title}</p>
                </div>
                <Link href={`/lessons/${nextLesson._id}`} className="w-full sm:w-auto">
                  <Button className="bg-white text-green-600 hover:bg-gray-100 font-semibold w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm">
                    Go to Next Lesson →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pass - No Next Lesson (Course Completed) */}
        {result.passed && !nextLesson && result.quiz.lesson && (
          <Card className="mb-4 sm:mb-6 lg:mb-8 bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg">
            <CardContent className="p-4 sm:p-5 lg:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1">🎉 Quiz Passed - Course Completed!</h3>
                  <p className="text-white/90 text-xs sm:text-sm">
                    Congratulations! You scored {result.percentage}% and completed all lessons in this course!
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-white text-green-600 hover:bg-gray-100 font-semibold w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fail - Retry Message */}
        {!result.passed && (
          <Card className="mb-4 sm:mb-6 lg:mb-8 bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg">
            <CardContent className="p-4 sm:p-5 lg:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1">Quiz Not Passed - Try Again!</h3>
                  <p className="text-white/90 text-xs sm:text-sm mb-2">
                    You scored {result.percentage}%, but need {result.quiz.passingScore}% to pass and unlock the next lesson.
                  </p>
                  <p className="text-white/90 text-xs sm:text-sm font-semibold">
                    💡 Review the lesson content and retake the quiz to continue.
                  </p>
                </div>
                <Button
                  onClick={handleRetake}
                  className="bg-white text-red-600 hover:bg-gray-100 font-semibold w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <Button
            onClick={handleRetake}
            className="w-full h-10 sm:h-11 text-sm sm:text-base"
            variant="outline"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
            Retake Quiz
          </Button>
          <Button
            onClick={() => setShowAnswers(!showAnswers)}
            className="w-full h-10 sm:h-11 text-sm sm:text-base"
            variant="outline"
          >
            {showAnswers ? 'Hide' : 'Show'} Answers
          </Button>
          <Button
            onClick={handleShare}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 h-10 sm:h-11 text-sm sm:text-base font-medium"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
            Share Results
          </Button>
        </div>

        {/* Detailed Answers */}
        {showAnswers && (
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Detailed Results</h3>
            {result.quiz.questions.map((question: any, index: number) => {
              const userAnswer = result.answers[index];
              const isCorrect = userAnswer?.isCorrect;

              return (
                <Card key={index} className={`shadow-sm ${isCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm sm:text-base lg:text-lg flex items-start gap-1.5 sm:gap-2">
                        <span className="text-gray-500 flex-shrink-0">Q{index + 1}.</span>
                        <span className="leading-snug">{question.question}</span>
                      </CardTitle>
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2.5 sm:space-y-3 pt-0">
                    {question.type === 'mcq' && (
                      <div className="space-y-2">
                        {question.options.map((option: string, optIndex: number) => {
                          const isUserAnswer = userAnswer?.answer === optIndex;
                          const isCorrectAnswer = question.correctAnswer === optIndex;

                          return (
                            <div
                              key={optIndex}
                              className={`p-2.5 sm:p-3 rounded-lg border-2 ${isCorrectAnswer
                                ? 'border-green-500 bg-green-50 shadow-sm'
                                : isUserAnswer
                                  ? 'border-red-500 bg-red-50 shadow-sm'
                                  : 'border-gray-200'
                                }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs sm:text-sm text-gray-900">{option}</span>
                                {isCorrectAnswer && (
                                  <span className="text-xs font-medium text-green-700 flex-shrink-0">Correct</span>
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <span className="text-xs font-medium text-red-700 flex-shrink-0">Your answer</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {question.explanation && (
                      <div className="bg-gradient-to-br from-teal-50 to-green-50 p-3 sm:p-4 rounded-lg border border-teal-100">
                        <p className="text-xs sm:text-sm font-semibold text-teal-900 mb-1">Explanation:</p>
                        <p className="text-xs sm:text-sm text-teal-800 leading-relaxed">{question.explanation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Performance Tips */}
        {!result.passed && (
          <Card className="mt-4 sm:mt-6 lg:mt-8 bg-gradient-to-br from-teal-50 via-green-50 to-emerald-50 shadow-md border-teal-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                Tips to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                  <span className="leading-relaxed">Review the lessons related to this quiz topic</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                  <span className="leading-relaxed">Practice with flashcards to reinforce your knowledge</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                  <span className="leading-relaxed">Take your time reading each question carefully</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                  <span className="leading-relaxed">Try retaking the quiz after studying the explanations</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
