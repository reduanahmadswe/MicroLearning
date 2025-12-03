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
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/instructor/courses">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Course</CardTitle>
            <p className="text-sm text-gray-500">
              Create a course and then add lessons with quizzes
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Course Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter course title"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Description *
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Write a detailed course description with formatting..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Use the toolbar to format your text with bold, italic, headings, lists, links, and images
                </p>
              </div>

              {/* Topic */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Topic *
                </label>
                <Input
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g., Programming, Math, Science"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Difficulty */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Difficulty *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Thumbnail URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Thumbnail URL (Optional)
                  </label>
                  <Input
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    type="url"
                  />
                </div>
              </div>

              {/* Free or Paid */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Course Access</h3>
                
                <div className="space-y-4">
                  {/* Free Option */}
                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="courseType"
                      checked={!formData.isPremium}
                      onChange={() => setFormData({ ...formData, isPremium: false, price: 0 })}
                      className="w-5 h-5 text-green-600"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <Unlock className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold">Free Course</p>
                        <p className="text-sm text-gray-600">
                          All learners can access this course
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Paid Option */}
                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="courseType"
                      checked={formData.isPremium}
                      onChange={() => setFormData({ ...formData, isPremium: true })}
                      className="w-5 h-5 text-blue-600"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold">Paid Course</p>
                        <p className="text-sm text-gray-600">
                          Students need to purchase to access
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Price Input (shown when paid is selected) */}
                  {formData.isPremium && (
                    <div className="ml-12 space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Course Price (BDT) *
                      </label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        placeholder="Enter price in BDT"
                        min={0}
                        step={0.01}
                        required={formData.isPremium}
                      />
                      <p className="text-xs text-gray-500">
                        Students will pay this amount to unlock the course
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
