'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  User,
  MapPin,
  Calendar,
  Trophy,
  Zap,
  Clock,
  BookOpen,
  Award,
  UserPlus,
  UserCheck,
  MessageCircle,
  Share2,
  Heart,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { profileAPI, feedAPI, friendsAPI } from '@/services/api.service';
import { toast } from 'sonner';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  level: number;
  xp: number;
  badges: any[];
  stats: {
    lessonsCompleted: number;
    quizzesCompleted: number;
    currentStreak: number;
    longestStreak: number;
    totalTimeSpent: number;
  };
  createdAt: string;
}

interface Post {
  _id: string;
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  content?: string;
  images?: string[];
  video?: string;
  reactions: any[];
  comments: any[];
  shares: number;
  createdAt: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.userId as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [requestSending, setRequestSending] = useState(false);
  const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'friends'>('none');

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadUserPosts();
      checkFriendStatus();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getPublicProfile(userId);
      setProfile(response.data.data);
    } catch (error: any) {
      toast.error('Failed to load profile');
      console.error(error);
    }
  };

  const loadUserPosts = async () => {
    try {
      setLoading(true);
      const response = await feedAPI.getUserPosts(userId);
      setPosts(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to load posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const checkFriendStatus = async () => {
    try {
      const response = await friendsAPI.getFriends();
      console.log('Full response:', response.data);

      // Handle both array and object responses
      let friends = response.data.data || [];

      // If friends is an object with a friends property, use that
      if (!Array.isArray(friends) && friends.friends) {
        friends = friends.friends;
      }

      // If still not an array, convert to array or use empty array
      if (!Array.isArray(friends)) {
        console.log('Friends is not an array, received:', friends);
        friends = [];
      }

      console.log('Current userId:', userId);
      console.log('Friends array:', friends);
      console.log('First friend structure:', friends[0]);

      // Check if already friends (check both friend._id and friend.friend._id)
      const isFriend = friends.some((f: any) => {
        // Handle both possible structures
        const friendId = f.friend?._id || f._id;
        console.log('Checking friendId:', friendId, 'against userId:', userId);
        return friendId === userId;
      });

      console.log('Is friend?', isFriend);

      if (isFriend) {
        setFriendStatus('friends');
      } else {
        setFriendStatus('none');
      }
    } catch (error) {
      console.error('Failed to check friend status:', error);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      setRequestSending(true);
      await friendsAPI.sendFriendRequest(userId);
      setFriendStatus('pending');
      toast.success('Friend request sent!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setRequestSending(false);
    }
  };

  const handleReaction = async (postId: string, type: string) => {
    try {
      await feedAPI.reactToPost(postId, type);
      loadUserPosts(); // Refresh posts
    } catch (error: any) {
      toast.error('Failed to react');
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-page-gradient">
      {/* Cover & Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 h-48"></div>

      <div className="max-w-6xl mx-auto px-4 -mt-20">
        <Card className="bg-card border-border shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <Avatar className="w-32 h-32 border-4 border-white dark:border-background shadow-lg">
                  <AvatarImage src={profile.profilePicture} />
                  <AvatarFallback className="text-2xl bg-blue-600 text-white">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">
                      {profile.name}
                    </h1>
                    <p className="text-muted-foreground">{profile.email}</p>
                  </div>

                  <div className="flex gap-2">
                    {friendStatus === 'friends' ? (
                      <Button
                        disabled
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Friends
                      </Button>
                    ) : friendStatus === 'pending' ? (
                      <Button
                        disabled
                        variant="outline"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Request Sent
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSendFriendRequest}
                        disabled={requestSending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {requestSending ? 'Sending...' : 'Add Friend'}
                      </Button>
                    )}
                    <Button variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>

                {profile.bio && (
                  <p className="text-foreground mb-4">{profile.bio}</p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Level</p>
                      <p className="font-bold text-foreground">{profile.level}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">XP</p>
                      <p className="font-bold text-foreground">
                        {profile.xp.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Streak</p>
                      <p className="font-bold text-foreground">
                        {profile.stats.currentStreak} days
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lessons</p>
                      <p className="font-bold text-foreground">
                        {profile.stats.lessonsCompleted}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 mb-4">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-2 font-medium rounded-lg transition-colors ${activeTab === 'posts'
                ? 'bg-blue-600 text-white'
                : 'bg-card text-muted-foreground hover:bg-secondary'
              }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-6 py-2 font-medium rounded-lg transition-colors ${activeTab === 'about'
                ? 'bg-blue-600 text-white'
                : 'bg-card text-muted-foreground hover:bg-secondary'
              }`}
          >
            About
          </button>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-3 gap-6 pb-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            {activeTab === 'posts' && (
              <>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : posts.length === 0 ? (
                  <Card className="p-12 text-center bg-card border-border">
                    <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No posts yet
                    </h3>
                    <p className="text-muted-foreground">
                      This user hasn't shared anything yet.
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <Card key={post._id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          {/* Post Header */}
                          <div className="flex items-center gap-3 mb-4">
                            <Avatar>
                              <AvatarImage src={post.user.profilePicture} />
                              <AvatarFallback>
                                {getInitials(post.user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{post.user.name}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(post.createdAt)}
                              </p>
                            </div>
                          </div>

                          {/* Post Content */}
                          {post.content && (
                            <p className="text-foreground mb-4 whitespace-pre-wrap">
                              {post.content}
                            </p>
                          )}

                          {/* Post Images */}
                          {post.images && post.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mb-4">
                              {post.images.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt={`Post image ${idx + 1}`}
                                  className="rounded-lg w-full h-48 object-cover"
                                />
                              ))}
                            </div>
                          )}

                          {/* Post Video */}
                          {post.video && (
                            <video
                              src={post.video}
                              controls
                              className="w-full rounded-lg mb-4"
                            />
                          )}

                          {/* Post Actions */}
                          <div className="flex items-center gap-6 pt-4 border-t">
                            <button
                              onClick={() => handleReaction(post._id, 'like')}
                              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              <Heart className="w-5 h-5" />
                              <span>{post.reactions.length}</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                              <MessageSquare className="w-5 h-5" />
                              <span>{post.comments.length}</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                              <Share2 className="w-5 h-5" />
                              <span>{post.shares}</span>
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'about' && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      Joined
                    </h3>
                    <p className="text-gray-600">{formatDate(profile.createdAt)}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Award className="w-5 h-5 text-muted-foreground" />
                      Achievements
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">Lessons Completed</p>
                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          {profile.stats.lessonsCompleted}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">Quizzes Completed</p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {profile.stats.quizzesCompleted}
                        </p>
                      </div>
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">Current Streak</p>
                        <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                          {profile.stats.currentStreak} days
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">Longest Streak</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          {profile.stats.longestStreak} days
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Badges */}
            {profile.badges && profile.badges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {profile.badges.map((badge: any) => (
                      <div
                        key={badge._id}
                        className="p-2 bg-secondary rounded-lg text-center"
                      >
                        <div className="text-2xl mb-1">{badge.icon}</div>
                        <p className="text-xs text-muted-foreground">{badge.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Learning Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Learning Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Time</span>
                  <span className="font-semibold text-foreground">
                    {Math.round(profile.stats.totalTimeSpent / 60)} mins
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Lessons</span>
                  <span className="font-semibold text-foreground">
                    {profile.stats.lessonsCompleted}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Quizzes</span>
                  <span className="font-semibold text-foreground">
                    {profile.stats.quizzesCompleted}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
