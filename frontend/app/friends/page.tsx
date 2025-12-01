'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  MessageCircle,
  Trophy,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { friendsAPI } from '@/services/api.service';
import { toast } from 'sonner';

interface Friend {
  _id: string;
  friend: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    level?: number;
    xp?: number;
  };
  status: 'pending' | 'accepted';
  createdAt: string;
}

interface FriendRequest {
  _id: string;
  from: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    level?: number;
  };
  status: string;
  createdAt: string;
}

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'suggestions'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'friends') {
      loadFriends();
    } else if (activeTab === 'requests') {
      loadRequests();
    } else if (activeTab === 'suggestions') {
      loadSuggestions();
    }
  }, [activeTab]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const response = await friendsAPI.getFriends();
      setFriends(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load friends');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await friendsAPI.getFriendRequests();
      setRequests(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const response = await friendsAPI.getSuggestions();
      setSuggestions(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load suggestions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await friendsAPI.sendFriendRequest(userId);
      toast.success('Friend request sent!');
      loadSuggestions();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send request');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendsAPI.acceptFriendRequest(requestId);
      toast.success('Friend request accepted!');
      loadRequests();
      loadFriends();
    } catch (error: any) {
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await friendsAPI.rejectFriendRequest(requestId);
      toast.success('Friend request rejected');
      loadRequests();
    } catch (error: any) {
      toast.error('Failed to reject request');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm('Remove this friend?')) return;
    
    try {
      await friendsAPI.removeFriend(friendId);
      toast.success('Friend removed');
      loadFriends();
    } catch (error: any) {
      toast.error('Failed to remove friend');
    }
  };

  const filteredFriends = friends.filter((f) =>
    f.friend?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
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
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-8 h-8 text-blue-600" />
                Friends
              </h1>
              <p className="text-gray-600 mt-1">Connect with fellow learners</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'friends'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <UserCheck className="w-4 h-4 inline mr-2" />
              Friends ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-2 font-medium rounded-lg transition-colors relative ${
                activeTab === 'requests'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Requests ({requests.length})
              {requests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {requests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'suggestions'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Suggestions
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'friends' && (
          <>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search friends..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Friends List */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredFriends.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {friends.length === 0 ? 'No friends yet' : 'No friends found'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {friends.length === 0 
                    ? 'Add friends to learn together and compete!'
                    : 'Try a different search term'}
                </p>
                {friends.length === 0 && (
                  <Button onClick={() => setActiveTab('suggestions')}>
                    Find Friends
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFriends.map((friendship) => {
                  const friend = friendship.friend;
                  return (
                    <Card key={friendship._id} className="hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {friend.avatar ? (
                              <img
                                src={friend.avatar}
                                alt={friend.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              friend.name?.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg">{friend.name}</h3>
                            <p className="text-sm text-gray-600">{friend.email}</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                            <span className="flex items-center gap-2 text-gray-700">
                              <Zap className="w-4 h-4 text-blue-600" />
                              Level
                            </span>
                            <span className="font-semibold text-blue-600">
                              {friend.level || 1}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                            <span className="flex items-center gap-2 text-gray-700">
                              <Trophy className="w-4 h-4 text-purple-600" />
                              XP
                            </span>
                            <span className="font-semibold text-purple-600">
                              {friend.xp?.toLocaleString() || 0}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1" size="sm">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFriend(friendship._id)}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'requests' && (
          <>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : requests.length === 0 ? (
              <Card className="p-12 text-center">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
                <p className="text-gray-600">You're all caught up!</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map((request) => {
                  const user = request.from;
                  return (
                    <Card key={request._id} className="hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              user.name?.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                            <span className="flex items-center gap-2 text-gray-700 text-sm">
                              <Zap className="w-4 h-4 text-blue-600" />
                              Level
                            </span>
                            <span className="font-semibold text-blue-600">
                              {user.level || 1}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            size="sm"
                            onClick={() => handleAcceptRequest(request._id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectRequest(request._id)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'suggestions' && (
          <>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : suggestions.length === 0 ? (
              <Card className="p-12 text-center">
                <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No suggestions</h3>
                <p className="text-gray-600">Check back later for more suggestions!</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.map((user) => (
                  <Card key={user._id} className="hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            user.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
                          <p className="text-sm text-gray-600 truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="flex items-center gap-2 text-gray-700">
                            <Zap className="w-4 h-4 text-blue-600" />
                            Level
                          </span>
                          <span className="font-semibold text-blue-600">
                            {user.level || 1}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                          <span className="flex items-center gap-2 text-gray-700">
                            <Trophy className="w-4 h-4 text-purple-600" />
                            XP
                          </span>
                          <span className="font-semibold text-purple-600">
                            {user.xp?.toLocaleString() || 0}
                          </span>
                        </div>
                      </div>

                      {user.commonInterests && user.commonInterests.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2">Common interests:</p>
                          <div className="flex flex-wrap gap-1">
                            {user.commonInterests.slice(0, 3).map((interest: string) => (
                              <span
                                key={interest}
                                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        className="w-full"
                        size="sm"
                        onClick={() => handleSendRequest(user._id)}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Friend
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
