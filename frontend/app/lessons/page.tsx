'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  Search,
  Filter,
  Plus,
  Sparkles,
  TrendingUp,
  Heart,
  Eye,
  Star,
  ChevronRight,
  CheckCircle,
  Video,
  FileQuestion,
  Award,
  PlayCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { lessonsAPI, aiAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { Lesson } from '@/types';

export default function LessonsPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiForm, setAiForm] = useState({
    topic: '',
    difficulty: 'beginner',
  });

  const topics = ['Programming', 'Mathematics', 'Science', 'Business', 'Language', 'Design'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    loadLessons();
  }, [selectedDifficulty, selectedTopic]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
      if (selectedTopic !== 'all') params.topic = selectedTopic;
      if (searchQuery) params.search = searchQuery;

      const response = await lessonsAPI.getLessons(params);
      setLessons(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load lessons');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadLessons();
  };

  const handleGenerateAILesson = async () => {
    if (!aiForm.topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setAiGenerating(true);
    try {
      const response = await aiAPI.generateLesson({
        topic: aiForm.topic,
        difficulty: aiForm.difficulty,
      });

      toast.success('AI Lesson generated successfully!');
      setShowAIModal(false);
      setAiForm({ topic: '', difficulty: 'beginner' });
      loadLessons(); // Reload lessons
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to generate lesson');
    } finally {
      setAiGenerating(false);
    }
  };

  const filteredLessons = lessons.filter(lesson => {
    if (searchQuery && !lesson.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="mb-2">
                  ← Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Micro Lessons</h1>
              <p className="text-gray-600 mt-1">Bite-sized learning for maximum impact</p>
            </div>
            <Button
              onClick={() => setShowAIModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate with AI
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lessons..."
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Difficulty:</span>
              <div className="flex gap-2">
                <Button
                  variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty('all')}
                >
                  All
                </Button>
                {difficulties.map((diff) => (
                  <Button
                    key={diff}
                    variant={selectedDifficulty === diff ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDifficulty(diff)}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Topic:</span>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Topics</option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lessons Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredLessons.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No lessons found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or generate a new lesson with AI</p>
            <Button onClick={() => setShowAIModal(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate with AI
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => (
              <Card key={lesson._id} className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      lesson.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                      lesson.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {lesson.difficulty}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span className="text-xs">{lesson.views || 0}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{lesson.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{lesson.summary}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{lesson.estimatedTime} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{lesson.likes || 0}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {lesson.tags?.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Lesson Status & Actions */}
                  {lesson.isCompleted && (
                    <div className="mb-3 flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <Link href={`/quiz?lessonId=${lesson._id}`}>
                      <button className="w-full flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-purple-50 transition-colors group">
                        <FileQuestion className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-gray-600 group-hover:text-purple-600">Quiz</span>
                      </button>
                    </Link>
                    
                    <Link href={`/videos?lessonId=${lesson._id}`}>
                      <button className="w-full flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-blue-50 transition-colors group">
                        <Video className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-gray-600 group-hover:text-blue-600">Video</span>
                      </button>
                    </Link>
                    
                    {lesson.isCompleted && (
                      <Link href={`/certificates?lessonId=${lesson._id}`}>
                        <button className="w-full flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-yellow-50 transition-colors group">
                          <Award className="w-5 h-5 text-yellow-600 group-hover:scale-110 transition-transform" />
                          <span className="text-xs text-gray-600 group-hover:text-yellow-600">Certificate</span>
                        </button>
                      </Link>
                    )}
                  </div>

                  <Link href={`/lessons/${lesson._id}`}>
                    <Button className="w-full" variant={lesson.isCompleted ? 'outline' : 'default'}>
                      {lesson.isCompleted ? (
                        <>
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Review Lesson
                        </>
                      ) : (
                        <>
                          Start Learning
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Generate Lesson with AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  What topic would you like to learn?
                </label>
                <Input
                  value={aiForm.topic}
                  onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                  placeholder="e.g., JavaScript Promises, Photosynthesis, etc."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Difficulty Level
                </label>
                <select
                  value={aiForm.difficulty}
                  onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAIModal(false)}
                  disabled={aiGenerating}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateAILesson}
                  disabled={aiGenerating}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {aiGenerating ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
