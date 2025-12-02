'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  Clock,
  BookOpen,
  Users,
  Star,
  CheckCircle,
  Lock,
  Play,
  ChevronLeft,
  Award,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { coursesAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { Course } from '@/types';

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
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
      console.log('🔄 Refreshing after lesson completion');
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
      console.log('📚 Course Data:', courseData);
      console.log('📖 Lessons:', courseData.lessons);
      console.log('📊 Lesson Count:', courseData.lessons?.length || 0);
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
      
      console.log('🔄 Refreshed enrollment data:', enrollmentData?.completedLessons);
      
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
    console.log('🔓 Checking lesson unlock status...');
    console.log('📚 Total lessons:', lessons.length);
    console.log('✅ Completed lessons:', enrollmentData.completedLessons);
    
    const unlockStatus: Record<string, boolean> = {};
    const quizData: Record<string, any> = {};
    
    // First lesson always unlocked for enrolled students
    if (lessons.length > 0 && lessons[0].order === 1) {
      unlockStatus[lessons[0]._id] = true;
      console.log('✓ First lesson unlocked:', lessons[0].title);
    }
    
    // Check subsequent lessons
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      
      if (lesson.order === 1) continue; // Already handled
      
      console.log(`\n🔍 Checking lesson ${lesson.order}: ${lesson.title}`);
      
      // Find previous lesson
      const previousLesson = lessons.find((l: any) => l.order === lesson.order - 1);
      
      if (previousLesson) {
        console.log(`  Previous lesson: ${previousLesson.title}`);
        
        // Check if previous lesson is completed
        const isPreviousCompleted = enrollmentData.completedLessons?.some(
          (lessonId: any) => lessonId.toString() === previousLesson._id.toString()
        );
        console.log(`  Previous completed:`, isPreviousCompleted);
        
        if (!isPreviousCompleted) {
          // Previous lesson not even completed
          unlockStatus[lesson._id] = false;
          console.log(`  ❌ Locked - previous not completed`);
          continue;
        }
        
        try {
          // Check if quiz exists for previous lesson
          const quizResponse = await fetch(
            `http://localhost:5000/api/v1/quizzes/lesson/${previousLesson._id}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
          
          if (quizResponse.ok) {
            // Quiz exists - check if passed (80%+)
            const quizInfo = await quizResponse.json();
            const quiz = quizInfo.data;
            
            // Check if student passed this quiz
            const attemptResponse = await fetch(
              `http://localhost:5000/api/v1/quizzes/${quiz._id}/attempts`,
              { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            
            if (attemptResponse.ok) {
              const attempts = await attemptResponse.json();
              const passedAttempt = attempts.data?.find((a: any) => a.passed === true);
              unlockStatus[lesson._id] = !!passedAttempt;
              quizData[previousLesson._id] = { quiz, passed: !!passedAttempt };
            } else {
              unlockStatus[lesson._id] = false;
              quizData[previousLesson._id] = { quiz, passed: false };
            }
          } else {
            // No quiz exists - lesson completed is enough
            unlockStatus[lesson._id] = true;
            console.log(`  ✅ Unlocked - no quiz required`);
          }
        } catch (error) {
          console.error('  ❌ Error checking quiz:', error);
          unlockStatus[lesson._id] = false;
        }
      }
    }
    
    console.log('\n📊 Final unlock status:', unlockStatus);
    setLessonUnlockStatus(unlockStatus);
    setQuizResults(quizData);
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await coursesAPI.enrollCourse(courseId);
      toast.success('Successfully enrolled in course! 🎉');
      await checkEnrollment();
      await loadCourse(); // Reload to show unlock status
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <Link href="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isEnrolled = !!enrollment;
  const completedLessons = enrollment?.completedLessons || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/courses">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Courses
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <Card>
              {course.thumbnail && (
                <div className="h-64 overflow-hidden rounded-t-lg">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    course.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                    course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {course.difficulty}
                  </span>
                  <span className="text-sm text-gray-600">{course.topic}</span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-3">{course.title}</h1>
                <p className="text-gray-600 mb-4">{course.description}</p>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.lessons?.length || 0} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{course.estimatedDuration} hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{course.enrolledCount || 0} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{course.rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress (if enrolled) */}
            {isEnrolled && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Completion</span>
                      <span>{enrollment.progress}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-600">
                      {completedLessons.length} / {course.lessons?.length || 0} lessons completed
                    </span>
                    {enrollment.progress === 100 && (
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Completed!
                      </span>
                    )}
                  </div>
                  
                  {/* Certificate Button */}
                  {enrollment.progress === 100 && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              Certificate Available!
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                              Congratulations! You've completed this course. Download your certificate and share your achievement.
                            </p>
                            <Link href="/certificates">
                              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                                <Award className="w-4 h-4 mr-2" />
                                View Certificate
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Curriculum */}
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
              </CardHeader>
              <CardContent>
                {!course.lessons || course.lessons.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Lessons Yet</h3>
                    <p className="text-gray-600 mb-4">
                      The instructor hasn't added any lessons to this course yet.
                    </p>
                    <p className="text-sm text-gray-500">
                      Check back soon or browse other available courses.
                    </p>
                    <Link href="/courses" className="inline-block mt-4">
                      <Button variant="outline">
                        Browse Other Courses
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {course.lessons.map((lesson: any, index: number) => {
                      const isCompleted = completedLessons.includes(lesson._id);
                      const isFirstLesson = lesson.order === 1;
                      const previousLesson = course.lessons.find((l: any) => l.order === lesson.order - 1);
                      const isPreviousCompleted = previousLesson ? completedLessons.includes(previousLesson._id) : false;
                      
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

                      return (
                        <div
                          key={lesson._id || index}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                            isCompleted ? 'border-green-200 bg-green-50' : 
                            !isUnlocked ? 'border-gray-200 bg-gray-50' :
                            'border-gray-200 hover:border-blue-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              isCompleted ? 'bg-green-600 text-white' :
                              !isUnlocked ? 'bg-gray-300 text-gray-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {isCompleted ? <CheckCircle className="w-5 h-5" /> :
                               !isUnlocked ? <Lock className="w-4 h-4" /> :
                               lesson.order || (index + 1)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={`font-medium ${
                                  !isUnlocked ? 'text-gray-500' : 'text-gray-900'
                                }`}>
                                  {lesson.title}
                                </h4>
                                {isEnrolled && isFirstLesson && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                    ✓ Unlocked
                                  </span>
                                )}
                                {!isUnlocked && lockReason && (
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                    {lockReason}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {lesson.estimatedTime || 10} min • Lesson {lesson.order || (index + 1)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isEnrolled && isUnlocked ? (
                              <Link href={`/lessons/${lesson._id}`}>
                                <Button 
                                  size="sm" 
                                  variant={isCompleted ? "outline" : "default"}
                                  className={isCompleted ? "" : "bg-blue-600 hover:bg-blue-700"}
                                >
                                  <Play className="w-4 h-4 mr-1" />
                                  {isCompleted ? 'Review' : 'Start'}
                                </Button>
                              </Link>
                            ) : (
                              <Button size="sm" variant="ghost" disabled className="text-gray-400">
                                <Lock className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="sticky top-4">
              <CardContent className="p-6">
                {course.isPremium && !isEnrolled && (
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      ${course.price}
                    </p>
                    <p className="text-sm text-gray-600">One-time payment</p>
                  </div>
                )}

                {!isEnrolled ? (
                  <div className="space-y-3">
                    {course.isPremium && (
                      <div className="text-center py-2 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-xs text-yellow-700">
                          🔒 Premium Course - Payment Required
                        </p>
                      </div>
                    )}
                    <Button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      size="lg"
                    >
                      {enrolling ? 'Enrolling...' : course.isPremium ? 'Purchase Course' : 'Enroll for Free'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center py-3 bg-green-50 rounded-lg">
                      <p className="text-green-700 font-medium">✓ You're enrolled</p>
                    </div>
                    <Button
                      onClick={() => {
                        if (!course.lessons || course.lessons.length === 0) {
                          toast.error('No lessons available yet');
                          return;
                        }
                        
                        // Find first unlocked incomplete lesson
                        const nextLesson = course.lessons.find(
                          (l: any) => !completedLessons.includes(l._id) && 
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
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      size="lg"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {completedLessons.length > 0 ? 'Continue Learning' : 'Start Learning'}
                    </Button>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.lessons?.length || 0} lessons</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{course.estimatedDuration} hours total</span>
                  </div>
                  <div className={`flex items-center gap-2 ${
                    isEnrolled && enrollment?.progress === 100 
                      ? 'text-green-600 font-medium' 
                      : 'text-gray-600'
                  }`}>
                    <Award className="w-4 h-4" />
                    <span>
                      {isEnrolled && enrollment?.progress === 100 
                        ? '✓ Certificate earned!' 
                        : 'Certificate upon completion'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <GraduationCap className="w-4 h-4" />
                    <span>Lifetime access</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {course.instructor?.name?.charAt(0).toUpperCase() || 'I'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{course.instructor?.name || 'Instructor'}</p>
                    <p className="text-sm text-gray-600">{course.instructor?.role || 'Course Creator'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
