'use client';

import { useEffect, useState, useRef } from 'react';
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
import { toast } from 'sonner';
import { useAppDispatch, useQuizById } from '@/store/hooks';
import { fetchQuizById, submitQuizAttempt } from '@/store/globalSlice';

const QUESTIONS_PER_PAGE = 5;

export default function QuizPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  const dispatch = useAppDispatch();

  // Redux State
  const quiz = useQuizById(quizId);

  // Local State
  const [loading, setLoading] = useState(!quiz);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const hasInitializedRef = useRef(false);

  // Initialize Quiz
  useEffect(() => {
    if (quizId && !quiz && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      setLoading(true);
      dispatch(fetchQuizById(quizId))
        .unwrap()
        .then(() => {
          setLoading(false);
          startTimeRef.current = Date.now();
        })
        .catch((error) => {
          console.error(error);
          toast.error('Failed to load quiz');
          router.push('/quiz');
        });
    } else if (quiz) {
      setLoading(false);
      if (!hasInitializedRef.current) {
        startTimeRef.current = Date.now();
        hasInitializedRef.current = true;
      }
    }
  }, [quizId, quiz, dispatch, router]);

  // Timer Initialization
  useEffect(() => {
    if (quiz?.timeLimit && timeLeft === null) {
      setTimeLeft(quiz.timeLimit * 60); // Convert minutes to seconds
    }
  }, [quiz, timeLeft]);

  // Timer Countdown
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev && prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const handleAutoSubmit = () => {
    toast.warning("Time's up! Submitting your quiz...", { duration: 3000 });
    handleSubmitQuiz();
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

    // Only show confirmation if triggered manually (not auto-submit from timer)
    if (timeLeft !== 0 && answeredCount < quiz.questions.length && !showConfirmSubmit && !submitting) {
      // Logic for manual click when unanswered questions exist is handled by UI showing modal
      // This check is for safety
    }

    setSubmitting(true);
    try {
      // Calculate time taken in seconds
      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

      // Format answers according to backend validation schema
      const formattedAnswers = quiz.questions.map((q, index) => {
        let answer = answers[index];

        // Convert answer based on question type
        if (answer === undefined || answer === null) {
          answer = '';
        } else if (q.type === 'mcq' && typeof answer === 'number' && q.options) {
          // For MCQ, convert option index to actual option text
          answer = q.options[answer] || answer.toString();
        } else if (typeof answer === 'number') {
          answer = answer.toString();
        } else if (typeof answer === 'boolean') {
          answer = answer.toString();
        } else if (Array.isArray(answer)) {
          answer = answer.map(a => String(a));
        } else {
          answer = String(answer);
        }

        return {
          questionIndex: index,
          answer: answer,
        };
      });

      const result = await dispatch(submitQuizAttempt({
        quizId,
        answers: formattedAnswers,
        timeTaken
      })).unwrap();

      const attemptData = result.attempt || result;
      const resultId = attemptData?._id;
      const score = result.results?.score || attemptData?.score || 0;

      toast.success(`Quiz submitted! Score: ${score}%`);

      if (resultId) {
        router.push(`/quiz/${quizId}/results/${resultId}`);
      } else {
        router.push(`/quiz`);
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error?.message || 'Failed to submit quiz');
      setSubmitting(false); // Only define if error, otherwise we navigate away
    } finally {
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
      <div className="min-h-screen flex items-center justify-center bg-page-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-gradient">
        <Card className="p-8 text-center border-border shadow-lg bg-card/80 backdrop-blur">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Quiz not found</h2>
          <p className="text-muted-foreground mb-6">The quiz you're looking for doesn't exist or has been removed.</p>
          <Link href="/quiz">
            <Button className="bg-gradient-to-r from-green-600 to-teal-600 text-white">Back to Quizzes</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const currentPageQuestions = getCurrentPageQuestions();
  const totalPages = getTotalPages();
  const progress = (Object.keys(answers).length / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-page-gradient">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-50 shadow-sm backdrop-blur-sm bg-card/95 transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Link href="/quiz">
                <Button variant="ghost" size="sm" className="h-8 sm:h-9 hover:bg-muted">
                  <ChevronLeft className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Exit</span>
                </Button>
              </Link>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm sm:text-base lg:text-lg font-bold text-foreground truncate">{quiz.title}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate flex items-center gap-2">
                  <span>Page {currentPage + 1} of {totalPages}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/40"></span>
                  <span>{quiz.questions.length} Questions</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {timeLeft !== null && (
                <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg border shadow-sm transition-colors duration-300 ${timeLeft < 60
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                  : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                  }`}>
                  <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${timeLeft < 60 ? 'animate-pulse' : ''}`} />
                  <span className="font-mono font-bold text-xs sm:text-sm">{formatTime(timeLeft)}</span>
                </div>
              )}
              <Button
                onClick={() => {
                  const answeredCount = Object.keys(answers).length;
                  if (answeredCount < quiz.questions.length) {
                    setShowConfirmSubmit(true);
                  } else {
                    handleSubmitQuiz();
                  }
                }}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-xs sm:text-sm h-8 sm:h-9 flex-1 sm:flex-none shadow-md hover:shadow-lg transition-all"
              >
                <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Submit</span>
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 sm:mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Progress</span>
              <span className="font-medium text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-500 dark:to-teal-500 transition-all duration-300 ease-out"
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
              <Card key={globalIndex} id={`question-${globalIndex}`} className="shadow-sm hover:shadow-md transition-all duration-200 bg-card border-border/50">
                <CardHeader className="pb-3 sm:pb-4 border-b border-border/40 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-muted-foreground bg-background px-2 py-1 rounded-md border border-border">
                        Q{globalIndex + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-primary bg-primary/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                        {question.points} pts
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-base sm:text-lg leading-snug text-foreground mt-3 font-medium">
                    {question.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 pt-4 sm:pt-5">
                  {/* MCQ Options */}
                  {question.type === 'mcq' && question.options && (
                    <div className="space-y-2.5 sm:space-y-3">
                      {question.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerChange(globalIndex, index)}
                          className={`w-full p-3 sm:p-4 text-left rounded-lg border-2 transition-all duration-200 touch-manipulation group ${answers[globalIndex] === index
                            ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                            : 'border-muted hover:border-primary/50 hover:bg-accent'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${answers[globalIndex] === index
                              ? 'border-primary bg-primary scale-110'
                              : 'border-muted-foreground/30 group-hover:border-primary/50'
                              }`}>
                              {answers[globalIndex] === index && (
                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary-foreground animate-in zoom-in" />
                              )}
                            </div>
                            <span className={`text-sm sm:text-base transition-colors ${answers[globalIndex] === index ? 'font-medium text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                              }`}>{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* True/False */}
                  {question.type === 'true_false' && (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {['True', 'False'].map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerChange(globalIndex, index === 0)}
                          className={`w-full p-4 sm:p-6 text-center rounded-xl border-2 transition-all duration-200 touch-manipulation ${answers[globalIndex] === (index === 0)
                            ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                            : 'border-muted hover:border-primary/50 hover:bg-accent'
                            }`}
                        >
                          <span className={`text-lg font-medium ${answers[globalIndex] === (index === 0) ? 'text-primary' : 'text-muted-foreground'
                            }`}>{option}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Fill in the Blank */}
                  {question.type === 'fill_blank' && (
                    <div>
                      <input
                        type="text"
                        value={answers[globalIndex] || ''}
                        onChange={(e) => handleAnswerChange(globalIndex, e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full px-4 py-3 border-2 border-input rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none text-base transition-all bg-background text-foreground placeholder:text-muted-foreground/50"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6 p-4 bg-card rounded-xl border border-border shadow-sm sticky bottom-4 z-10 lg:static">
              <Button
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                variant="outline"
                className="w-28"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${i === currentPage ? 'bg-primary w-4' : 'bg-muted'
                      }`}
                  />
                ))}
              </div>

              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                variant="outline"
                className="w-28"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Question Navigator - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-24 shadow-md bg-card border-border/50">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  Question Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-5 gap-2 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1 custom-scrollbar">
                  {quiz.questions.map((_, index) => {
                    const pageIndex = Math.floor(index / QUESTIONS_PER_PAGE);
                    const isCurrentPage = pageIndex === currentPage && index >= currentPage * QUESTIONS_PER_PAGE && index < (currentPage + 1) * QUESTIONS_PER_PAGE;
                    const isAnswered = answers[index] !== undefined;

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
                        className={`w-full aspect-square rounded-lg font-medium text-xs transition-all relative overflow-hidden ${isCurrentPage
                          ? 'bg-gradient-to-br from-green-600 to-teal-600 text-white shadow-md scale-105 z-10'
                          : isAnswered
                            ? 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
                            : 'bg-muted text-muted-foreground hover:bg-accent border border-transparent'
                          }`}
                        title={`Question ${index + 1}`}
                      >
                        {index + 1}
                        {isAnswered && !isCurrentPage && (
                          <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-primary rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 pt-4 border-t border-border space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                      Total
                    </span>
                    <span className="font-semibold text-foreground">{quiz.questions.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      Answered
                    </span>
                    <span className="font-semibold text-primary">{getAnsweredCount()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                      Remaining
                    </span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">{quiz.questions.length - getAnsweredCount()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-3 sm:p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md mx-auto shadow-2xl bg-popover border-border animate-in zoom-in-95 duration-200">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <span>Submit Quiz?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <p className="text-base text-muted-foreground leading-relaxed">
                Are you sure you want to submit this quiz? You cannot change your answers after submission.
              </p>
              <div className="bg-muted/30 p-4 rounded-xl space-y-3 text-sm border border-border">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Questions:</span>
                  <span className="font-semibold text-foreground">{quiz.questions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Answered:</span>
                  <span className="font-semibold text-primary">{getAnsweredCount()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Unanswered:</span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    {quiz.questions.length - getAnsweredCount()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmSubmit(false)}
                  disabled={submitting}
                  className="flex-1 h-11 text-base"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 h-11 text-base font-medium shadow-md"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : 'Confirm Submit'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
