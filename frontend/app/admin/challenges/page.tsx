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
    try {
      await challengeAdminAPI.createQuizBattle(formData);
      toast.success('Challenge created successfully!');
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
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create challenge');
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
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Challenge & Event Management</h1>
              <p className="text-gray-600 mt-2">Create and manage challenges, daily tasks, and quiz battles</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
            >
              + Create Challenge
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6 border-b">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'all'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Challenges
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'daily'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Daily Challenges
            </button>
            <button
              onClick={() => setActiveTab('quiz-battles')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'quiz-battles'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Quiz Battles
            </button>
          </div>
        </div>

        {/* Challenges List */}
        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading challenges...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <div key={challenge._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{challenge.title}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        challenge.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        challenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {challenge.difficulty}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {challenge.type}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleActive(challenge._id, challenge.isActive)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      challenge.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {challenge.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{challenge.description}</p>

                <div className="flex gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <p className="text-xs text-gray-500">XP Reward</p>
                      <p className="font-bold text-purple-600">{challenge.xpReward}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🪙</span>
                    <div>
                      <p className="text-xs text-gray-500">Coins Reward</p>
                      <p className="font-bold text-yellow-600">{challenge.coinsReward}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-xs text-gray-500">
                    <p>Start: {new Date(challenge.startDate).toLocaleDateString()}</p>
                    <p>End: {new Date(challenge.endDate).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteChallenge(challenge._id)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Challenge</h2>
              <form onSubmit={handleCreateChallenge} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="special">Special Event</option>
                      <option value="multiplayer">Quiz Battle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">XP Reward</label>
                    <input
                      type="number"
                      required
                      value={formData.xpReward}
                      onChange={(e) => setFormData({ ...formData, xpReward: Number(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coins Reward</label>
                    <input
                      type="number"
                      required
                      value={formData.coinsReward}
                      onChange={(e) => setFormData({ ...formData, coinsReward: Number(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    Create Challenge
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-all font-medium"
                  >
                    Cancel
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
