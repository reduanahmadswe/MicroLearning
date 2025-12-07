'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { coursesAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { ArrowLeft, Save, DollarSign, Unlock } from 'lucide-react';

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topic: '',
    difficulty: 'beginner',
    thumbnailUrl: '',
    isPremium: false,
    price: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const courseData = {
        ...formData,
        lessons: [], // Will add lessons after course creation
        price: formData.isPremium ? formData.price : 0,
      };

      const response = await coursesAPI.createCourse(courseData);
      toast.success('Course created successfully! Now add lessons.');
      
      // Navigate to lessons management page for this course
      router.push(`/instructor/courses/${response.data._id}/lessons`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <Link href="/instructor/courses">
          <Button variant="ghost" size="sm" className="mb-4 hover:bg-green-50 text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </Link>

        <Card className="bg-white border-green-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="text-xl sm:text-2xl text-white">Create New Course</CardTitle>
            <p className="text-sm text-green-100 mt-1">
              Create a course and then add lessons with quizzes
            </p>
          </CardHeader>
          <CardContent className="bg-white px-4 sm:px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium text-gray-900">
                  Course Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter course title"
                  className="bg-white text-gray-900 text-sm sm:text-base border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-500 transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium text-gray-900">
                  Description *
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Write a detailed course description with formatting..."
                />
                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  Use the toolbar to format your text with bold, italic, headings, lists, links, and images
                </p>
              </div>

              {/* Topic */}
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium text-gray-900">
                  Topic *
                </label>
                <Input
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g., Programming, Math, Science"
                  className="bg-white text-gray-900 text-sm sm:text-base border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-500 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Difficulty */}
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-medium text-gray-900">
                    Difficulty *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 bg-white text-gray-900 text-sm sm:text-base border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Thumbnail URL */}
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-medium text-gray-900">
                    Thumbnail URL (Optional)
                  </label>
                  <Input
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="bg-white text-gray-900 text-sm sm:text-base border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-500 transition-all"
                    type="url"
                  />
                </div>
              </div>

              {/* Free or Paid */}
              <div className="border-t border-green-100 pt-4 sm:pt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Course Access</h3>
                
                <div className="space-y-3 sm:space-y-4">
                  {/* Free Option */}
                  <label className="flex items-start sm:items-center gap-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer hover:bg-green-50 transition-colors border-green-100">
                    <input
                      type="radio"
                      name="courseType"
                      checked={!formData.isPremium}
                      onChange={() => setFormData({ ...formData, isPremium: false, price: 0 })}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 focus:ring-green-500 mt-1 sm:mt-0 flex-shrink-0"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <Unlock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-gray-900">Free Course</p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          All learners can access this course
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Paid Option */}
                  <label className="flex items-start sm:items-center gap-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer hover:bg-green-50 transition-colors border-green-100">
                    <input
                      type="radio"
                      name="courseType"
                      checked={formData.isPremium}
                      onChange={() => setFormData({ ...formData, isPremium: true })}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 focus:ring-green-500 mt-1 sm:mt-0 flex-shrink-0"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-gray-900">Paid Course</p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Students need to purchase to access
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Price Input (shown when paid is selected) */}
                  {formData.isPremium && (
                    <div className="ml-0 sm:ml-12 space-y-2 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                      <label className="text-sm sm:text-base font-medium text-gray-900">
                        Course Price (BDT) *
                      </label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        placeholder="Enter price in BDT"
                        className="bg-white text-gray-900 text-sm sm:text-base border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-500 transition-all"
                        min={0}
                        step={0.01}
                        required={formData.isPremium}
                      />
                      <p className="text-xs sm:text-sm text-gray-600">
                        Students will pay this amount to unlock the course
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white w-full sm:flex-1"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Course & Add Lessons
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-green-600 text-black bg-white hover:bg-white hover:text-black w-full sm:flex-1"
                  onClick={() => router.push('/instructor/courses')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
