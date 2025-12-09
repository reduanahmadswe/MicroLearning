'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { lessonsAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Trash2, Video, FileQuestion } from 'lucide-react';

export default function CreateLessonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    topic: '',
    difficulty: 'beginner',
    estimatedTime: 2,
    tags: '',
    videoUrl: '',
    quizQuestions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
      }
    ],
    passingScore: 70,
  });

  const addQuestion = () => {
    setFormData({
      ...formData,
      quizQuestions: [
        ...formData.quizQuestions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: '',
        }
      ]
    });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = formData.quizQuestions.filter((_, i) => i !== index);
    setFormData({ ...formData, quizQuestions: newQuestions });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...formData.quizQuestions];
    (newQuestions[index] as any)[field] = value;
    setFormData({ ...formData, quizQuestions: newQuestions });
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...formData.quizQuestions];
    newQuestions[qIndex].options[oIndex] = value;
    setFormData({ ...formData, quizQuestions: newQuestions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const lessonData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      await lessonsAPI.createLesson(lessonData);
      toast.success('Lesson created successfully!');
      router.push('/admin/content');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create lesson');
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
            <CardTitle className="text-2xl text-foreground">Create New Lesson</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter lesson title"
                  required
                  className="bg-background text-foreground border-input"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Topic *
                </label>
                <Input
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g., JavaScript, Python, Math"
                  required
                  className="bg-background text-foreground border-input"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Tags (comma separated)
                </label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="programming, tutorial, basics"
                  className="bg-background text-foreground border-input"
                />
              </div>

              {/* Video Section */}
              <div className="border-t border-border/50 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-foreground">Video (Optional)</h3>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Video URL
                  </label>
                  <Input
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://example.com/video.mp4"
                    type="url"
                    className="bg-background text-foreground border-input"
                  />
                  <p className="text-xs text-muted-foreground">Add a video URL for visual learning</p>
                </div>
              </div>

              {/* Quiz Section */}
              <div className="border-t border-border/50 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-lg font-semibold text-foreground">Quiz Questions</h3>
                  </div>
                  <Button type="button" onClick={addQuestion} size="sm" variant="outline" className="border-input hover:bg-muted text-foreground">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-foreground">
                    Passing Score (%)
                  </label>
                  <Input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                    min={0}
                    max={100}
                    className="bg-background text-foreground border-input"
                  />
                </div>

                <div className="space-y-6">
                  {formData.quizQuestions.map((q, qIndex) => (
                    <Card key={qIndex} className="border border-border/50 bg-muted/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-medium text-foreground">Question {qIndex + 1}</h4>
                          {formData.quizQuestions.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeQuestion(qIndex)}
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-foreground">Question</label>
                            <Input
                              value={q.question}
                              onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                              placeholder="Enter your question"
                              required
                              className="bg-background text-foreground border-input"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Options</label>
                            <div className="space-y-2">
                              {q.options.map((option, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correct-${qIndex}`}
                                    checked={q.correctAnswer === oIndex}
                                    onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                    className="w-4 h-4 text-primary"
                                  />
                                  <Input
                                    value={option}
                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                    placeholder={`Option ${oIndex + 1}`}
                                    required
                                    className="bg-background text-foreground border-input"
                                  />
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Select the correct answer</p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-foreground">Explanation (Optional)</label>
                            <textarea
                              value={q.explanation}
                              onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                              placeholder="Explain why this is the correct answer"
                              rows={2}
                              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Tags (comma separated)
                </label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="programming, tutorial, basics"
                  className="bg-background text-foreground border-input"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Lesson
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/content')}
                  className="border-input hover:bg-muted text-foreground"
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
