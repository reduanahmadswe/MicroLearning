'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { lessonsAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Trash2, Video, FileQuestion } from 'lucide-react';

export default function InstructorCreateLessonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
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

    // Validate courseId
    if (!courseId) {
      toast.error('Course ID is required. Please select a course first.');
      router.push('/instructor');
      return;
    }

    // Validate quiz questions
    const hasValidQuestions = formData.quizQuestions.every(q =>
      q.question.trim() &&
      q.options.every(opt => opt.trim())
    );

    if (!hasValidQuestions) {
      toast.error('Please fill in all quiz questions and options');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create the lesson
      const lessonData = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        topic: formData.topic,
        difficulty: formData.difficulty,
        estimatedTime: formData.estimatedTime,
        course: courseId,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        // Optional fields
        ...(formData.videoUrl && {
          media: [{
            type: 'video' as const,
            url: formData.videoUrl,
          }]
        }),
      };

      const lessonResponse = await lessonsAPI.createLesson(lessonData);

      // Extract lesson ID from response (handle different response structures)
      const createdLesson = lessonResponse.data?.data || lessonResponse.data;
      const lessonId = createdLesson?._id || createdLesson?.id;

      if (!lessonId) {
        console.error('Failed to get lesson ID from response:', lessonResponse);
        toast.error('Lesson created but failed to get lesson ID');
        return;
      }

      toast.success('Lesson created successfully!');

      // Step 2: Create the quiz for this lesson
      const quizData = {
        title: `${formData.title} - Quiz`,
        description: `Quiz for ${formData.title}. Test your understanding of this lesson.`,
        lesson: lessonId,
        course: courseId,
        topic: formData.topic,
        questions: formData.quizQuestions.map((q, index) => ({
          type: 'mcq' as const,
          question: q.question,
          options: q.options,
          correctAnswer: q.options[q.correctAnswer], // Send the actual text, not index
          explanation: q.explanation || `This is the correct answer for question ${index + 1}.`,
          points: 10,
        })),
        timeLimit: formData.estimatedTime * 5, // 5 minutes per estimated reading time
        passingScore: formData.passingScore,
        difficulty: formData.difficulty,
        isPremium: false,
        isPublished: true, // Publish the quiz immediately
      };

      const token = localStorage.getItem('token');

      const quizResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(quizData),
      });


      if (quizResponse.ok) {
        const quizResult = await quizResponse.json();
        toast.success('Quiz created successfully!');
      } else {
        let errorMessage = 'Unknown error';
        try {
          const errorText = await quizResponse.text();
          console.error('❌ Raw error response:', errorText);

          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              console.error('❌ Parsed error data:', errorData);
              errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
            } catch (e) {
              errorMessage = errorText;
            }
          }
        } catch (e) {
          console.error('❌ Failed to read error response:', e);
        }

        console.error('❌ Response status:', quizResponse.status);
        console.error('❌ Quiz data sent:', quizData);
        toast.warning(`Lesson created but quiz failed: ${errorMessage}. You can create it later.`);
      }

      router.push('/instructor');
    } catch (error: any) {
      console.error('Lesson creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-gradient py-4 sm:py-6 lg:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <Link href="/instructor">
          <Button variant="ghost" size="sm" className="mb-4 hover:bg-green-50 dark:hover:bg-green-900/20 text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="text-xl sm:text-2xl text-white">Create New Lesson</CardTitle>
          </CardHeader>
          <CardContent className="bg-card px-4 sm:px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium text-foreground">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter lesson title"
                  className="bg-background text-foreground border-border focus:border-green-500 focus:ring-green-500 text-sm sm:text-base placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium text-foreground">
                  Description *
                </label>
                <RichTextEditor
                  value={formData.description || ''}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Write a brief description of the lesson..."
                />
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  Brief overview of what students will learn
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium text-foreground">
                  Content *
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="Write your lesson content with rich formatting..."
                />
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  Use the toolbar to format your lesson with headings, bold, italic, lists, links, and images
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium text-foreground">
                  Topic *
                </label>
                <Input
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g., JavaScript, Python, Math"
                  className="bg-background text-foreground border-border focus:border-green-500 focus:ring-green-500 placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-medium text-foreground">
                    Difficulty *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 bg-background text-foreground text-sm sm:text-base border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-medium text-foreground">
                    Estimated Time (minutes)
                  </label>
                  <Input
                    type="number"
                    value={formData.estimatedTime || ''}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) || 0 })}
                    className="bg-background text-foreground text-sm sm:text-base border-border focus:border-green-500 focus:ring-green-500 placeholder:text-muted-foreground"
                    min={1}
                    max={60}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium text-foreground">
                  Tags (comma separated)
                </label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="programming, tutorial, basics"
                  className="bg-background text-foreground text-sm sm:text-base border-border focus:border-green-500 focus:ring-green-500 placeholder:text-muted-foreground"
                />
              </div>

              {/* Video Section */}
              <div className="border-t border-border pt-4 sm:pt-6">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Video className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Video (Optional)</h3>
                </div>
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-medium text-foreground">
                    Video URL
                  </label>
                  <Input
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://example.com/video.mp4"
                    className="bg-background text-foreground text-sm sm:text-base border-border focus:border-green-500 focus:ring-green-500 placeholder:text-muted-foreground"
                    type="url"
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground">Add a video URL for visual learning</p>
                </div>
              </div>

              {/* Quiz Section */}
              <div className="border-t border-border pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">Quiz Questions</h3>
                  </div>
                  <Button type="button" onClick={addQuestion} size="sm" className="border-green-600 bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                <div className="space-y-2 mb-4">
                  <label className="text-sm sm:text-base font-medium text-foreground">
                    Passing Score (%)
                  </label>
                  <Input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                    className="bg-background text-foreground text-sm sm:text-base border-border focus:border-green-500 focus:ring-green-500 placeholder:text-muted-foreground"
                    min={0}
                    max={100}
                  />
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {formData.quizQuestions.map((q, qIndex) => (
                    <Card key={qIndex} className="bg-card border-border">
                      <CardContent className="p-3 sm:p-4 bg-card">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <h4 className="font-semibold text-sm sm:text-base text-foreground">Question {qIndex + 1}</h4>
                          {formData.quizQuestions.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeQuestion(qIndex)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                          <div>
                            <label className="text-sm sm:text-base font-medium text-foreground">Question Text</label>
                            <Input
                              value={q.question}
                              onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                              placeholder="Enter your question"
                              className="bg-background text-foreground text-sm sm:text-base border-border focus:border-green-500 focus:ring-green-500 mt-1 placeholder:text-muted-foreground"
                              required
                            />
                          </div>

                          <div>
                            <label className="text-sm sm:text-base font-medium text-foreground mb-2 block">
                              Options (Select correct answer)
                            </label>
                            <div className="space-y-2">
                              {q.options.map((option, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correct-${qIndex}`}
                                    checked={q.correctAnswer === oIndex}
                                    onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                    className="w-4 h-4 text-green-600 focus:ring-green-500 flex-shrink-0"
                                  />
                                  <Input
                                    value={option}
                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                    placeholder={`Option ${oIndex + 1}`}
                                    className="bg-background text-foreground text-sm sm:text-base border-border focus:border-green-500 focus:ring-green-500 placeholder:text-muted-foreground"
                                    required
                                  />
                                </div>
                              ))}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Select the correct answer</p>
                          </div>

                          <div>
                            <label className="text-sm sm:text-base font-medium text-foreground">Explanation (Optional)</label>
                            <textarea
                              value={q.explanation}
                              onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                              placeholder="Explain why this is the correct answer"
                              rows={2}
                              className="w-full px-3 py-2 bg-background text-foreground text-sm sm:text-base border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 mt-1 placeholder:text-muted-foreground"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

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
                      Create Lesson
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-card text-foreground hover:bg-secondary w-full sm:flex-1"
                  onClick={() => router.push('/instructor')}
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
