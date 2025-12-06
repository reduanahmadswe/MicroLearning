'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Calendar,
  Trophy,
  Zap,
  Clock,
  BookOpen,
  Award,
  Settings,
  Camera,
  Save,
  X,
  Edit2,
  Shield,
  Target,
  Globe,
  Bell,
  Lock,
  Star,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Medal,
  Flame,
  Heart,
} from 'lucide-react';
import { profileAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'learner' | 'instructor' | 'admin';
  profilePicture?: string;
  bio?: string;
  level: number;
  xp: number;
  coins: number;
  badges: any[];
  streak: {
    current: number;
    longest: number;
  };
  preferences: {
    interests: string[];
    goals: string[];
    dailyLearningTime: number;
    preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
    language: string;
  };
  isPremium: boolean;
  isVerified: boolean;
  isSuspended: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MyProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'preferences' | 'account'>('profile');

  // Edit form states
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    bio: '',
    profilePicture: '',
  });

  const [editedPreferences, setEditedPreferences] = useState({
    interests: [] as string[],
    goals: [] as string[],
    dailyLearningTime: 30,
    preferredDifficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    language: 'en',
  });

  const [newInterest, setNewInterest] = useState('');
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getMyProfile();
      const profileData = response.data.data;
      setProfile(profileData);
      
      // Initialize edit states
      setEditedProfile({
        name: profileData.name || '',
        bio: profileData.bio || '',
        profilePicture: profileData.profilePicture || '',
      });

      setEditedPreferences({
        interests: profileData.preferences?.interests || [],
        goals: profileData.preferences?.goals || [],
        dailyLearningTime: profileData.preferences?.dailyLearningTime || 30,
        preferredDifficulty: profileData.preferences?.preferredDifficulty || 'beginner',
        language: profileData.preferences?.language || 'en',
      });
    } catch (error: any) {
      toast.error('Failed to load profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await profileAPI.updateProfile(editedProfile);
      toast.success('Profile updated successfully!');
      setEditMode(false);
      loadProfile();
    } catch (error: any) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      await profileAPI.updatePreferences(editedPreferences);
      toast.success('Preferences updated successfully!');
      loadProfile();
    } catch (error: any) {
      toast.error('Failed to update preferences');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !editedPreferences.interests.includes(newInterest.trim())) {
      setEditedPreferences({
        ...editedPreferences,
        interests: [...editedPreferences.interests, newInterest.trim()],
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setEditedPreferences({
      ...editedPreferences,
      interests: editedPreferences.interests.filter((i) => i !== interest),
    });
  };

  const addGoal = () => {
    if (newGoal.trim() && !editedPreferences.goals.includes(newGoal.trim())) {
      setEditedPreferences({
        ...editedPreferences,
        goals: [...editedPreferences.goals, newGoal.trim()],
      });
      setNewGoal('');
    }
  };

  const removeGoal = (goal: string) => {
    setEditedPreferences({
      ...editedPreferences,
      goals: editedPreferences.goals.filter((g) => g !== goal),
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'from-red-600 to-rose-600';
      case 'instructor':
        return 'from-green-600 to-teal-600';
      default:
        return 'from-blue-600 to-cyan-600';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'instructor':
        return Award;
      default:
        return User;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateLevelProgress = () => {
    if (!profile) return 0;
    // Each level requires more XP: Level 1 = 100 XP, Level 2 = 200 XP, etc.
    const xpForNextLevel = (profile.level + 1) * 100;
    const xpProgress = profile.xp % 100; // XP within current level
    const progress = (xpProgress / 100) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 text-xl font-bold mb-2">Profile not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-green-600 hover:text-green-700 font-semibold"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(profile.role);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <span className="bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  My Profile
                </span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2">Manage your account and preferences</p>
            </div>

            <button
              onClick={() => setEditMode(!editMode)}
              className={`self-start sm:self-auto px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                editMode
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:shadow-lg'
              }`}
            >
              {editMode ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden mb-6">
          {/* Cover Image */}
          <div className={`h-32 sm:h-48 bg-gradient-to-r ${getRoleBadgeColor(profile.role)} relative`}>
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          </div>

          {/* Profile Content */}
          <div className="px-4 sm:px-8 pb-6 sm:pb-8">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-end -mt-16 sm:-mt-20">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-green-600 to-teal-600">
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-4xl sm:text-5xl font-bold">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {editMode && (
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white hover:bg-green-700 transition-colors shadow-lg">
                    <Camera className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{profile.name}</h2>
                      {profile.isVerified && (
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {profile.isPremium && (
                        <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-600">{profile.email}</p>
                    </div>

                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${getRoleBadgeColor(profile.role)} text-white font-semibold text-xs`}>
                      <RoleIcon className="w-4 h-4" />
                      <span className="capitalize">{profile.role}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 text-center border border-blue-100">
                      <Trophy className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-gray-900">{profile.level}</p>
                      <p className="text-[10px] text-gray-600">Level</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-3 text-center border border-purple-100">
                      <Zap className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-gray-900">{profile.xp}</p>
                      <p className="text-[10px] text-gray-600">XP</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-3 text-center border border-amber-100">
                      <Medal className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-gray-900">{profile.coins}</p>
                      <p className="text-[10px] text-gray-600">Coins</p>
                    </div>
                  </div>
                </div>

                {/* Level Progress Bar */}
                <div className="mt-4 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-600 to-teal-600 transition-all duration-500"
                    style={{ width: `${calculateLevelProgress()}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(calculateLevelProgress())}% to Level {profile.level + 1}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
          <button
            onClick={() => setActiveSection('profile')}
            className={`px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeSection === 'profile'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Profile Info
          </button>
          <button
            onClick={() => setActiveSection('preferences')}
            className={`px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeSection === 'preferences'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Preferences
          </button>
          <button
            onClick={() => setActiveSection('account')}
            className={`px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeSection === 'account'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Account
          </button>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Info Section */}
            {activeSection === 'profile' && (
              <>
                {/* Bio */}
                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-green-600" />
                      About Me
                    </h3>
                    {editMode && (
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    )}
                  </div>

                  {editMode ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          value={editedProfile.name}
                          onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-gray-900 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                        <textarea
                          value={editedProfile.bio}
                          onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors resize-none text-gray-900 bg-white placeholder:text-gray-400"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Picture URL</label>
                        <input
                          type="text"
                          value={editedProfile.profilePicture}
                          onChange={(e) => setEditedProfile({ ...editedProfile, profilePicture: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-gray-900 bg-white placeholder:text-gray-400"
                          placeholder="https://example.com/profile.jpg"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 leading-relaxed">{profile.bio || 'No bio added yet.'}</p>
                  )}
                </div>

                {/* Streaks & Achievements */}
                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-600" />
                    Streaks & Activity
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                      <Flame className="w-6 h-6 text-orange-600 mb-2" />
                      <p className="text-2xl font-bold text-gray-900">{profile.streak.current}</p>
                      <p className="text-sm text-gray-600">Current Streak</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                      <Trophy className="w-6 h-6 text-purple-600 mb-2" />
                      <p className="text-2xl font-bold text-gray-900">{profile.streak.longest}</p>
                      <p className="text-sm text-gray-600">Longest Streak</p>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-600" />
                    Badges ({profile.badges.length})
                  </h3>

                  {profile.badges.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {profile.badges.map((badge, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-3 text-center border border-green-100"
                        >
                          <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <p className="text-xs font-semibold text-gray-700 line-clamp-2">{badge.name || 'Badge'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Award className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm">No badges earned yet. Keep learning!</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Preferences Section */}
            {activeSection === 'preferences' && (
              <>
                {/* Interests */}
                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-pink-600" />
                      Interests
                    </h3>
                    <button
                      onClick={handleSavePreferences}
                      disabled={saving}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                      placeholder="Add new interest..."
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-900 bg-white placeholder:text-gray-400"
                    />
                    <button
                      onClick={addInterest}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {editedPreferences.interests.length > 0 ? (
                      editedPreferences.interests.map((interest, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-green-100 to-teal-100 text-green-700 px-3 py-1.5 rounded-lg font-medium text-sm flex items-center gap-2"
                        >
                          <span>{interest}</span>
                          <button
                            onClick={() => removeInterest(interest)}
                            className="hover:bg-red-200 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center w-full py-8 text-gray-500">
                        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm">No interests added yet. Add your interests above!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Goals */}
                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Learning Goals
                  </h3>

                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                      placeholder="Add new goal..."
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-900 bg-white placeholder:text-gray-400"
                    />
                    <button
                      onClick={addGoal}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  <div className="space-y-2">
                    {editedPreferences.goals.length > 0 ? (
                      editedPreferences.goals.map((goal, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between"
                        >
                          <span className="text-gray-700 font-medium">{goal}</span>
                          <button
                            onClick={() => removeGoal(goal)}
                            className="text-red-600 hover:bg-red-100 rounded-full p-1.5 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm">No learning goals set yet. Add your goals above!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Learning Preferences */}
                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    Learning Preferences
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Daily Learning Time (minutes)</label>
                      <input
                        type="number"
                        value={editedPreferences.dailyLearningTime}
                        onChange={(e) =>
                          setEditedPreferences({ ...editedPreferences, dailyLearningTime: parseInt(e.target.value) })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Difficulty</label>
                      <select
                        value={editedPreferences.preferredDifficulty}
                        onChange={(e) =>
                          setEditedPreferences({
                            ...editedPreferences,
                            preferredDifficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced',
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-900 bg-white"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                      <select
                        value={editedPreferences.language}
                        onChange={(e) => setEditedPreferences({ ...editedPreferences, language: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-900 bg-white"
                      >
                        <option value="en">English</option>
                        <option value="bn">বাংলা</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Account Section */}
            {activeSection === 'account' && (
              <>
                {/* Account Status */}
                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Account Status
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-700">Email Verified</span>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                          profile.isVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {profile.isVerified ? 'Yes' : 'No'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-amber-600" />
                        <span className="font-medium text-gray-700">Premium Member</span>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                          profile.isPremium ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {profile.isPremium ? 'Active' : 'Free'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-700">Account Active</span>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                          profile.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {profile.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-red-600" />
                        <span className="font-medium text-gray-700">Account Suspended</span>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                          profile.isSuspended ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {profile.isSuspended ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    Account Actions
                  </h3>

                  <div className="space-y-3">
                    <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" />
                      Change Password
                    </button>

                    <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notification Settings
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        router.push('/auth/login');
                      }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Member Since */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Member Since
              </h3>
              <p className="text-gray-700 font-medium">{formatDate(profile.createdAt)}</p>
              <p className="text-sm text-gray-500 mt-1">Last updated: {formatDate(profile.updatedAt)}</p>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Quick Stats
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Total XP</span>
                  <span className="font-bold text-gray-900">{profile.xp}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Level</span>
                  <span className="font-bold text-gray-900">{profile.level}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Coins</span>
                  <span className="font-bold text-gray-900">{profile.coins}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Badges</span>
                  <span className="font-bold text-gray-900">{profile.badges.length}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Interests</span>
                  <span className="font-bold text-gray-900">{editedPreferences.interests.length}</span>
                </div>
              </div>
            </div>

            {/* Upgrade Banner (if not premium) */}
            {!profile.isPremium && (
              <div className="bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold">Upgrade to Premium</h3>
                </div>
                <p className="text-sm text-white text-opacity-90 mb-4">
                  Get unlimited access to all courses, AI features, and exclusive content!
                </p>
                <button className="w-full px-4 py-3 bg-white text-amber-600 rounded-xl font-bold hover:bg-opacity-90 transition-all">
                  Upgrade Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
