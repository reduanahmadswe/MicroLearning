'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  GraduationCap,
  Clock,
  BookOpen,
  Users,
  Star,
  CheckCircle,
  Lock,
  Play,
  Award,
  DollarSign,
  BarChart,
  Target,
  Zap,
  TrendingUp,
  FileText,
  Video,
  Download,
  Share2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { coursesAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { Course } from '@/types';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor'>('overview');
  const [lessonUnlockStatus, setLessonUnlockStatus] = useState<Record<string, boolean>>({});
  const [quizResults, setQuizResults] = useState<Record<string, any>>({});

  useEffect(() => {
    if (courseId) {
      loadCourse();
      checkEnrollment();
    }
  }, [courseId]);

  // Refresh enrollment when coming back from lesson completion
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('refresh') === 'true' && courseId) {
      // Remove refresh param from URL
      window.history.replaceState({}, '', `/courses/${courseId}`);
      // Reload everything with fresh data
      setTimeout(async () => {
        await loadCourseWithLessons();
      }, 500);
    }
  }, [courseId]);

  useEffect(() => {
    // Re-check lesson unlock status when enrollment changes
    if (enrollment && course?.lessons) {
      checkLessonUnlockStatus(course.lessons, enrollment);
    }
  }, [enrollment, course]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getCourse(courseId);
      const courseData = response.data.data;
      setCourse(courseData);
    } catch (error: any) {
      toast.error('Failed to load course');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await coursesAPI.getEnrollment(courseId);
      const enrollmentData = response.data.data;
      setEnrollment(enrollmentData);

      // Check unlock status for each lesson if enrolled
      if (enrollmentData) {
        await loadCourseWithLessons();
      }
    } catch (error: any) {
      // Not enrolled
      setEnrollment(null);
    }
  };

  const loadCourseWithLessons = async () => {
    try {
      const [courseResponse, enrollmentResponse] = await Promise.all([
        coursesAPI.getCourse(courseId),
        coursesAPI.getEnrollment(courseId).catch(() => null)
      ]);

      const courseData = courseResponse.data.data;
      const enrollmentData = enrollmentResponse?.data?.data || null;


      setCourse(courseData);
      if (enrollmentData) {
        setEnrollment(enrollmentData);
      }

      // Check unlock status with fresh enrollment data
      if (enrollmentData && courseData.lessons) {
        await checkLessonUnlockStatus(courseData.lessons, enrollmentData);
      }
    } catch (error) {
      console.error('Error loading course:', error);
    }
  };

  const checkLessonUnlockStatus = async (lessons: any[], enrollmentData: any) => {
    const unlockStatus: Record<string, boolean> = {};
    const quizData: Record<string, any> = {};

    // Sort lessons by order to ensure sequential processing
    const sortedLessons = [...lessons].sort((a, b) => (a.order || 0) - (b.order || 0));

    // First lesson always unlocked for enrolled students
    if (sortedLessons.length > 0) {
      // Logic for first lesson (usually order 1)
      const firstLesson = sortedLessons[0];
      unlockStatus[firstLesson._id] = true;
    }

    // Check subsequent lessons
    for (let i = 0; i < sortedLessons.length; i++) {
      const lesson = sortedLessons[i];

      // If lesson is already completed, it MUST be unlocked
      const isCompleted = enrollmentData.completedLessons?.some(
        (id: any) => id.toString() === lesson._id.toString()
      );

      if (isCompleted) {
        unlockStatus[lesson._id] = true;
        // Continue to verify quiz data for UI but don't block
      }

      if (lesson.order === 1) continue; // Already handled

      // Find previous lesson
      const previousLesson = sortedLessons.find((l: any) => l.order === lesson.order - 1);

      if (previousLesson) {
        // Check if previous lesson is completed
        const isPreviousCompleted = enrollmentData.completedLessons?.some(
          (lessonId: any) => lessonId.toString() === previousLesson._id.toString()
        );

        // Check if quiz exists for previous lesson (for UI info only)
        try {
          const quizResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/quiz/lesson/${previousLesson._id}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );

          if (quizResponse.ok) {
            const quizInfo = await quizResponse.json();
            const quiz = quizInfo.data;

            // Check if student passed this quiz
            const attemptResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/quiz/${quiz._id}/attempts`,
              { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            if (attemptResponse.ok) {
              const attempts = await attemptResponse.json();
              const passedAttempt = attempts.data?.find((a: any) => a.passed === true);
              quizData[previousLesson._id] = { quiz, passed: !!passedAttempt };
            } else {
              quizData[previousLesson._id] = { quiz, passed: false };
            }
          }
        } catch (error) {
          console.error('  ❌ Error checking quiz:', error);
        }

        // UNLOCK LOGIC:
        // If it's not already unlocked (by being completed)
        if (!unlockStatus[lesson._id]) {
          // Unlock if previous lesson is completed
          if (isPreviousCompleted) {
            unlockStatus[lesson._id] = true;
          } else {
            unlockStatus[lesson._id] = false;
          }
        }
      }
    }

    setLessonUnlockStatus(unlockStatus);
    setQuizResults(quizData);
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      // Check if course is premium
      if (course?.isPremium && course?.price && course.price > 0) {
        // Initiate payment for premium course
        const response = await coursesAPI.initiatePayment(courseId);
        const { paymentUrl } = response.data.data;

        toast.success('Redirecting to payment gateway...');

        // Redirect to SSLCommerz payment page
        window.location.href = paymentUrl;
      } else {
        // Free course - direct enrollment
        await coursesAPI.enrollCourse(courseId);
        toast.success('Successfully enrolled in course! 🎉');
        await checkEnrollment();
        await loadCourse(); // Reload to show unlock status
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const calculateProgress = () => {
    // Use enrollment.progress if available, otherwise calculate
    if (enrollment?.progress !== undefined) return enrollment.progress;
    if (!enrollment?.completedLessons) return 0;
    const total = course?.lessons?.length || 0;
    if (total === 0) return 0;
    return Math.round((enrollment.completedLessons.length / total) * 100);
  };

  const isLessonCompleted = (lessonId: string) => {
    return enrollment?.completedLessons?.includes(lessonId) || false;
  };

  const isLessonUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevLessonId = course?.lessons[index - 1]?._id;
    return prevLessonId ? isLessonCompleted(prevLessonId) : false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-green-200 border-t-green-600 mb-4"></div>
          <p className="text-muted-foreground text-sm sm:text-base">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-page-gradient flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-card border-border">
          <CardContent className="p-6 sm:p-8 text-center">
            <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Course Not Found</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">The course you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/courses')} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = calculateProgress();
  const isEnrolled = !!enrollment;
  const isFree = !course.price || course.price === 0;

  return (
    <div className="min-h-screen bg-page-gradient w-full overflow-x-hidden">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
          {/* Back Button */}
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-white/90 hover:text-white transition-colors mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm md:text-base"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            <span>Back to Courses</span>
          </Link>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              {/* Category Badge */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/20 backdrop-blur-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full mb-3 sm:mb-4">
                <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">{course.topic || 'General'}</span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight">
                {course.title}
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base md:text-lg text-white/90 mb-3 sm:mb-4 md:mb-6 leading-relaxed line-clamp-3 sm:line-clamp-none">
                {course.description}
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm md:text-base">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                  <span className="font-semibold">{course.rating?.toFixed(1) || '4.5'}</span>
                  <span className="text-white/80 hidden xs:inline">({course.enrolledCount || 0} students)</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span>{course.estimatedDuration || 0} min</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span>{course.lessons?.length || 0} lessons</span>
                </div>
              </div>

              {/* Instructor (Mobile) */}
              <div className="mt-4 sm:mt-6 lg:hidden">
                <div className="flex items-center gap-2.5 sm:gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-2.5 sm:p-3 md:p-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-green-400 to-teal-400 flex items-center justify-center text-white font-bold text-sm sm:text-base md:text-lg flex-shrink-0">
                    {course.instructor?.name?.charAt(0).toUpperCase() || 'I'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-white/70">Instructor</p>
                    <p className="font-semibold text-xs sm:text-sm md:text-base text-white truncate">{course.instructor?.name || 'Anonymous'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enrollment Card (Desktop) */}
            <div className="hidden lg:block">
              <Card className="sticky top-6 shadow-2xl border-0">
                <CardContent className="p-6">
                  {/* Price */}
                  <div className="mb-6">
                    {course.isPremium && course.price > 0 ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-foreground">${course.price}</span>
                        <span className="text-muted-foreground line-through text-lg">${(course.price * 1.5).toFixed(2)}</span>
                      </div>
                    ) : (
                      <div className="text-3xl font-bold text-green-600">Free</div>
                    )}
                  </div>

                  {/* Progress (if enrolled) */}
                  {isEnrolled && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Your Progress</span>
                        <span className="font-semibold text-green-600">{progress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-600 to-teal-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>

                      {/* Certificate Available - Show when 100% complete */}
                      {progress === 100 && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Award className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-foreground text-sm">Certificate Available!</h4>
                              <p className="text-xs text-muted-foreground">Congratulations on completing the course</p>
                            </div>
                          </div>
                          <Link href="/certificates">
                            <Button className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white h-10">
                              <Award className="w-4 h-4 mr-2" />
                              View Certificate
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Enroll/Continue Button */}
                  {isEnrolled ? (
                    <Button
                      onClick={() => {
                        if (!course.lessons || course.lessons.length === 0) {
                          toast.error('No lessons available yet');
                          return;
                        }

                        // Find first unlocked incomplete lesson
                        const nextLesson = course.lessons.find(
                          (l: any) => !isLessonCompleted(l._id) &&
                            (l.order === 1 || lessonUnlockStatus[l._id] === true)
                        );

                        // If all complete or no unlocked found, go to first lesson
                        const targetLesson = nextLesson || course.lessons[0];

                        if (targetLesson) {
                          router.push(`/lessons/${targetLesson._id}`);
                        } else {
                          toast.error('No lessons available');
                        }
                      }}
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 h-12"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Continue Learning
                    </Button>
                  ) : (
                    <Button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 h-12"
                    >
                      {enrolling ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <GraduationCap className="w-5 h-5 mr-2" />
                          {course.isPremium && course.price > 0 ? 'Buy Now' : 'Enroll Free'}
                        </>
                      )}
                    </Button>
                  )}

                  {/* What's Included */}
                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{course.lessons?.length || 0} micro lessons</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Mobile & desktop access</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12 pb-24 lg:pb-12">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Tabs */}
            <div className="border-b border-border overflow-x-auto w-full scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0">
              <div className="flex gap-1 sm:gap-2 md:gap-4 pb-px min-w-max sm:min-w-0">
                {[
                  { id: 'overview', label: 'Overview', icon: FileText },
                  { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
                  { id: 'instructor', label: 'Instructor', icon: Users },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 font-medium border-b-2 transition-colors whitespace-nowrap text-xs sm:text-sm md:text-base ${activeTab === tab.id
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span className="hidden xs:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6">
                {/* What You'll Learn */}
                <Card className="w-full overflow-hidden shadow-sm border-border/50">
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0" />
                      <span>What You'll Learn</span>
                    </h2>
                    <div className="grid gap-2.5 sm:gap-3 md:gap-4 md:grid-cols-2">
                      {[
                        'Master core concepts',
                        'Build real projects',
                        'Industry best practices',
                        'Problem-solving skills',
                        'Practical exercises',
                        'Expert techniques',
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Course Description */}
                <Card className="w-full overflow-hidden shadow-sm border-border/50">
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-3 sm:mb-4">About This Course</h2>
                    <div className="prose prose-sm sm:prose w-full max-w-full text-muted-foreground dark:prose-invert break-words [&>*]:text-xs [&>*]:sm:text-sm [&>*]:md:text-base">
                      {course.description ? (
                        <MarkdownRenderer content={course.description} />
                      ) : (
                        <p className="text-xs sm:text-sm md:text-base leading-relaxed">{course.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Requirements */}
                <Card className="w-full overflow-hidden shadow-sm border-border/50">
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-3 sm:mb-4">Requirements</h2>
                    <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm md:text-base text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5 sm:mt-1 font-bold">•</span>
                        <span className="leading-relaxed">Basic understanding of the topic</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5 sm:mt-1 font-bold">•</span>
                        <span className="leading-relaxed">A computer with internet connection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5 sm:mt-1 font-bold">•</span>
                        <span className="leading-relaxed">Willingness to learn and practice</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <Card className="w-full overflow-hidden shadow-sm border-border/50">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground">Course Curriculum</h2>
                    <span className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground bg-secondary px-2 sm:px-2.5 py-1 rounded-full">
                      {course.lessons?.length || 0} Lessons
                    </span>
                  </div>

                  {!course.lessons || course.lessons.length === 0 ? (
                    <div className="text-center py-8 sm:py-10 md:py-12">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground mb-2">No Lessons Yet</h3>
                      <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-3 sm:mb-4 px-4">
                        The instructor hasn't added any lessons to this course yet.
                      </p>
                      <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 px-4">
                        Check back soon or browse other available courses.
                      </p>
                      <Link href="/courses" className="inline-block">
                        <Button variant="outline" className="w-auto text-xs sm:text-sm h-9 sm:h-10 px-4 sm:px-6">
                          Browse Other Courses
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2.5 sm:space-y-3">
                      {course.lessons.map((lesson: any, index: number) => {
                        const isCompleted = isLessonCompleted(lesson._id);
                        const isFirstLesson = lesson.order === 1;
                        const previousLesson = course.lessons.find((l: any) => l.order === lesson.order - 1);
                        const isPreviousCompleted = previousLesson ? isLessonCompleted(previousLesson._id) : false;

                        // Locking logic
                        let isUnlocked = false;
                        let lockReason = '';

                        if (!isEnrolled) {
                          // Not enrolled - all lessons locked
                          isUnlocked = false;
                          lockReason = course.isPremium ? '🔒 Enroll & Pay to Unlock' : '🔒 Enroll to Unlock';
                        } else if (isFirstLesson) {
                          // First lesson always unlocked for enrolled students
                          isUnlocked = true;
                        } else {
                          // Check unlock status from state
                          isUnlocked = lessonUnlockStatus[lesson._id] === true;

                          // Determine lock reason
                          if (!isUnlocked) {
                            if (!isPreviousCompleted) {
                              lockReason = '🔒 Complete Previous Lesson First';
                            } else if (previousLesson && quizResults[previousLesson._id]?.quiz) {
                              // Previous lesson has quiz
                              lockReason = '🔒 Pass Previous Quiz (80%+)';
                            } else {
                              // Should be unlocked if previous completed with no quiz
                              lockReason = '🔒 Locked';
                            }
                          }
                        }

                        const completed = isCompleted;
                        const unlocked = isUnlocked;

                        return (
                          <div
                            key={lesson._id}
                            className={`group border rounded-lg p-2.5 sm:p-3 md:p-4 transition-all ${unlocked
                              ? 'border-border hover:border-green-300 dark:hover:border-green-700 hover:shadow-md cursor-pointer bg-card active:scale-[0.99]'
                              : 'border-border bg-secondary/50 opacity-60'
                              }`}
                            onClick={() => {
                              if (unlocked && isEnrolled) {
                                router.push(`/lessons/${lesson._id}`);
                              } else if (!isEnrolled) {
                                toast.error('Please enroll to access lessons');
                              }
                            }}
                          >
                            <div className="flex items-start gap-2.5 sm:gap-3 md:gap-4">
                              {/* Lesson Number/Status */}
                              <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${completed
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                : unlocked
                                  ? 'bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 text-green-700 dark:text-green-400'
                                  : 'bg-secondary text-muted-foreground'
                                }`}>
                                {completed ? (
                                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                ) : unlocked ? (
                                  <span className="font-bold text-[10px] xs:text-xs sm:text-sm">{lesson.order || (index + 1)}</span>
                                ) : (
                                  <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                                )}
                              </div>

                              {/* Lesson Info */}
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold text-xs sm:text-sm md:text-base mb-1 leading-snug ${unlocked ? 'text-foreground group-hover:text-green-600' : 'text-muted-foreground'
                                  }`}>
                                  {lesson.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 md:gap-3 text-[10px] xs:text-xs sm:text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                                    <span className="whitespace-nowrap">{lesson.estimatedTime || 10} min</span>
                                  </span>
                                  {course.difficulty && (
                                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] xs:text-xs whitespace-nowrap ${course.difficulty === 'beginner'
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                      : course.difficulty === 'intermediate'
                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                      }`}>
                                      {course.difficulty}
                                    </span>
                                  )}
                                  {isEnrolled && isFirstLesson && (
                                    <span className="text-[10px] xs:text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 sm:px-2 py-0.5 rounded whitespace-nowrap">
                                      ✓ Unlocked
                                    </span>
                                  )}
                                  {!unlocked && lockReason && (
                                    <span className="text-[10px] xs:text-xs bg-secondary text-muted-foreground px-1.5 sm:px-2 py-0.5 rounded hidden md:inline whitespace-nowrap">
                                      {lockReason}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Action Icon */}
                              {unlocked && (
                                <div className="flex-shrink-0 hidden xs:block">
                                  {completed ? (
                                    <Award className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />
                                  ) : (
                                    <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-green-600 transition-colors" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'instructor' && (
              <Card className="shadow-sm border-border/50">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-6">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center text-white font-bold text-xl sm:text-2xl md:text-3xl flex-shrink-0">
                      {course.instructor?.name?.charAt(0).toUpperCase() || 'I'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-1 truncate">
                        {course.instructor?.name || 'Anonymous Instructor'}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-3 sm:mb-4 truncate">
                        {course.instructor?.email || 'No email provided'}
                      </p>
                      <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>Expert Instructor</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>{course.enrolledCount || 0} Students</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                          <span>{course.rating?.toFixed(1) || '4.5'} Rating</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Enrollment Card (Desktop already rendered above) */}
          <div className="lg:hidden">
            {/* Mobile Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border p-3 sm:p-4 shadow-lg z-40">
              <div className="flex items-center justify-between gap-3 sm:gap-4 max-w-7xl mx-auto">
                <div className="min-w-0">
                  {course.isPremium && course.price > 0 && !isEnrolled ? (
                    <div className="text-lg sm:text-xl font-bold text-foreground">${course.price}</div>
                  ) : !isEnrolled ? (
                    <div className="text-lg sm:text-xl font-bold text-green-600">Free</div>
                  ) : null}
                  {isEnrolled && (
                    <div className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground truncate">{progress}% Complete</div>
                  )}
                </div>

                {isEnrolled ? (
                  <>
                    {progress === 100 ? (
                      <Link href="/certificates" className="flex-1 min-w-0">
                        <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 w-full h-10 sm:h-11 text-xs sm:text-sm">
                          <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                          <span className="truncate">View Certificate</span>
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={() => {
                          if (!course.lessons || course.lessons.length === 0) {
                            toast.error('No lessons available yet');
                            return;
                          }

                          // Find first unlocked incomplete lesson
                          const nextLesson = course.lessons.find(
                            (l: any) => !isLessonCompleted(l._id) &&
                              (l.order === 1 || lessonUnlockStatus[l._id] === true)
                          );

                          // If all complete or no unlocked found, go to first lesson
                          const targetLesson = nextLesson || course.lessons[0];

                          if (targetLesson) {
                            router.push(`/lessons/${targetLesson._id}`);
                          } else {
                            toast.error('No lessons available');
                          }
                        }}
                        className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 flex-1 h-10 sm:h-11 text-xs sm:text-sm min-w-0"
                      >
                        <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                        <span className="truncate">Continue</span>
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 flex-1 h-10 sm:h-11 text-xs sm:text-sm min-w-0"
                  >
                    {enrolling ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-white border-t-transparent mr-1.5 sm:mr-2 flex-shrink-0"></div>
                        <span className="truncate">Enrolling...</span>
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                        <span className="truncate">{course.isPremium && course.price > 0 ? 'Buy Now' : 'Enroll Free'}</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
            {/* Spacer for fixed bottom bar */}
            <div className="h-16 sm:h-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
