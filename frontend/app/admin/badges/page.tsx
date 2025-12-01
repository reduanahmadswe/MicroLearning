'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { badgeAdminAPI } from '@/services/api.service';

interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  criteria: any;
  xpRequired?: number;
  earnedByCount: number;
}

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🏆',
    category: 'achievement',
    xpRequired: 0,
  });
  const [awardData, setAwardData] = useState({
    userId: '',
    badgeId: '',
    reason: '',
  });

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const res = await badgeAdminAPI.getAllBadges();
      setBadges(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch badges');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await badgeAdminAPI.createBadge(formData);
      toast.success('Badge created successfully!');
      setShowCreateModal(false);
      fetchBadges();
      setFormData({
        name: '',
        description: '',
        icon: '🏆',
        category: 'achievement',
        xpRequired: 0,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create badge');
    }
  };

  const handleAwardBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await badgeAdminAPI.awardBadge(awardData);
      toast.success('Badge awarded successfully!');
      setShowAwardModal(false);
      setAwardData({ userId: '', badgeId: '', reason: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to award badge');
    }
  };

  const handleDeleteBadge = async (id: string) => {
    if (!confirm('Are you sure? This will remove the badge from all users.')) return;

    try {
      await badgeAdminAPI.deleteBadge(id);
      toast.success('Badge deleted successfully!');
      fetchBadges();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete badge');
    }
  };

  const icons = ['🏆', '⭐', '🎖️', '👑', '💎', '🔥', '⚡', '🎯', '🚀', '💪', '🧠', '📚', '🎓', '🏅', '🥇'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Badge & Achievement Management</h1>
              <p className="text-gray-600 mt-2">Create badges, set criteria, and manually award achievements</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAwardModal(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
              >
                Award Badge
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
              >
                + Create Badge
              </button>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading badges...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {badges.map((badge) => (
              <div key={badge._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all">
                <div className="text-center">
                  <div className="text-6xl mb-4">{badge.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{badge.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{badge.description}</p>
                  
                  <div className="flex justify-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                      {badge.category}
                    </span>
                    {badge.xpRequired && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {badge.xpRequired} XP
                      </span>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-600">Earned by</p>
                    <p className="text-2xl font-bold text-orange-600">{badge.earnedByCount}</p>
                    <p className="text-xs text-gray-500">users</p>
                  </div>

                  <button
                    onClick={() => handleDeleteBadge(badge._id)}
                    className="w-full bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition-all font-medium text-sm"
                  >
                    Delete Badge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Badge</h2>
              <form onSubmit={handleCreateBadge} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Badge Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                  <div className="grid grid-cols-10 gap-2 mb-2">
                    {icons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                          formData.icon === icon
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="achievement">Achievement</option>
                      <option value="milestone">Milestone</option>
                      <option value="special">Special</option>
                      <option value="skill">Skill</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">XP Required (Optional)</label>
                    <input
                      type="number"
                      value={formData.xpRequired}
                      onChange={(e) => setFormData({ ...formData, xpRequired: Number(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    Create Badge
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

        {/* Award Modal */}
        {showAwardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Manually Award Badge</h2>
              <form onSubmit={handleAwardBadge} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                  <input
                    type="text"
                    required
                    value={awardData.userId}
                    onChange={(e) => setAwardData({ ...awardData, userId: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter user ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Badge</label>
                  <select
                    required
                    value={awardData.badgeId}
                    onChange={(e) => setAwardData({ ...awardData, badgeId: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a badge</option>
                    {badges.map((badge) => (
                      <option key={badge._id} value={badge._id}>
                        {badge.icon} {badge.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
                  <textarea
                    rows={3}
                    value={awardData.reason}
                    onChange={(e) => setAwardData({ ...awardData, reason: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Why are you awarding this badge?"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    Award Badge
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAwardModal(false)}
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
