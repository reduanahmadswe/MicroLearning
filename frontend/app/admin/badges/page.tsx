'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { badgeAdminAPI } from '@/services/api.service';
import axios from 'axios';

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

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
  avatar?: string;
}

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    criteria: {
      type: 'xp_milestone' as 'streak' | 'lessons_completed' | 'quiz_perfect' | 'xp_milestone' | 'flashcard_mastered' | 'topic_mastered',
      threshold: 100,
      topic: '',
    },
    rarity: 'common' as 'common' | 'rare' | 'epic' | 'legendary',
    xpReward: 0,
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

  const searchUsers = async (query: string) => {
    if (!query || query.length < 2) {
      setUsers([]);
      return;
    }

    try {
      setSearchingUsers(true);
      const token = localStorage.getItem('token');

      console.log('Searching users with query:', query);

      const res = await axios.get(`http://localhost:5000/api/v1/admin/users`, {
        params: { search: query, limit: 20 },
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('User search response:', res.data);

      const userList = res.data.data?.users || res.data.data || [];
      console.log('Extracted users:', userList);

      setUsers(userList);
    } catch (error: any) {
      console.error('Error searching users:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to search users');
    } finally {
      setSearchingUsers(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (showAwardModal) {
        searchUsers(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, showAwardModal]);

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.name.length < 3 || formData.name.length > 100) {
      toast.error('Badge name must be between 3 and 100 characters');
      return;
    }

    if (formData.description.length < 10 || formData.description.length > 500) {
      toast.error('Description must be between 10 and 500 characters');
      return;
    }

    if (!formData.icon.startsWith('http://') && !formData.icon.startsWith('https://')) {
      toast.error('Icon must be a valid URL (http:// or https://)');
      return;
    }

    if (formData.criteria.threshold < 1) {
      toast.error('Threshold must be at least 1');
      return;
    }

    // Remove topic if empty
    const payload = {
      ...formData,
      criteria: {
        ...formData.criteria,
        ...(formData.criteria.topic ? { topic: formData.criteria.topic } : {}),
      }
    };

    try {
      await badgeAdminAPI.createBadge(payload);
      toast.success('Badge created successfully!');
      setShowCreateModal(false);
      fetchBadges();
      setFormData({
        name: '',
        description: '',
        icon: '',
        criteria: {
          type: 'xp_milestone',
          threshold: 100,
          topic: '',
        },
        rarity: 'common',
        xpReward: 0,
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.errorDetails?.[0]?.message ||
        error.response?.data?.message ||
        'Failed to create badge';
      toast.error('Failed to create badge', {
        description: errorMsg
      });
    }
  };

  const handleAwardBadge = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend validation
    if (!awardData.userId || awardData.userId.trim() === '') {
      toast.error('Please select a user');
      return;
    }

    if (!awardData.badgeId || awardData.badgeId.trim() === '') {
      toast.error('Please select a badge');
      return;
    }

    // Ensure we're sending clean data
    const payload = {
      userId: awardData.userId.trim(),
      badgeId: awardData.badgeId.trim(),
      ...(awardData.reason && awardData.reason.trim() ? { reason: awardData.reason.trim() } : {})
    };

    console.log('Awarding badge with payload:', payload);
    console.log('Award data before cleaning:', awardData);

    try {
      const response = await badgeAdminAPI.awardBadge(payload);
      console.log('Award response:', response);
      toast.success('Badge awarded successfully!');
      setShowAwardModal(false);
      setAwardData({ userId: '', badgeId: '', reason: '' });
      setSearchQuery('');
    } catch (error: any) {
      console.error('Award badge error:', error);
      console.error('Error response:', JSON.stringify(error.response?.data, null, 2));
      console.error('Error status:', error.response?.status);
      console.error('Full error response data:', error.response?.data);

      const errorMsg = error.response?.data?.errorDetails?.[0]?.message ||
        error.response?.data?.message ||
        'Failed to award badge';

      // Show detailed error
      const errorDetails = error.response?.data?.errorDetails?.map((e: any) => e.message).join(', ');

      toast.error('Failed to award badge', {
        description: errorDetails || errorMsg
      });
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

  const iconUrls = [
    // Achievement Icons
    'https://cdn-icons-png.flaticon.com/512/744/744874.png', // Trophy Gold
    'https://cdn-icons-png.flaticon.com/512/744/744880.png', // Gold Medal
    'https://cdn-icons-png.flaticon.com/512/2583/2583910.png', // Medal
    'https://cdn-icons-png.flaticon.com/512/2583/2583788.png', // Crown
    'https://cdn-icons-png.flaticon.com/512/179/179386.png', // Badge

    // Premium Icons
    'https://cdn-icons-png.flaticon.com/512/7794/7794865.png', // Diamond
    'https://cdn-icons-png.flaticon.com/512/1828/1828884.png', // Star
    'https://cdn-icons-png.flaticon.com/512/2553/2553642.png', // Gem
    'https://cdn-icons-png.flaticon.com/512/3364/3364044.png', // Crystal

    // Power Icons
    'https://cdn-icons-png.flaticon.com/512/785/785116.png', // Fire
    'https://cdn-icons-png.flaticon.com/512/3094/3094837.png', // Lightning
    'https://cdn-icons-png.flaticon.com/512/1670/1670983.png', // Rocket
    'https://cdn-icons-png.flaticon.com/512/743/743119.png', // Muscle
    'https://cdn-icons-png.flaticon.com/512/2621/2621040.png', // Target

    // Learning Icons
    'https://cdn-icons-png.flaticon.com/512/2769/2769339.png', // Brain
    'https://cdn-icons-png.flaticon.com/512/2702/2702154.png', // Books
    'https://cdn-icons-png.flaticon.com/512/3976/3976625.png', // Graduate
    'https://cdn-icons-png.flaticon.com/512/864/864685.png', // Lightbulb
    'https://cdn-icons-png.flaticon.com/512/2232/2232688.png', // Certificate
    'https://cdn-icons-png.flaticon.com/512/3414/3414151.png', // Owl (Wisdom)

    // Streak & Progress
    'https://cdn-icons-png.flaticon.com/512/4436/4436481.png', // Flame Streak
    'https://cdn-icons-png.flaticon.com/512/2785/2785482.png', // Calendar Check
    'https://cdn-icons-png.flaticon.com/512/3524/3524388.png', // Progress Chart
    'https://cdn-icons-png.flaticon.com/512/5610/5610944.png', // Achievement Star

    // Special
    'https://cdn-icons-png.flaticon.com/512/2965/2965260.png', // Magic Wand
    'https://cdn-icons-png.flaticon.com/512/2706/2706962.png', // Puzzle
    'https://cdn-icons-png.flaticon.com/512/2965/2965358.png', // Shield
    'https://cdn-icons-png.flaticon.com/512/1533/1533913.png', // Sword
  ];

  return (
    <div className="min-h-screen bg-page-gradient p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-card border border-border/50 rounded-xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Badge & Achievement Management</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Create badges, set criteria, and manually award achievements</p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowAwardModal(true)}
                className="flex-1 sm:flex-none bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg hover:shadow-lg hover:scale-105 transition-all text-xs sm:text-sm lg:text-base font-medium"
              >
                Award Badge
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex-1 sm:flex-none bg-gradient-to-r from-green-600 to-teal-600 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg hover:shadow-lg hover:scale-105 transition-all text-xs sm:text-sm lg:text-base font-medium"
              >
                + Create Badge
              </button>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        {loading ? (
          <div className="text-center py-12 bg-card border border-border/50 rounded-xl shadow-xl">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-4 border-primary mx-auto"></div>
            <p className="text-sm sm:text-base text-muted-foreground mt-3 sm:mt-4">Loading badges...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {badges.map((badge) => (
              <div key={badge._id} className="bg-card border border-border/50 rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 hover:shadow-2xl hover:scale-105 transition-all">
                <div className="text-center">
                  {/* Badge Icon */}
                  {badge.icon && badge.icon.startsWith('http') ? (
                    <img
                      src={badge.icon}
                      alt={badge.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 object-contain"
                    />
                  ) : (
                    <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">{badge.icon || '🏆'}</div>
                  )}

                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-2">{badge.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">{badge.description}</p>

                  <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    <span className="px-2 sm:px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-[10px] sm:text-xs font-medium">
                      {badge.category}
                    </span>
                    {badge.xpRequired && (
                      <span className="px-2 sm:px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-[10px] sm:text-xs font-medium">
                        {badge.xpRequired} XP
                      </span>
                    )}
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3 mb-3 sm:mb-4 border-2 border-border/50">
                    <p className="text-xs sm:text-sm text-muted-foreground">Earned by</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{badge.earnedByCount}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">users</p>
                  </div>

                  <button
                    onClick={() => handleDeleteBadge(badge._id)}
                    className="w-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 py-2 sm:py-2.5 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 hover:scale-105 transition-all font-medium text-xs sm:text-sm"
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
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 max-h-[90vh] overflow-y-auto border border-border">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Create New Badge</h2>
              <form onSubmit={handleCreateBadge} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2">
                    Badge Name <span className="text-red-500">*</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground ml-2">(3-100 characters)</span>
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={100}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm sm:text-base"
                    placeholder="e.g., Quiz Master"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2">
                    Description <span className="text-red-500">*</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground ml-2">(10-500 characters)</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    minLength={10}
                    maxLength={500}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm sm:text-base"
                    placeholder="Complete 50 quizzes with perfect scores"
                  />
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{formData.description.length}/500</p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2">
                    Icon URL <span className="text-red-500">*</span>
                  </label>

                  {/* Preview selected icon */}
                  {formData.icon && (
                    <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-muted/50 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <img src={formData.icon} alt="Selected icon" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-foreground">Selected Icon</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{formData.icon}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <input
                    type="url"
                    required
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary mb-2 sm:mb-3 bg-background text-foreground text-sm sm:text-base"
                    placeholder="https://example.com/icon.png or select below"
                  />

                  <p className="text-xs sm:text-sm font-medium text-foreground mb-2">📦 Select from preset icons:</p>
                  <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-7 gap-1.5 sm:gap-2 max-h-48 overflow-y-auto p-2 bg-muted/30 rounded-lg border border-border/50">
                    {iconUrls.map((iconUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: iconUrl })}
                        className={`p-1.5 sm:p-2 rounded-lg border-2 transition-all hover:scale-110 ${formData.icon === iconUrl
                            ? 'border-primary bg-primary/10 shadow-lg'
                            : 'border-transparent hover:border-primary/50 bg-card'
                          }`}
                        title={`Icon ${idx + 1}`}
                      >
                        <img src={iconUrl} alt={`icon-${idx}`} className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2">
                      Criteria Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.criteria.type}
                      onChange={(e) => setFormData({
                        ...formData,
                        criteria: {
                          ...formData.criteria,
                          type: e.target.value as any
                        }
                      })}
                      className="w-full px-3 sm:px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm sm:text-base"
                    >
                      <option value="xp_milestone">XP Milestone</option>
                      <option value="lessons_completed">Lessons Completed</option>
                      <option value="quiz_perfect">Perfect Quiz Scores</option>
                      <option value="streak">Login Streak</option>
                      <option value="flashcard_mastered">Flashcards Mastered</option>
                      <option value="topic_mastered">Topic Mastered</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2">
                      Threshold <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.criteria.threshold}
                      onChange={(e) => setFormData({
                        ...formData,
                        criteria: {
                          ...formData.criteria,
                          threshold: Number(e.target.value)
                        }
                      })}
                      className="w-full px-3 sm:px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm sm:text-base"
                      placeholder="e.g., 100"
                    />
                  </div>
                </div>

                {formData.criteria.type === 'topic_mastered' && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2">
                      Topic (Required for Topic Mastered)
                    </label>
                    <input
                      type="text"
                      value={formData.criteria.topic}
                      onChange={(e) => setFormData({
                        ...formData,
                        criteria: {
                          ...formData.criteria,
                          topic: e.target.value
                        }
                      })}
                      className="w-full px-3 sm:px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm sm:text-base"
                      placeholder="e.g., JavaScript"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2">
                      Rarity <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.rarity}
                      onChange={(e) => setFormData({ ...formData, rarity: e.target.value as any })}
                      className="w-full px-3 sm:px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm sm:text-base"
                    >
                      <option value="common">Common</option>
                      <option value="rare">Rare</option>
                      <option value="epic">Epic</option>
                      <option value="legendary">Legendary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2">
                      XP Reward
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.xpReward}
                      onChange={(e) => setFormData({ ...formData, xpReward: Number(e.target.value) })}
                      className="w-full px-3 sm:px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm sm:text-base"
                      placeholder="e.g., 50"
                    />
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4 pt-3 sm:pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-2.5 sm:py-3 rounded-lg hover:shadow-lg hover:scale-105 transition-all font-medium text-sm sm:text-base"
                  >
                    Create Badge
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-muted text-muted-foreground py-2.5 sm:py-3 rounded-lg hover:bg-muted/80 hover:scale-105 transition-all font-medium text-sm sm:text-base"
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
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-card rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto border border-border">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Manually Award Badge</h2>
              <form onSubmit={handleAwardBadge} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2">
                    Search User <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm sm:text-base"
                      placeholder="Type name or email to search database..."
                    />
                    {searchingUsers && (
                      <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    🔍 Searching from database - minimum 2 characters
                  </p>

                  {/* User Search Results */}
                  {searchQuery && searchQuery.length >= 2 && (
                    <div className="mt-2 max-h-64 overflow-y-auto border border-border rounded-lg bg-card shadow-lg">
                      {searchingUsers ? (
                        <div className="p-4 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-muted-foreground text-xs sm:text-sm">Searching database...</p>
                        </div>
                      ) : users.length > 0 ? (
                        <div className="divide-y divide-border">
                          <div className="p-2 bg-muted/50 text-[10px] sm:text-xs text-muted-foreground font-medium">
                            Found {users.length} user{users.length > 1 ? 's' : ''}
                          </div>
                          {users.map((user) => (
                            <button
                              key={user._id}
                              type="button"
                              onClick={() => {
                                console.log('Selected user:', user);
                                console.log('Setting userId to:', user._id);
                                setAwardData({ ...awardData, userId: user._id });
                                setSearchQuery(`${user.name} (${user.email})`);
                                setUsers([]);
                              }}
                              className="w-full p-2 sm:p-3 hover:bg-muted/50 text-left transition-colors flex items-center gap-2 sm:gap-3"
                            >
                              <img
                                src={user.profilePicture || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10B981&color=fff`}
                                alt={user.name}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-green-200"
                                onError={(e) => {
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`;
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm sm:text-base text-foreground truncate">{user.name}</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{user.email}</p>
                                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                                  {user.role}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-muted-foreground text-sm mb-1">No users found in database</p>
                          <p className="text-xs text-muted-foreground">Try different search terms</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Selected User ID Display */}
                  {awardData.userId && (
                    <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-muted/50 border border-border/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-green-600">✓</span>
                        <p className="text-[10px] sm:text-xs font-medium text-foreground">Selected User:</p>
                      </div>
                      <p className="text-xs sm:text-sm font-mono text-muted-foreground bg-background px-2 py-1 rounded break-all">{awardData.userId}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2">
                    Badge <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={awardData.badgeId}
                    onChange={(e) => setAwardData({ ...awardData, badgeId: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm sm:text-base"
                  >
                    <option value="">Select a badge</option>
                    {badges.map((badge) => (
                      <option key={badge._id} value={badge._id}>
                        {badge.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2">Reason (Optional)</label>
                  <textarea
                    rows={3}
                    value={awardData.reason}
                    onChange={(e) => setAwardData({ ...awardData, reason: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm sm:text-base"
                    placeholder="Why are you awarding this badge?"
                  />
                </div>

                <div className="flex gap-3 sm:gap-4 pt-3 sm:pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-2.5 sm:py-3 rounded-lg hover:shadow-lg hover:scale-105 transition-all font-medium text-sm sm:text-base"
                  >
                    Award Badge
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAwardModal(false)}
                    className="flex-1 bg-muted text-muted-foreground py-2.5 sm:py-3 rounded-lg hover:bg-muted/80 hover:scale-105 transition-all font-medium text-sm sm:text-base"
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
