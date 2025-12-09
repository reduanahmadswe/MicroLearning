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
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  Sparkles,
  TrendingUp,
  Filter,
  ChevronRight,
  Heart,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { friendsAPI } from '@/services/api.service';
import { toast } from 'sonner';

interface Friend {
  _id: string;
  friend: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
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
    profilePicture?: string;
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when tab changes
    if (activeTab === 'friends') {
      loadFriends();
    } else if (activeTab === 'requests') {
      loadRequests();
    } else if (activeTab === 'suggestions') {
      loadSuggestions(1);
    }
  }, [activeTab]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (activeTab === 'suggestions') {
      loadSuggestions(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const loadFriends = async () => {
    try {
      setLoading(true);
      const response = await friendsAPI.getFriends();
      const responseData = response.data.data;
      console.log('👥 Friends response:', responseData);

      // Backend now returns { friends: [], pagination: {} }
      const friendsData = responseData?.friends || responseData;
      setFriends(Array.isArray(friendsData) ? friendsData : []);

      // Update pagination if available
      if (responseData?.pagination) {
        setTotalPages(responseData.pagination.totalPages || 1);
        setTotalItems(responseData.pagination.total || 0);
      }
    } catch (error: any) {
      toast.error('Failed to load friends');
      console.error('❌ Load friends error:', error);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await friendsAPI.getFriendRequests();
      const requestsData = response.data.data;
      console.log('📬 Friend requests:', requestsData);
      setRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (error: any) {
      toast.error('Failed to load requests');
      console.error('❌ Load requests error:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async (page = 1) => {
    try {
      setLoading(true);
      const response = await friendsAPI.getSuggestions(page, itemsPerPage);
      const suggestionsData = response.data.data;
      const meta = response.data.meta;

      console.log('📊 Suggestions data:', suggestionsData);
      console.log('📊 Pagination meta:', meta);

      // Extract user from nested structure
      const users = Array.isArray(suggestionsData)
        ? suggestionsData.map((item: any) => item.user || item)
        : [];

      setSuggestions(users);
      setCurrentPage(meta?.page || 1);
      setTotalPages(meta?.totalPages || 1);
      setTotalItems(meta?.total || 0);
    } catch (error: any) {
      toast.error('Failed to load suggestions');
      console.error(error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await friendsAPI.sendFriendRequest(userId);
      toast.success('Friend request sent!');
      loadSuggestions(currentPage);
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
    <div className="min-h-screen w-full bg-page-gradient">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                My Friends
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Connect, learn, and grow together</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
            <div className="bg-card rounded-xl border-2 border-green-100 dark:border-green-900/30 p-3 sm:p-4 text-center hover:shadow-lg transition-all">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                {friends.length}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-1">Friends</p>
            </div>
            <div className="bg-card rounded-xl border-2 border-teal-100 dark:border-teal-900/30 p-3 sm:p-4 text-center hover:shadow-lg transition-all">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                {requests.length}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-1">Requests</p>
            </div>
            <div className="bg-card rounded-xl border-2 border-emerald-100 dark:border-emerald-900/30 p-3 sm:p-4 text-center hover:shadow-lg transition-all">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                {totalItems || suggestions.length}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-1">Suggestions</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 sm:mb-8 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 sm:gap-3 min-w-max pb-2">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 font-semibold rounded-xl sm:rounded-2xl transition-all text-sm sm:text-base whitespace-nowrap ${activeTab === 'friends'
                ? 'bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 text-white shadow-lg scale-105'
                : 'bg-card text-muted-foreground hover:bg-secondary border-2 border-border'
                }`}
            >
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>My Friends</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'friends' ? 'bg-white/20' : 'bg-muted text-muted-foreground'
                }`}>
                {friends.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 font-semibold rounded-xl sm:rounded-2xl transition-all text-sm sm:text-base whitespace-nowrap relative ${activeTab === 'requests'
                ? 'bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 text-white shadow-lg scale-105'
                : 'bg-card text-muted-foreground hover:bg-secondary border-2 border-border'
                }`}
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Requests</span>
              {requests.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'requests' ? 'bg-white/20' : 'bg-red-500 text-white'
                  }`}>
                  {requests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 font-semibold rounded-xl sm:rounded-2xl transition-all text-sm sm:text-base whitespace-nowrap ${activeTab === 'suggestions'
                ? 'bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 text-white shadow-lg scale-105'
                : 'bg-card text-muted-foreground hover:bg-secondary border-2 border-border'
                }`}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Discover</span>
            </button>
          </div>
        </div>
        {activeTab === 'friends' && (
          <>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search friends by name..."
                  className="w-full pl-12 pr-4 py-3 sm:py-4 bg-background border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/30 transition-all outline-none text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Friends List */}
            {loading ? (
              <div className="flex flex-col justify-center items-center py-16 sm:py-24">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-green-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 sm:w-20 sm:h-20 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Loading friends...</p>
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="bg-card rounded-2xl sm:rounded-3xl shadow-xl border-2 border-border p-8 sm:p-16 text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                  {friends.length === 0 ? 'No Friends Yet' : 'No Friends Found'}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto">
                  {friends.length === 0
                    ? 'Start connecting with fellow students to learn together, compete in quizzes, and share your journey!'
                    : 'Try a different search term to find your friends'}
                </p>
                {friends.length === 0 && (
                  <button
                    onClick={() => setActiveTab('suggestions')}
                    className="bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold py-3 px-8 rounded-xl hover:shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Discover Friends</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredFriends.map((friendship) => {
                  const friend = friendship.friend;
                  if (!friend) return null;
                  return (
                    <div
                      key={friendship._id}
                      className="bg-card rounded-2xl shadow-lg border-2 border-border p-5 sm:p-6 hover:shadow-2xl hover:scale-[1.02] transition-all group"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl overflow-hidden ring-4 ring-green-100 dark:ring-green-900/30 group-hover:ring-green-200 dark:group-hover:ring-green-800/50 transition-all">
                            {friend?.profilePicture ? (
                              <img
                                src={friend.profilePicture}
                                alt={friend.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              friend?.name?.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-card flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground text-base sm:text-lg truncate">{friend.name}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{friend.email}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-semibold text-muted-foreground">Friend</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 rounded-lg sm:rounded-xl border border-green-100 dark:border-green-900/30">
                          <span className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm font-medium">
                            <Zap className="w-4 h-4 text-green-600" />
                            Level
                          </span>
                          <span className="font-bold text-green-600 dark:text-green-500 text-sm sm:text-base">
                            {friend.level || 1}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10 rounded-lg sm:rounded-xl border border-teal-100 dark:border-teal-900/30">
                          <span className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm font-medium">
                            <Trophy className="w-4 h-4 text-teal-600" />
                            Experience
                          </span>
                          <span className="font-bold text-teal-600 dark:text-teal-500 text-sm sm:text-base">
                            {friend.xp?.toLocaleString() || 0}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm">
                          <MessageCircle className="w-4 h-4" />
                          <span>Message</span>
                        </button>
                        <button
                          onClick={() => handleRemoveFriend(friendship._id)}
                          className="bg-card border-2 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-semibold p-2.5 sm:p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-300 dark:hover:border-red-900 transition-all"
                          title="Remove friend"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'requests' && (
          <>
            {loading ? (
              <div className="flex flex-col justify-center items-center py-16 sm:py-24">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-teal-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 sm:w-20 sm:h-20 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-card rounded-2xl sm:rounded-3xl shadow-xl border-2 border-border p-8 sm:p-16 text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-teal-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">No Pending Requests</h3>
                <p className="text-sm sm:text-base text-muted-foreground">You're all caught up! Check back later for new friend requests.</p>
              </div>
            ) : (
              <>
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-2 border-teal-200 dark:border-teal-900/30 rounded-xl sm:rounded-2xl">
                  <p className="text-xs sm:text-sm text-teal-800 dark:text-teal-300 font-medium flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    <span>You have <strong>{requests.length}</strong> pending friend {requests.length === 1 ? 'request' : 'requests'}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {requests.map((request) => {
                    const user = request.from;
                    if (!user) return null;
                    return (
                      <div
                        key={request._id}
                        className="bg-white rounded-2xl shadow-lg border-2 border-teal-100 p-5 sm:p-6 hover:shadow-2xl hover:scale-[1.02] transition-all group"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl overflow-hidden ring-4 ring-teal-100 group-hover:ring-teal-200 transition-all">
                              {user?.profilePicture ? (
                                <img
                                  src={user.profilePicture}
                                  alt={user.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                user?.name?.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center">
                              <Clock className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">{user.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg sm:rounded-xl border border-teal-100">
                            <span className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm font-medium">
                              <Zap className="w-4 h-4 text-teal-600" />
                              Level
                            </span>
                            <span className="font-bold text-teal-600 text-sm sm:text-base">
                              {user.level || 1}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptRequest(request._id)}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request._id)}
                            className="bg-white border-2 border-gray-200 text-gray-600 font-semibold p-2.5 sm:p-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                            title="Reject request"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'suggestions' && (
          <>
            {loading ? (
              <div className="flex flex-col justify-center items-center py-16 sm:py-24">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-emerald-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 sm:w-20 sm:h-20 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Finding friends for you...</p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border-2 border-gray-100 p-8 sm:p-16 text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No Suggestions Available</h3>
                <p className="text-sm sm:text-base text-gray-600">Check back later for more friend suggestions!</p>
              </div>
            ) : (
              <>
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl sm:rounded-2xl">
                  <p className="text-xs sm:text-sm text-emerald-800 font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Discover <strong>{totalItems || suggestions.length}</strong> students who share your interests</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {suggestions.map((user, index) => {
                    if (!user) return null;
                    return (
                      <div
                        key={user._id || user.email || index}
                        className="bg-card rounded-2xl shadow-lg border-2 border-border p-5 sm:p-6 hover:shadow-2xl hover:scale-[1.02] transition-all group"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl overflow-hidden ring-4 ring-emerald-100 dark:ring-emerald-900/30 group-hover:ring-emerald-200 dark:group-hover:ring-emerald-800/50 transition-all">
                              {user?.profilePicture ? (
                                <img
                                  src={user.profilePicture}
                                  alt={user.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                user?.name?.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-2 border-white flex items-center justify-center">
                              <Sparkles className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-foreground text-base sm:text-lg truncate">{user.name}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Suggested</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 rounded-lg sm:rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                            <span className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm font-medium">
                              <Zap className="w-4 h-4 text-emerald-600" />
                              Level
                            </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-500 text-sm sm:text-base">
                              {user.level || 1}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 rounded-lg sm:rounded-xl border border-green-100 dark:border-green-900/30">
                            <span className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm font-medium">
                              <Trophy className="w-4 h-4 text-green-600" />
                              Experience
                            </span>
                            <span className="font-bold text-green-600 dark:text-green-500 text-sm sm:text-base">
                              {user.xp?.toLocaleString() || 0}
                            </span>
                          </div>
                        </div>

                        {user.commonInterests && user.commonInterests.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-muted-foreground font-semibold mb-2">Common Interests</p>
                            <div className="flex flex-wrap gap-1.5">
                              {user.commonInterests.slice(0, 3).map((interest: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 text-[10px] sm:text-xs font-semibold rounded-full border border-green-200 dark:border-green-900/30"
                                >
                                  {interest}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => handleSendRequest(user._id)}
                          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Add Friend</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {!loading && suggestions.length > 0 && totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-gray-100 p-3 sm:p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                        >
                          Previous
                        </button>

                        <div className="flex items-center gap-1 sm:gap-2">
                          {[...Array(totalPages)].map((_, i) => {
                            const page = i + 1;
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-bold transition-all text-sm ${currentPage === page
                                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg scale-110'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                  {page}
                                </button>
                              );
                            } else if (
                              page === currentPage - 2 ||
                              page === currentPage + 2
                            ) {
                              return <span key={page} className="text-gray-400 text-sm">...</span>;
                            }
                            return null;
                          })}
                        </div>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                        >
                          Next
                        </button>
                      </div>

                      <p className="text-xs text-gray-500 text-center mt-2">
                        Page {currentPage} of {totalPages} • {totalItems} total suggestions
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
