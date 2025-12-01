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

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getCourse(courseId);
      setCourse(response.data.data);
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
      if (enrollmentData && course?.lessons) {
        checkLessonUnlockStatus(course.lessons, enrollmentData);
      }
    } catch (error: any) {
      // Not enrolled
      setEnrollment(null);
    }
  };

  const checkLessonUnlockStatus = async (lessons: any[], enrollmentData: any) => {
    const unlockStatus: Record<string, boolean> = {};
    const quizData: Record<string, any> = {};
    
    // First lesson always unlocked
    if (lessons.length > 0 && lessons[0].order === 1) {
      unlockStatus[lessons[0]._id] = true;
    }
    
    // Check subsequent lessons
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      
      if (lesson.order === 1) continue; // Already handled
      
      // Check if previous lesson quiz was passed
      const previousLesson = lessons.find((l: any) => l.order === lesson.order - 1);
      
      if (previousLesson) {
        try {
          // Check if quiz exists and was passed for previous lesson
          const quizResponse = await fetch(
            `http://localhost:5000/api/v1/quizzes/lesson/${previousLesson._id}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
          
          if (quizResponse.ok) {
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
            // No quiz exists, consider unlocked
            unlockStatus[lesson._id] = true;
          }
        } catch (error) {
          console.error('Error checking unlock status:', error);
          unlockStatus[lesson._id] = false;
        }
      }
    }
    
    setLessonUnlockStatus(unlockStatus);
    setQuizResults(quizData);
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await coursesAPI.enrollCourse(courseId);
      toast.success('Successfully enrolled in course!');
      checkEnrollment();
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
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {completedLessons.length} / {course.lessons?.length || 0} lessons completed
                    </span>
                    {enrollment.progress === 100 && (
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <Award className="w-4 h-4" />
                        Completed!
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Curriculum */}
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {course.lessons?.map((lesson: any, index: number) => {
                    const isCompleted = completedLessons.includes(lesson._id);
                    const isFirstLesson = lesson.order === 1;
                    const isUnlocked = isFirstLesson || lessonUnlockStatus[lesson._id] === true;
                    const isLockedByQuiz = isEnrolled && !isFirstLesson && !isUnlocked;
                    const isLockedByPayment = !isEnrolled && course.isPremium;

                    return (
                      <div
                        key={lesson._id || index}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                          isCompleted ? 'border-green-200 bg-green-50' : 
                          isLockedByQuiz || isLockedByPayment ? 'border-gray-200 bg-gray-50' :
                          'border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            isCompleted ? 'bg-green-600 text-white' :
                            isLockedByQuiz || isLockedByPayment ? 'bg-gray-300 text-gray-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {isCompleted ? <CheckCircle className="w-5 h-5" /> :
                             (isLockedByQuiz || isLockedByPayment) ? <Lock className="w-4 h-4" /> :
                             lesson.order || (index + 1)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-medium ${
                                isLockedByQuiz || isLockedByPayment ? 'text-gray-500' : 'text-gray-900'
                              }`}>
                                {lesson.title}
                              </h4>
                              {isFirstLesson && isEnrolled && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  Always Unlocked
                                </span>
                              )}
                              {isLockedByQuiz && (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                  Pass Previous Quiz (80%+)
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {lesson.estimatedTime || 10} min • Lesson {lesson.order || (index + 1)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isEnrolled && isUnlocked && (
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
                          )}
                          {isLockedByQuiz && (
                            <Button size="sm" variant="ghost" disabled className="text-gray-500">
                              <Lock className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                        const nextLesson = course.lessons?.find(
                          (l: any) => !completedLessons.includes(l._id)
                        );
                        if (nextLesson) {
                          router.push(`/lessons/${nextLesson._id}`);
                        }
                      }}
                      className="w-full"
                      size="lg"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Continue Learning
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
                  <div className="flex items-center gap-2 text-gray-600">
                    <GraduationCap className="w-4 h-4" />
                    <span>Certificate upon completion</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award className="w-4 h-4" />
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
