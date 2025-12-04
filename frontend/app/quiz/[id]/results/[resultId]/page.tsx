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
    console.log('🔍 Redirect check - Passed:', result?.passed, '| Next Lesson:', nextLesson);
    
    if (result?.passed && nextLesson) {
      console.log('✅ Quiz passed! Setting 3-second timer for redirect to:', nextLesson.title);
      const timer = setTimeout(() => {
        console.log('🚀 Redirecting to next lesson:', `/lessons/${nextLesson._id}`);
        toast.success('Redirecting to next lesson...', { duration: 2000 });
        router.push(`/lessons/${nextLesson._id}`);
      }, 3000);

      return () => {
        console.log('⏹️ Cleaning up redirect timer');
        clearTimeout(timer);
      };
    } else if (result?.passed && !nextLesson) {
      console.log('🎉 Course completed! No more lessons.');
    } else if (!result?.passed) {
      console.log('❌ Quiz not passed. No redirect.');
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
        console.log('⚠️ No lesson attached to this quiz');
        return;
      }

      console.log('📚 Loading next lesson for:', result.quiz.lesson);
      const token = localStorage.getItem('token');
      
      // Get current lesson details
      const lessonResponse = await fetch(`http://localhost:5000/api/v1/lessons/${result.quiz.lesson}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!lessonResponse.ok) {
        console.log('❌ Failed to fetch current lesson');
        return;
      }
      
      const lessonData = await lessonResponse.json();
      const currentLesson = lessonData.data;
      console.log('📖 Current lesson:', currentLesson.title, '| Order:', currentLesson.order);
      
      if (!currentLesson.course) {
        console.log('⚠️ Current lesson has no course');
        return;
      }
      
      const courseId = typeof currentLesson.course === 'string' ? currentLesson.course : currentLesson.course._id;
      console.log('🎓 Course ID:', courseId, '| Looking for order:', (currentLesson.order || 0) + 1);
      
      // Get next lesson
      const nextResponse = await fetch(
        `http://localhost:5000/api/v1/lessons?course=${courseId}&order=${(currentLesson.order || 0) + 1}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (nextResponse.ok) {
        const nextData = await nextResponse.json();
        console.log('📦 Next lesson response:', nextData);
        if (nextData.data && nextData.data.length > 0) {
          console.log('✅ Found next lesson:', nextData.data[0].title);
          setNextLesson(nextData.data[0]);
        } else {
          console.log('🏁 No more lessons - course completed!');
        }
      } else {
        console.log('❌ Failed to fetch next lesson');
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
      }).catch(() => {});
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quiz Results</h1>
              <p className="text-gray-600 mt-1">{result.quiz.title}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard">
                <Button variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/quiz">
                <Button variant="outline">Back to Quizzes</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Result Card */}
        <Card className={`mb-8 ${result.passed ? 'bg-gradient-to-br from-green-50 to-blue-50' : 'bg-gradient-to-br from-red-50 to-orange-50'}`}>
          <CardContent className="p-8 text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
              result.passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {result.passed ? (
                <Trophy className="w-12 h-12 text-green-600" />
              ) : (
                <XCircle className="w-12 h-12 text-red-600" />
              )}
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {result.passed ? 'Congratulations! 🎉' : 'Keep Trying! 💪'}
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              {result.passed
                ? `You passed with a score of ${result.percentage}%`
                : `You scored ${result.percentage}%. Need ${result.quiz.passingScore}% to pass.`}
            </p>

            <div className="inline-block">
              <div className="text-6xl font-bold text-gray-900 mb-2">
                {result.percentage}%
              </div>
              <div className="text-sm text-gray-600">
                {result.score} out of {result.quiz.questions.length * 10} points
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Correct</p>
                  <p className="text-2xl font-bold text-green-600">{correctAnswers}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Incorrect</p>
                  <p className="text-2xl font-bold text-red-600">{incorrectAnswers}</p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Time Taken</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.floor(result.timeSpent / 60)}:{(result.timeSpent % 60).toString().padStart(2, '0')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Accuracy</p>
                  <p className="text-2xl font-bold text-gray-900">{result.percentage}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pass - Next Lesson Unlocked Message */}
        {result.passed && nextLesson && (
          <Card className="mb-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">🎉 Quiz Passed - Next Lesson Unlocked!</h3>
                  <p className="text-white/90 text-sm mb-3">
                    Congratulations! You scored {result.percentage}% and passed the quiz. You can now access:
                  </p>
                  <p className="font-semibold text-lg">{nextLesson.title}</p>
                </div>
                <Link href={`/lessons/${nextLesson._id}`}>
                  <Button className="bg-white text-green-600 hover:bg-gray-100 font-semibold">
                    Go to Next Lesson →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pass - No Next Lesson (Course Completed) */}
        {result.passed && !nextLesson && result.quiz.lesson && (
          <Card className="mb-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">🎉 Quiz Passed - Course Completed!</h3>
                  <p className="text-white/90 text-sm">
                    Congratulations! You scored {result.percentage}% and completed all lessons in this course!
                  </p>
                </div>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-white text-green-600 hover:bg-gray-100 font-semibold"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fail - Retry Message */}
        {!result.passed && (
          <Card className="mb-8 bg-gradient-to-r from-red-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">Quiz Not Passed - Try Again!</h3>
                  <p className="text-white/90 text-sm mb-2">
                    You scored {result.percentage}%, but need {result.quiz.passingScore}% to pass and unlock the next lesson.
                  </p>
                  <p className="text-white/90 text-sm font-semibold">
                    💡 Review the lesson content and retake the quiz to continue.
                  </p>
                </div>
                <Button 
                  onClick={handleRetake}
                  className="bg-white text-red-600 hover:bg-gray-100 font-semibold"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={handleRetake}
            className="w-full"
            variant="outline"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Quiz
          </Button>
          <Button
            onClick={() => setShowAnswers(!showAnswers)}
            className="w-full"
            variant="outline"
          >
            {showAnswers ? 'Hide' : 'Show'} Answers
          </Button>
          <Button
            onClick={handleShare}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Results
          </Button>
        </div>

        {/* Detailed Answers */}
        {showAnswers && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Detailed Results</h3>
            {result.quiz.questions.map((question: any, index: number) => {
              const userAnswer = result.answers[index];
              const isCorrect = userAnswer?.isCorrect;

              return (
                <Card key={index} className={isCorrect ? 'border-green-200' : 'border-red-200'}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg flex items-start gap-2">
                        <span className="text-gray-500">Q{index + 1}.</span>
                        <span>{question.question}</span>
                      </CardTitle>
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {question.type === 'mcq' && (
                      <div className="space-y-2">
                        {question.options.map((option: string, optIndex: number) => {
                          const isUserAnswer = userAnswer?.answer === optIndex;
                          const isCorrectAnswer = question.correctAnswer === optIndex;

                          return (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg border-2 ${
                                isCorrectAnswer
                                  ? 'border-green-500 bg-green-50'
                                  : isUserAnswer
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{option}</span>
                                {isCorrectAnswer && (
                                  <span className="text-xs font-medium text-green-700">Correct</span>
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <span className="text-xs font-medium text-red-700">Your answer</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {question.explanation && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
                        <p className="text-sm text-blue-800">{question.explanation}</p>
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
          <Card className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Tips to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Review the lessons related to this quiz topic</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Practice with flashcards to reinforce your knowledge</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Take your time reading each question carefully</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Try retaking the quiz after studying the explanations</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
