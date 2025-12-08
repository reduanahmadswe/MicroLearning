'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { challengeAdminAPI } from '@/services/api.service';

interface Challenge {
  _id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  xpReward: number;
  coinsReward: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'daily' | 'quiz-battles'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'daily',
    difficulty: 'medium',
    xpReward: 100,
    coinsReward: 50,
    startDate: '',
    endDate: '',
    completionThreshold: 100,
  });
  
  const [activities, setActivities] = useState<Array<{
    type: 'quiz' | 'lesson' | 'flashcard';
    title: string;
    description: string;
    points: number;
    requiredScore: number;
  }>>([]);

  const [quizQuestions, setQuizQuestions] = useState<Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    points: number;
    timeLimit: number;
  }>>([]);

  const [battleSettings, setBattleSettings] = useState({
    maxPlayers: 4,
    minPlayers: 2,
    timeLimit: 300,
  });

  useEffect(() => {
    fetchChallenges();
  }, [activeTab]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const res = await challengeAdminAPI.getAllChallenges();
      setChallenges(res.data.data.challenges);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || formData.title.length < 3) {
      toast.error('Title must be at least 3 characters');
      return;
    }
    
    if (!formData.description || formData.description.length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    // Quiz Battle specific validation
    if (formData.type === 'multiplayer') {
      if (quizQuestions.length < 5) {
        toast.error('Quiz Battle requires at least 5 questions');
        return;
      }

      // Validate each question
      for (let i = 0; i < quizQuestions.length; i++) {
        const q = quizQuestions[i];
        if (!q.question.trim()) {
          toast.error(`Question ${i + 1} text is required`);
          return;
        }
        if (q.options.some(opt => !opt.trim())) {
          toast.error(`All options for Question ${i + 1} must be filled`);
          return;
        }
      }

      if (battleSettings.minPlayers > battleSettings.maxPlayers) {
        toast.error('Min players cannot be greater than max players');
        return;
      }
    }
    
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (endDate <= startDate) {
      toast.error('End date must be after start date');
      return;
    }
    
    try {
      // Calculate total points from activities or quiz questions
      const totalPoints = formData.type === 'multiplayer' 
        ? quizQuestions.reduce((sum, q) => sum + q.points, 0)
        : activities.reduce((sum, act) => sum + act.points, 0);
      
      // Prepare data with proper types and ISO date format
      const payload: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        difficulty: formData.difficulty,
        xpReward: Number(formData.xpReward),
        coinsReward: Number(formData.coinsReward),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        completionThreshold: Number(formData.completionThreshold),
        requirements: {
          type: formData.type,
          target: 1,
        },
      };

      // Add Quiz Battle specific fields
      if (formData.type === 'multiplayer') {
        payload.questions = quizQuestions;
        payload.maxPlayers = battleSettings.maxPlayers;
        payload.minPlayers = battleSettings.minPlayers;
        payload.timeLimit = battleSettings.timeLimit;
      } else {
        // Add activities for non-battle challenges
        if (activities.length > 0) {
          payload.activities = activities;
          payload.totalPoints = totalPoints;
        }
      }
      
      await challengeAdminAPI.createQuizBattle(payload);
      toast.success(`${formData.type === 'multiplayer' ? 'Quiz Battle' : 'Challenge'} created successfully!`);
      setShowCreateModal(false);
      fetchChallenges();
      setFormData({
        title: '',
        description: '',
        type: 'daily',
        difficulty: 'medium',
        xpReward: 100,
        coinsReward: 50,
        startDate: '',
        endDate: '',
        completionThreshold: 100,
      });
      setActivities([]);
      setQuizQuestions([]);
      setBattleSettings({ maxPlayers: 4, minPlayers: 2, timeLimit: 300 });
    } catch (error: any) {
      console.error('Create challenge error:', error.response?.data);
      const errorMsg = error.response?.data?.errorDetails?.[0]?.message || 
                      error.response?.data?.message || 
                      'Failed to create challenge';
      toast.error(errorMsg);
    }
  };

  const handleDeleteChallenge = async (id: string) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;

    try {
      await challengeAdminAPI.deleteChallenge(id);
      toast.success('Challenge deleted successfully!');
      fetchChallenges();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete challenge');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await challengeAdminAPI.updateChallenge(id, { isActive: !currentStatus });
      toast.success(`Challenge ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchChallenges();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update challenge');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Challenge & Event Management</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Create and manage challenges, daily tasks, and quiz battles</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:shadow-lg hover:scale-105 transition-all text-sm sm:text-base font-medium whitespace-nowrap"
            >
              + Create Challenge
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 sm:gap-4 mt-4 sm:mt-6 border-b overflow-x-auto scrollbar-thin scrollbar-thumb-green-300">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'text-green-600 border-b-2 border-green-600 scale-105'
                  : 'text-gray-500 hover:text-gray-700 hover:scale-105'
              }`}
            >
              All Challenges
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeTab === 'daily'
                  ? 'text-green-600 border-b-2 border-green-600 scale-105'
                  : 'text-gray-500 hover:text-gray-700 hover:scale-105'
              }`}
            >
              Daily Challenges
            </button>
            <button
              onClick={() => setActiveTab('quiz-battles')}
              className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeTab === 'quiz-battles'
                  ? 'text-green-600 border-b-2 border-green-600 scale-105'
                  : 'text-gray-500 hover:text-gray-700 hover:scale-105'
              }`}
            >
              Quiz Battles
            </button>
          </div>
        </div>

        {/* Challenges List */}
        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-xl">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-4 border-green-500 mx-auto"></div>
            <p className="text-sm sm:text-base text-gray-600 mt-3 sm:mt-4">Loading challenges...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {challenges.map((challenge) => (
              <div key={challenge._id} className="bg-white rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 hover:shadow-2xl hover:scale-105 transition-all">
                <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 truncate">{challenge.title}</h3>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                        challenge.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        challenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {challenge.difficulty}
                      </span>
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-teal-100 text-teal-700">
                        {challenge.type}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleActive(challenge._id, challenge.isActive)}
                    className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap hover:scale-105 transition-all ${
                      challenge.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {challenge.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">{challenge.description}</p>

                <div className="flex gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-xl sm:text-2xl">⚡</span>
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500">XP Reward</p>
                      <p className="font-bold text-sm sm:text-base text-green-600">{challenge.xpReward}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-xl sm:text-2xl">🪙</span>
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500">Coins Reward</p>
                      <p className="font-bold text-sm sm:text-base text-yellow-600">{challenge.coinsReward}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 sm:pt-4 border-t gap-2">
                  <div className="text-[10px] sm:text-xs text-gray-500">
                    <p>Start: {new Date(challenge.startDate).toLocaleDateString()}</p>
                    <p>End: {new Date(challenge.endDate).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteChallenge(challenge._id)}
                    className="text-red-600 hover:text-red-800 hover:scale-105 font-medium text-xs sm:text-sm transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Create New Challenge</h2>
              <form onSubmit={handleCreateChallenge} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Title <span className="text-red-500">*</span>
                    <span className="text-[10px] sm:text-xs text-gray-500 ml-2">(3-100 characters)</span>
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={100}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm sm:text-base"
                    placeholder="e.g., Complete 5 Lessons Today"
                  />
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{formData.title.length}/100</p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Description <span className="text-red-500">*</span>
                    <span className="text-[10px] sm:text-xs text-gray-500 ml-2">(min 10 characters)</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    minLength={10}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm sm:text-base"
                    placeholder="Describe the challenge..."
                  />
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{formData.description.length} characters</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm sm:text-base"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="special">Special Event</option>
                      <option value="multiplayer">Quiz Battle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm sm:text-base"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">XP Reward</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.xpReward}
                      onChange={(e) => setFormData({ ...formData, xpReward: Number(e.target.value) })}
                      className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm sm:text-base"
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Coins Reward</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.coinsReward}
                      onChange={(e) => setFormData({ ...formData, coinsReward: Number(e.target.value) })}
                      className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm sm:text-base"
                      placeholder="50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Start Date</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">End Date</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* Quiz Battle Questions Section - Only for multiplayer type */}
                {formData.type === 'multiplayer' && (
                  <div className="border-t pt-4 sm:pt-6 mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-purple-800">⚔️ Quiz Battle Questions</h3>
                        <p className="text-xs text-gray-500">Add questions for the battle (minimum 5 questions required)</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setQuizQuestions([...quizQuestions, { question: '', options: ['', '', '', ''], correctAnswer: 0, points: 10, timeLimit: 30 }])}
                        className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-xs sm:text-sm font-medium"
                      >
                        + Add Question
                      </button>
                    </div>

                    {/* Battle Settings */}
                    <div className="bg-purple-50 p-3 sm:p-4 rounded-lg mb-4">
                      <h4 className="font-bold text-purple-800 mb-3 text-sm">Battle Settings</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Max Players</label>
                          <input
                            type="number"
                            min={2}
                            max={10}
                            value={battleSettings.maxPlayers}
                            onChange={(e) => setBattleSettings({ ...battleSettings, maxPlayers: Number(e.target.value) })}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Min Players</label>
                          <input
                            type="number"
                            min={2}
                            max={battleSettings.maxPlayers}
                            value={battleSettings.minPlayers}
                            onChange={(e) => setBattleSettings({ ...battleSettings, minPlayers: Number(e.target.value) })}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Time Limit (sec)</label>
                          <input
                            type="number"
                            min={60}
                            max={600}
                            value={battleSettings.timeLimit}
                            onChange={(e) => setBattleSettings({ ...battleSettings, timeLimit: Number(e.target.value) })}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Questions List */}
                    {quizQuestions.length === 0 ? (
                      <div className="text-center py-8 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-500">No questions added yet. Add at least 5 questions for the battle.</p>
                        <p className="text-xs text-red-500 mt-1">⚠️ Quiz Battle requires minimum 5 questions</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {quizQuestions.map((question, qIndex) => (
                          <div key={qIndex} className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-bold text-purple-800 text-sm">Question {qIndex + 1}</h4>
                              <button
                                type="button"
                                onClick={() => setQuizQuestions(quizQuestions.filter((_, i) => i !== qIndex))}
                                className="text-red-600 hover:text-red-800 text-xs font-medium"
                              >
                                Remove
                              </button>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Question Text</label>
                                <input
                                  type="text"
                                  required
                                  value={question.question}
                                  onChange={(e) => {
                                    const updated = [...quizQuestions];
                                    updated[qIndex].question = e.target.value;
                                    setQuizQuestions(updated);
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  placeholder="Enter your question..."
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">Options (4 choices)</label>
                                <div className="space-y-2">
                                  {question.options.map((option, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name={`question-${qIndex}-correct`}
                                        checked={question.correctAnswer === oIndex}
                                        onChange={() => {
                                          const updated = [...quizQuestions];
                                          updated[qIndex].correctAnswer = oIndex;
                                          setQuizQuestions(updated);
                                        }}
                                        className="w-4 h-4 text-green-600"
                                      />
                                      <input
                                        type="text"
                                        required
                                        value={option}
                                        onChange={(e) => {
                                          const updated = [...quizQuestions];
                                          updated[qIndex].options[oIndex] = e.target.value;
                                          setQuizQuestions(updated);
                                        }}
                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                                        placeholder={`Option ${oIndex + 1}`}
                                      />
                                    </div>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Select the correct answer by clicking the radio button</p>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Points</label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={question.points}
                                    onChange={(e) => {
                                      const updated = [...quizQuestions];
                                      updated[qIndex].points = Number(e.target.value);
                                      setQuizQuestions(updated);
                                    }}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Time Limit (sec)</label>
                                  <input
                                    type="number"
                                    min={5}
                                    max={120}
                                    value={question.timeLimit}
                                    onChange={(e) => {
                                      const updated = [...quizQuestions];
                                      updated[qIndex].timeLimit = Number(e.target.value);
                                      setQuizQuestions(updated);
                                    }}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg">
                          <p className="text-sm font-bold text-purple-800">
                            📊 Total Questions: {quizQuestions.length} | Total Points: {quizQuestions.reduce((sum, q) => sum + q.points, 0)}
                          </p>
                          <p className="text-xs text-purple-700 mt-1">
                            {quizQuestions.length < 5 ? `⚠️ Add ${5 - quizQuestions.length} more questions (minimum 5 required)` : '✅ Ready to create battle!'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Activities Section */}
                {formData.type !== 'multiplayer' && (
                  <div className="border-t pt-4 sm:pt-6 mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-800">Challenge Activities (Optional)</h3>
                        <p className="text-xs text-gray-500">Add multiple activities (Quiz, Lesson, Flashcard) for point-based progress</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivities([...activities, { type: 'quiz', title: '', description: '', points: 10, requiredScore: 0 }])}
                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-xs sm:text-sm font-medium"
                      >
                        + Add Activity
                      </button>
                    </div>

                    {activities.length === 0 ? (
                      <p className="text-xs sm:text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                        No activities added yet. Multi-activity challenges allow users to complete various tasks for points.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {activities.map((activity, index) => (
                          <div key={index} className="p-3 sm:p-4 border-2 border-green-200 rounded-lg bg-green-50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs sm:text-sm font-bold text-gray-700">Activity {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => setActivities(activities.filter((_, i) => i !== index))}
                              className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium"
                            >
                              ✕ Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                              <select
                                value={activity.type}
                                onChange={(e) => {
                                  const newActivities = [...activities];
                                  newActivities[index].type = e.target.value as 'quiz' | 'lesson' | 'flashcard';
                                  setActivities(newActivities);
                                }}
                                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white text-xs sm:text-sm"
                              >
                                <option value="quiz">📝 Quiz</option>
                                <option value="lesson">📚 Lesson</option>
                                <option value="flashcard">🎴 Flashcard</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Points</label>
                              <input
                                type="number"
                                min={1}
                                value={activity.points}
                                onChange={(e) => {
                                  const newActivities = [...activities];
                                  newActivities[index].points = Number(e.target.value);
                                  setActivities(newActivities);
                                }}
                                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white text-xs sm:text-sm"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Activity Title</label>
                              <input
                                type="text"
                                value={activity.title}
                                onChange={(e) => {
                                  const newActivities = [...activities];
                                  newActivities[index].title = e.target.value;
                                  setActivities(newActivities);
                                }}
                                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white text-xs sm:text-sm"
                                placeholder="e.g., Complete JavaScript Quiz"
                              />
                            </div>
                            {activity.type === 'quiz' && (
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Required Score (%)</label>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={activity.requiredScore}
                                  onChange={(e) => {
                                    const newActivities = [...activities];
                                    newActivities[index].requiredScore = Number(e.target.value);
                                    setActivities(newActivities);
                                  }}
                                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white text-xs sm:text-sm"
                                  placeholder="e.g., 70"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                        <div className="bg-gradient-to-r from-green-100 to-teal-100 p-3 rounded-lg">
                          <p className="text-sm font-bold text-green-800">
                            📊 Total Points: {activities.reduce((sum, act) => sum + act.points, 0)}
                          </p>
                          <p className="text-xs text-green-700 mt-1">Users must complete activities to earn points and finish the challenge</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 sm:gap-4 pt-4 sm:pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setActivities([]);
                      setQuizQuestions([]);
                      setBattleSettings({ maxPlayers: 4, minPlayers: 2, timeLimit: 300 });
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2.5 sm:py-3 rounded-lg hover:bg-gray-300 hover:scale-105 transition-all font-medium text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-2.5 sm:py-3 rounded-lg hover:shadow-lg hover:scale-105 transition-all font-medium text-sm sm:text-base"
                  >
                    ✨ Create Challenge
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
