'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Save,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { profileAPI } from '@/services/api.service';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    profilePicture: '',
    phone: '',
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Email state
  const [emailData, setEmailData] = useState({
    email: '',
    password: '',
  });
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState({
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
      const data = response.data.data;

      setProfile({
        name: data.name || '',
        bio: data.bio || '',
        profilePicture: data.profilePicture || '',
        phone: data.phone || '',
      });

      setEmailData({
        email: data.email || '',
        password: '',
      });

      setPreferences({
        interests: data.preferences?.interests || [],
        goals: data.preferences?.goals || [],
        dailyLearningTime: data.preferences?.dailyLearningTime || 30,
        preferredDifficulty: data.preferences?.preferredDifficulty || 'beginner',
        language: data.preferences?.language || 'en',
      });
    } catch (error: any) {
      toast.error('Failed to load profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      await profileAPI.updateProfile(profile);
      toast.success('Profile updated successfully!');
      loadProfile();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setSaving(true);
      await profileAPI.changePassword(passwordData);
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!emailData.password) {
      toast.error('Please enter your password to confirm');
      return;
    }

    try {
      setSaving(true);
      await profileAPI.updateEmail(emailData);
      toast.success('Email updated successfully!');
      setEmailData({ ...emailData, password: '' });
      loadProfile();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update email');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePreferences = async () => {
    try {
      setSaving(true);
      await profileAPI.updatePreferences(preferences);
      toast.success('Preferences updated successfully!');
      loadProfile();
    } catch (error: any) {
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !preferences.interests.includes(newInterest.trim())) {
      setPreferences({
        ...preferences,
        interests: [...preferences.interests, newInterest.trim()],
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setPreferences({
      ...preferences,
      interests: preferences.interests.filter((i) => i !== interest),
    });
  };

  const addGoal = () => {
    if (newGoal.trim() && !preferences.goals.includes(newGoal.trim())) {
      setPreferences({
        ...preferences,
        goals: [...preferences.goals, newGoal.trim()],
      });
      setNewGoal('');
    }
  };

  const removeGoal = (goal: string) => {
    setPreferences({
      ...preferences,
      goals: preferences.goals.filter((g) => g !== goal),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-gradient">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Account Settings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your profile, security, and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${activeTab === 'profile'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                : 'bg-card text-muted-foreground hover:bg-secondary border border-border shadow-sm'
              }`}
          >
            <User className="w-4 h-4" />
            <span className="text-sm sm:text-base">Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${activeTab === 'security'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-card text-muted-foreground hover:bg-secondary border border-border shadow-sm'
              }`}
          >
            <Shield className="w-4 h-4" />
            <span className="text-sm sm:text-base">Security</span>
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${activeTab === 'preferences'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                : 'bg-card text-muted-foreground hover:bg-secondary border border-border shadow-sm'
              }`}
          >
            <Bell className="w-4 h-4" />
            <span className="text-sm sm:text-base">Preferences</span>
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card className="border-0 shadow-lg bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-muted-foreground"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bio
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-muted-foreground"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  value={profile.profilePicture}
                  onChange={(e) => setProfile({ ...profile, profilePicture: e.target.value })}
                  className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-muted-foreground"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-muted-foreground"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Change Password */}
            <Card className="border-0 shadow-lg bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-muted-foreground"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-muted-foreground"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 6 characters with uppercase, lowercase, and number
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-muted-foreground"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleChangePassword}
                    disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {saving ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Change Email */}
            <Card className="border-0 shadow-lg bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Change Email Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    value={emailData.email}
                    onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-muted-foreground"
                    placeholder="Enter new email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Confirm with Password
                  </label>
                  <div className="relative">
                    <input
                      type={showEmailPassword ? 'text' : 'password'}
                      value={emailData.password}
                      onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-muted-foreground"
                      placeholder="Enter your password to confirm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailPassword(!showEmailPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showEmailPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleUpdateEmail}
                    disabled={saving || !emailData.password}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {saving ? 'Updating...' : 'Update Email'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <Card className="border-0 shadow-lg bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
                Learning Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Interests
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                    className="flex-1 px-4 py-2 border border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-muted-foreground"
                    placeholder="Add an interest"
                  />
                  <Button onClick={addInterest} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {preferences.interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm"
                    >
                      {interest}
                      <button
                        onClick={() => removeInterest(interest)}
                        className="hover:text-green-900 dark:hover:text-green-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Learning Goals
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                    className="flex-1 px-4 py-2 border border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-muted-foreground"
                    placeholder="Add a goal"
                  />
                  <Button onClick={addGoal} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {preferences.goals.map((goal) => (
                    <span
                      key={goal}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                    >
                      {goal}
                      <button
                        onClick={() => removeGoal(goal)}
                        className="hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Daily Learning Time */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Daily Learning Time (minutes): {preferences.dailyLearningTime}
                </label>
                <input
                  type="range"
                  min="5"
                  max="480"
                  step="5"
                  value={preferences.dailyLearningTime}
                  onChange={(e) => setPreferences({ ...preferences, dailyLearningTime: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5 min</span>
                  <span>8 hours</span>
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Preferred Difficulty
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setPreferences({ ...preferences, preferredDifficulty: level })}
                      className={`px-4 py-3 rounded-xl font-medium capitalize transition-all ${preferences.preferredDifficulty === level
                          ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                        }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Language
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="bn">বাংলা (Bangla)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleUpdatePreferences}
                  disabled={saving}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Scrollbar Hide */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
