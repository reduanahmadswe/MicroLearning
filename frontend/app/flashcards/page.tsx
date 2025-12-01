'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Brain,
  RotateCw,
  Check,
  X,
  ChevronRight,
  Filter,
  Search,
  TrendingUp,
  Target,
  Clock,
  Flame,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { flashcardsAPI, aiAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { Flashcard } from '@/types';

export default function FlashcardsPage() {
  const router = useRouter();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiForm, setAiForm] = useState({
    topic: '',
    count: 10,
  });
  const [stats, setStats] = useState<any>(null);

  const topics = ['Programming', 'Mathematics', 'Science', 'Business', 'Language', 'Design'];

  useEffect(() => {
    loadFlashcards();
    loadDueCards();
    loadStats();
  }, [selectedTopic]);

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedTopic !== 'all') params.topic = selectedTopic;
      if (searchQuery) params.search = searchQuery;

      const response = await flashcardsAPI.getFlashcards(params);
      setFlashcards(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load flashcards');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadDueCards = async () => {
    try {
      const response = await flashcardsAPI.getDueFlashcards();
      setDueCards(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to load due cards:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await flashcardsAPI.getFlashcardStats();
      setStats(response.data.data);
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadFlashcards();
  };

  const handleGenerateAIFlashcards = async () => {
    if (!aiForm.topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setAiGenerating(true);
    try {
      await aiAPI.generateFlashcards({
        topic: aiForm.topic,
        count: aiForm.count,
      });

      toast.success('AI Flashcards generated successfully!');
      setShowAIModal(false);
      setAiForm({ topic: '', count: 10 });
      loadFlashcards();
      loadDueCards();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to generate flashcards');
    } finally {
      setAiGenerating(false);
    }
  };

  const startStudySession = () => {
    if (dueCards.length === 0) {
      toast.error('No flashcards due for review');
      return;
    }
    setStudyMode(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleRating = async (rating: 'easy' | 'medium' | 'hard') => {
    const currentCard = dueCards[currentCardIndex];
    
    try {
      await flashcardsAPI.reviewFlashcard(currentCard._id, { difficulty: rating });
      
      // Move to next card
      if (currentCardIndex < dueCards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setIsFlipped(false);
      } else {
        // Finished all cards
        toast.success('Study session complete! 🎉');
        setStudyMode(false);
        loadDueCards();
        loadStats();
      }
    } catch (error: any) {
      toast.error('Failed to record review');
    }
  };

  const filteredFlashcards = flashcards.filter(card => {
    if (searchQuery && !card.front.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (studyMode && dueCards.length > 0) {
    const currentCard = dueCards[currentCardIndex];
    const progress = ((currentCardIndex + 1) / dueCards.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Study Session</h1>
                <p className="text-sm text-gray-600">
                  Card {currentCardIndex + 1} of {dueCards.length}
                </p>
              </div>
              <Button variant="outline" onClick={() => setStudyMode(false)}>
                Exit Study
              </Button>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center">
            {/* Flashcard */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full max-w-2xl h-96 cursor-pointer perspective-1000 mb-8"
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front */}
                <Card className="absolute w-full h-full backface-hidden bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center p-8">
                  <div className="text-center">
                    <p className="text-sm opacity-75 mb-4">FRONT</p>
                    <p className="text-2xl font-bold">{currentCard.front}</p>
                    <p className="text-sm opacity-75 mt-8">Click to reveal answer</p>
                  </div>
                </Card>

                {/* Back */}
                <Card className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-green-500 to-teal-600 text-white flex items-center justify-center p-8">
                  <div className="text-center">
                    <p className="text-sm opacity-75 mb-4">BACK</p>
                    <p className="text-2xl font-bold">{currentCard.back}</p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Rating Buttons */}
            {isFlipped && (
              <div className="flex gap-4 animate-fade-in">
                <Button
                  onClick={() => handleRating('hard')}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-6"
                >
                  <X className="w-5 h-5 mr-2" />
                  Hard
                  <span className="block text-xs opacity-75 mt-1">Again soon</span>
                </Button>
                <Button
                  onClick={() => handleRating('medium')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-6"
                >
                  <RotateCw className="w-5 h-5 mr-2" />
                  Medium
                  <span className="block text-xs opacity-75 mt-1">Few days</span>
                </Button>
                <Button
                  onClick={() => handleRating('easy')}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-6"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Easy
                  <span className="block text-xs opacity-75 mt-1">Much later</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Flashcards</h1>
              <p className="text-gray-600 mt-1">Spaced Repetition System for Better Memory</p>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Cards</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalCards || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Due Today</p>
                  <p className="text-2xl font-bold text-orange-600">{dueCards.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mastered</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.masteredCards || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Streak</p>
                  <p className="text-2xl font-bold text-purple-600">{stats?.studyStreak || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Flame className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Study Now Card */}
        {dueCards.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-1">Ready to Study!</h3>
                  <p className="opacity-90">{dueCards.length} cards are waiting for review</p>
                </div>
                <Button
                  onClick={startStudySession}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  size="lg"
                >
                  Start Review
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search flashcards..."
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
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

        {/* Flashcards Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredFlashcards.length === 0 ? (
          <Card className="p-12 text-center">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No flashcards found</h3>
            <p className="text-gray-600 mb-4">Create or generate flashcards to start learning</p>
            <Button onClick={() => setShowAIModal(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate with AI
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlashcards.map((card) => (
              <Card key={card._id} className="hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      card.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      card.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {card.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">{card.topic}</span>
                  </div>
                  <CardTitle className="text-base line-clamp-2">{card.front}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{card.back}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Reviewed: {card.repetitions || 0}x</span>
                    <span>Next: {new Date(card.nextReviewDate).toLocaleDateString()}</span>
                  </div>
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
                Generate Flashcards with AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Topic
                </label>
                <Input
                  value={aiForm.topic}
                  onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                  placeholder="e.g., Python Functions, Chemistry Basics"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Number of Cards
                </label>
                <select
                  value={aiForm.count}
                  onChange={(e) => setAiForm({ ...aiForm, count: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value={5}>5 Cards</option>
                  <option value={10}>10 Cards</option>
                  <option value={15}>15 Cards</option>
                  <option value={20}>20 Cards</option>
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
                  onClick={handleGenerateAIFlashcards}
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

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
