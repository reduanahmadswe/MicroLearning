'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { coursesAPI } from '@/services/api.service';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  const [course, setCourse] = useState<any>(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadCourseAndEnroll();
    }
  }, [courseId]);

  const loadCourseAndEnroll = async () => {
    if (!courseId) return;

    try {
      // Load course details
      const courseResponse = await coursesAPI.getCourse(courseId);
      setCourse(courseResponse.data.data);

      // Try to enroll (payment is already verified on backend)
      setEnrolling(true);
      try {
        await coursesAPI.enrollCourse(courseId);
      } catch (error: any) {
        // Ignore if already enrolled
        if (!error?.response?.data?.message?.includes('Already enrolled')) {
          console.error('Enrollment error:', error);
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-gradient flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-card border-border">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-4">
            Payment Successful!
          </h1>

          {enrolling ? (
            <p className="text-muted-foreground mb-6">
              Processing your enrollment...
            </p>
          ) : (
            <>
              <p className="text-muted-foreground mb-6">
                Thank you for your purchase! You have been successfully enrolled in the course.
              </p>

              {course && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-foreground mb-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    You can now access all lessons and start learning!
                  </p>
                </div>
              )}
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {courseId && (
              <Link href={`/courses/${courseId}`}>
                <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                  Start Learning
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
            <Link href="/courses">
              <Button variant="outline">
                Browse More Courses
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
