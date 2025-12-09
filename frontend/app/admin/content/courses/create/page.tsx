'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { coursesAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    duration: 10,
    price: 0,
    thumbnail: '',
    prerequisites: '',
    learningOutcomes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const courseData = {
        ...formData,
        prerequisites: formData.prerequisites.split(',').map(p => p.trim()).filter(Boolean),
        learningOutcomes: formData.learningOutcomes.split(',').map(o => o.trim()).filter(Boolean),
      };

      await coursesAPI.createCourse(courseData);
      toast.success('Course created successfully!');
      router.push('/admin/content');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-gradient py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin/content">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Content
          </Button>
        </Link>

        <Card className="border border-border/50 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">Create New Course</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter course title"
                  required
                  className="bg-background text-foreground border-input"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed course description"
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Category *</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Programming, Design"
                    required
                    className="bg-background text-foreground border-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Duration (hours)</label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    min={1}
                    max={500}
                    className="bg-background text-foreground border-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Price ($)</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                    min={0}
                    className="bg-background text-foreground border-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Thumbnail URL</label>
                <Input
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="bg-background text-foreground border-input"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Prerequisites (comma separated)
                </label>
                <Input
                  value={formData.prerequisites}
                  onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                  placeholder="Basic HTML, CSS knowledge"
                  className="bg-background text-foreground border-input"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Learning Outcomes (comma separated)
                </label>
                <textarea
                  value={formData.learningOutcomes}
                  onChange={(e) => setFormData({ ...formData, learningOutcomes: e.target.value })}
                  placeholder="Build web apps, Understand React, Master JavaScript"
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {loading ? 'Creating...' : 'Create Course'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/admin/content')} className="border-input hover:bg-muted text-foreground">
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
