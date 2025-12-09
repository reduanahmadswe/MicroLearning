'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Shield,
  Users,
  BookOpen,
  FileText,
  Award,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  TrendingUp,
  Activity,
  DollarSign,
  AlertCircle,
  LogOut,
  CheckCircle,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminAPI } from '@/services/api.service';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuthStore();
  const tabFromUrl = searchParams.get('tab') as 'overview' | 'users' | 'content' | 'analytics' | null;
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'analytics'>(tabFromUrl || 'overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [content, setContent] = useState<any>({ recentLessons: [], recentQuizzes: [], recentCourses: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [banUserId, setBanUserId] = useState<string | null>(null);
  const [unbanUserId, setUnbanUserId] = useState<string | null>(null);
  const [promoteUserId, setPromoteUserId] = useState<string | null>(null);
  const [demoteUserId, setDemoteUserId] = useState<string | null>(null);

  // Pagination state for users
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/home');
  };

  useEffect(() => {
    loadDashboard();
  }, [activeTab]);

  useEffect(() => {
    // Reload users when search query or role filter changes
    if (activeTab === 'users') {
      loadDashboard();
    }
  }, [searchQuery, roleFilter]);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      if (activeTab === 'overview') {
        const response = await adminAPI.getStats();
        setStats(response.data.data || {});
      } else if (activeTab === 'users') {
        const params: any = {
          limit: 1000, // Request a large limit to get all users
          page: 1
        };
        if (roleFilter !== 'all') params.role = roleFilter;
        if (searchQuery) params.search = searchQuery;

        const response = await adminAPI.getUsers(params);
        const userData = response.data.data || [];
        setUsers(Array.isArray(userData) ? userData : []);
        setCurrentPage(1); // Reset to first page when data loads
      } else if (activeTab === 'content') {
        const response = await adminAPI.getContentStats();
        setContent(response.data.data || {});
      }
    } catch (error: any) {
      toast.error('Failed to load admin data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      await adminAPI.deleteUser(deleteUserId);
      toast.success('User deleted successfully');
      loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteUserId(null);
    }
  };

  const confirmBanUser = async () => {
    if (!banUserId) return;

    try {
      await adminAPI.banUser(banUserId);
      toast.success('User banned successfully');
      loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to ban user');
    } finally {
      setBanUserId(null);
    }
  };

  const confirmUnbanUser = async () => {
    if (!unbanUserId) return;

    try {
      await adminAPI.unbanUser(unbanUserId);
      toast.success('User unbanned successfully');
      loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to unban user');
    } finally {
      setUnbanUserId(null);
    }
  };

  const confirmPromoteUser = async () => {
    if (!promoteUserId) return;

    try {
      await adminAPI.promoteToInstructor(promoteUserId);
      toast.success('User promoted to Instructor');
      loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to promote user');
    } finally {
      setPromoteUserId(null);
    }
  };

  const confirmDemoteUser = async () => {
    if (!demoteUserId) return;

    try {
      await adminAPI.demoteToLearner(demoteUserId);
      toast.success('User demoted to Learner');
      loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to demote user');
    } finally {
      setDemoteUserId(null);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      await adminAPI.deleteContent(contentId);
      toast.success('Content deleted');
      loadDashboard();
    } catch (error: any) {
      toast.error('Failed to delete content');
    }
  };

  return (
    <div className="min-h-screen bg-page-gradient">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-muted-foreground mt-1 text-xs sm:text-sm lg:text-base">Manage platform content and users</p>
              </div>
            </div>

          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 sm:px-5 lg:px-6 py-2.5 font-medium rounded-xl transition-all text-xs sm:text-sm ${activeTab === 'overview'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg scale-105'
                : 'bg-card text-muted-foreground hover:bg-accent border-2 border-border/50 hover:border-border'
                }`}
            >
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 sm:px-5 lg:px-6 py-2.5 font-medium rounded-xl transition-all text-xs sm:text-sm ${activeTab === 'users'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg scale-105'
                : 'bg-card text-muted-foreground hover:bg-accent border-2 border-border/50 hover:border-border'
                }`}
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 sm:px-5 lg:px-6 py-2.5 font-medium rounded-xl transition-all text-xs sm:text-sm ${activeTab === 'content'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg scale-105'
                : 'bg-card text-muted-foreground hover:bg-accent border-2 border-border/50 hover:border-border'
                }`}
            >
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
              Content
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 sm:px-5 lg:px-6 py-2.5 font-medium rounded-xl transition-all text-xs sm:text-sm ${activeTab === 'analytics'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg scale-105'
                : 'bg-card text-muted-foreground hover:bg-accent border-2 border-border/50 hover:border-border'
                }`}
            >
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
              Analytics
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12 sm:py-16 lg:py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-4 sm:p-5 lg:p-6">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 opacity-80" />
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 opacity-60" />
                      </div>
                      <h3 className="text-white/80 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Total Users</h3>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.users?.total || 0}</p>
                      <p className="text-white/70 text-xs sm:text-sm mt-1 sm:mt-2">
                        +{stats.users?.new || 0} new this month
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-4 sm:p-5 lg:p-6">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 opacity-80" />
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 opacity-60" />
                      </div>
                      <h3 className="text-white/80 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Total Content</h3>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{(stats.content?.lessons || 0) + (stats.content?.quizzes || 0) + (stats.content?.courses || 0)}</p>
                      <p className="text-white/70 text-xs sm:text-sm mt-1 sm:mt-2">
                        {stats.content?.lessons || 0} lessons, {stats.content?.quizzes || 0} quizzes
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-4 sm:p-5 lg:p-6">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <Activity className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 opacity-80" />
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 opacity-60" />
                      </div>
                      <h3 className="text-white/80 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Active Users</h3>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.users?.active || 0}</p>
                      <p className="text-white/70 text-xs sm:text-sm mt-1 sm:mt-2">
                        Last 30 days
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-4 sm:p-5 lg:p-6">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 opacity-80" />
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 opacity-60" />
                      </div>
                      <h3 className="text-white/80 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Engagement</h3>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.engagement?.totalQuizAttempts || 0}</p>
                      <p className="text-white/70 text-xs sm:text-sm mt-1 sm:mt-2">
                        Quiz attempts
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="bg-card border-2 border-border/50 shadow-sm">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-base sm:text-lg">Top Performers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 sm:space-y-3">
                        {stats.topPerformers?.slice(0, 5).map((user: any, index: number) => (
                          <div key={user.userId} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0 ${index === 0 ? 'bg-yellow-500' :
                                index === 1 ? 'bg-gray-400' :
                                  index === 2 ? 'bg-orange-600' :
                                    'bg-muted'
                                }`}>
                                {index + 1}
                              </div>
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground text-xs sm:text-sm truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.completedLessons} lessons completed</p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <p className="text-xs sm:text-sm font-semibold text-purple-600">{user.xp} XP</p>
                              <p className="text-xs text-gray-500">Level {user.level}</p>
                            </div>
                          </div>
                        )) || (
                            <p className="text-center text-muted-foreground py-6 sm:py-8 text-xs sm:text-sm">No data available</p>
                          )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-border/50 shadow-sm">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-base sm:text-lg">System Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-600 rounded-full"></div>
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Database</span>
                          </div>
                          <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">Healthy</span>
                        </div>
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-600 rounded-full"></div>
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground">API Server</span>
                          </div>
                          <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">Running</span>
                        </div>
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-600 rounded-full"></div>
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Storage</span>
                          </div>
                          <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                            {stats.storageUsed || 0}% used
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full"></div>
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Total Certificates</span>
                          </div>
                          <span className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">
                            {stats.engagement?.totalCertificates || 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Search and Filter Bar */}
                <div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users..."
                        className="pl-9 h-10 text-sm bg-background border-input focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm h-10 bg-background text-foreground min-w-[140px]"
                    >
                      <option value="all">All Roles</option>
                      <option value="learner">Learner</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Button
                      onClick={loadDashboard}
                      className="bg-green-600 hover:bg-green-700 text-white h-10 px-5 text-sm shadow-sm"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Users Table Card */}
                <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
                  {/* Table Header */}
                  <div className="px-4 sm:px-6 py-4 border-b border-border/50">
                    <h2 className="text-lg font-semibold text-foreground">User Management</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(() => {
                        const filteredUsers = users.filter(user =>
                          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
                        );
                        return `${filteredUsers.length} total users`;
                      })()}
                    </p>
                  </div>

                  {/* Mobile Card View */}
                  <div className="block lg:hidden divide-y divide-gray-100">
                    {(() => {
                      const filteredUsers = users.filter(user =>
                        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
                      );
                      const startIndex = (currentPage - 1) * usersPerPage;
                      const endIndex = startIndex + usersPerPage;
                      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

                      if (paginatedUsers.length === 0) {
                        return (
                          <div className="p-8 text-center">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground text-sm">No users found</p>
                          </div>
                        );
                      }

                      return paginatedUsers.map((user) => {
                        const profileImage = user.profilePicture || user.avatar;
                        return (
                          <div key={user._id} className="p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-start gap-3 mb-3">
                              {profileImage ? (
                                <img
                                  src={profileImage}
                                  alt={user.name || 'User'}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-green-200 flex-shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${profileImage ? 'hidden' : ''}`}>
                                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground text-sm truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${user.role === 'admin' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' :
                                    user.role === 'instructor' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' :
                                      'bg-muted/50 text-muted-foreground border border-border'
                                    }`}>
                                    {user.role || 'learner'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${user.isActive
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                    : 'bg-muted/50 text-muted-foreground border border-border'
                                    }`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                              {user.role !== 'admin' && (
                                user.isActive ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setBanUserId(user._id)}
                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-xs h-8"
                                  >
                                    <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                                    Ban
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setUnbanUserId(user._id)}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 dark:border-green-800 text-xs h-8"
                                  >
                                    <Shield className="w-3.5 h-3.5 mr-1.5" />
                                    Unban
                                  </Button>
                                )
                              )}
                              {user.role === 'learner' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setPromoteUserId(user._id)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-xs h-8"
                                >
                                  <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                                  Promote
                                </Button>
                              )}
                              {user.role === 'instructor' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setDemoteUserId(user._id)}
                                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-xs h-8"
                                >
                                  <Activity className="w-3.5 h-3.5 mr-1.5" />
                                  Demote
                                </Button>
                              )}
                              {user.role !== 'admin' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setDeleteUserId(user._id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 text-xs h-8"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                  Delete
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border/50">
                          <th className="text-left py-3.5 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                          <th className="text-left py-3.5 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                          <th className="text-left py-3.5 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                          <th className="text-left py-3.5 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                          <th className="text-left py-3.5 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(() => {
                          const filteredUsers = users.filter(user =>
                            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.email?.toLowerCase().includes(searchQuery.toLowerCase())
                          );
                          const startIndex = (currentPage - 1) * usersPerPage;
                          const endIndex = startIndex + usersPerPage;
                          const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

                          if (paginatedUsers.length === 0) {
                            return (
                              <tr>
                                <td colSpan={5} className="py-12 text-center">
                                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                  <p className="text-muted-foreground text-sm">No users found</p>
                                </td>
                              </tr>
                            );
                          }

                          return paginatedUsers.map((user) => {
                            const profileImage = user.profilePicture || user.avatar;
                            return (
                              <tr key={user._id} className="hover:bg-muted/50 transition-colors">
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-3">
                                    {profileImage ? (
                                      <img
                                        src={profileImage}
                                        alt={user.name || 'User'}
                                        className="w-9 h-9 rounded-full object-cover border-2 border-green-200 flex-shrink-0"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                        }}
                                      />
                                    ) : null}
                                    <div className={`w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${profileImage ? 'hidden' : ''}`}>
                                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                      <p className="font-medium text-foreground text-sm">{user.name}</p>
                                      <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${user.role === 'admin' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' :
                                    user.role === 'instructor' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' :
                                      'bg-muted/50 text-muted-foreground border border-border'
                                    }`}>
                                    {user.role || 'learner'}
                                  </span>
                                </td>
                                <td className="py-4 px-6">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${user.isActive
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                    : 'bg-muted/50 text-muted-foreground border border-border'
                                    }`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-sm text-muted-foreground">
                                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                                    month: 'numeric',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-1">
                                    {user.role !== 'admin' && (
                                      user.isActive ? (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => setBanUserId(user._id)}
                                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 h-8 w-8 p-0"
                                          title="Ban User"
                                        >
                                          <AlertCircle className="w-4 h-4" />
                                        </Button>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => setUnbanUserId(user._id)}
                                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 h-8 w-8 p-0"
                                          title="Unban User"
                                        >
                                          <Shield className="w-4 h-4" />
                                        </Button>
                                      )
                                    )}

                                    {user.role === 'learner' && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setPromoteUserId(user._id)}
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-8 w-8 p-0"
                                        title="Promote to Instructor"
                                      >
                                        <TrendingUp className="w-4 h-4" />
                                      </Button>
                                    )}

                                    {user.role === 'instructor' && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setDemoteUserId(user._id)}
                                        className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 h-8 w-8 p-0"
                                        title="Demote to Learner"
                                      >
                                        <Activity className="w-4 h-4" />
                                      </Button>
                                    )}

                                    {user.role !== 'admin' && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setDeleteUserId(user._id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                                        title="Delete User"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {(() => {
                    const filteredUsers = users.filter(user =>
                      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

                    if (totalPages <= 1) return null;

                    const getPageNumbers = () => {
                      const pages = [];
                      const showEllipsis = totalPages > 7;

                      if (!showEllipsis) {
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        if (currentPage <= 3) {
                          for (let i = 1; i <= 4; i++) pages.push(i);
                          pages.push('...');
                          pages.push(totalPages);
                        } else if (currentPage >= totalPages - 2) {
                          pages.push(1);
                          pages.push('...');
                          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
                        } else {
                          pages.push(1);
                          pages.push('...');
                          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                          pages.push('...');
                          pages.push(totalPages);
                        }
                      }
                      return pages;
                    };

                    return (
                      <div className="px-4 sm:px-6 py-4 border-t border-border/50 bg-muted/50">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
                          </p>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                              variant="outline"
                              size="sm"
                              className="h-9 px-3 text-xs sm:text-sm border-input hover:bg-card disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Previous
                            </Button>

                            <div className="flex items-center gap-1">
                              {getPageNumbers().map((page, index) =>
                                page === '...' ? (
                                  <span key={`ellipsis-${index}`} className="px-2 text-gray-400 text-sm">...</span>
                                ) : (
                                  <Button
                                    key={page}
                                    onClick={() => setCurrentPage(page as number)}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    className={`h-9 w-9 p-0 text-xs sm:text-sm ${currentPage === page
                                      ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                                      : 'border-input hover:bg-card'
                                      }`}
                                  >
                                    {page}
                                  </Button>
                                )
                              )}
                            </div>

                            <Button
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages}
                              variant="outline"
                              size="sm"
                              className="h-9 px-3 text-xs sm:text-sm border-input hover:bg-card disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Confirm Dialogs */}
                <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this user? This action cannot be undone and will permanently remove their account and data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={confirmDeleteUser}
                        className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
                      >
                        Delete User
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={!!banUserId} onOpenChange={(open) => !open && setBanUserId(null)}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Ban User</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to ban this user? They will no longer be able to log in or access the platform.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={confirmBanUser}
                        className="bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-600"
                      >
                        Ban User
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={!!unbanUserId} onOpenChange={(open) => !open && setUnbanUserId(null)}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Unban User</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to unban this user? They will regain access to all platform features.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={confirmUnbanUser}
                        className="bg-green-600 hover:bg-green-700 text-white focus:ring-green-600"
                      >
                        Unban User
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={!!promoteUserId} onOpenChange={(open) => !open && setPromoteUserId(null)}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Promote to Instructor</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to promote this user to Instructor? They will gain access to course creation tools.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={confirmPromoteUser}
                        className="bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-600"
                      >
                        Promote User
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={!!demoteUserId} onOpenChange={(open) => !open && setDemoteUserId(null)}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Demote to Learner</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to demote this instructor to Learner? They will lose access to instructor tools.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={confirmDemoteUser}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-600"
                      >
                        Demote User
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Content Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  <Card className="border-2 border-blue-100 dark:border-blue-900/30 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5 lg:p-6">
                      <div className="flex items-center justify-between mb-2">
                        <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600 dark:text-blue-400" />
                        <span className="text-xl sm:text-2xl font-bold text-foreground">
                          {content.recentLessons?.length || 0}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Recent Lessons</p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-green-100 dark:border-green-900/30 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5 lg:p-6">
                      <div className="flex items-center justify-between mb-2">
                        <FileText className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-600 dark:text-green-400" />
                        <span className="text-xl sm:text-2xl font-bold text-foreground">
                          {content.recentQuizzes?.length || 0}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Recent Quizzes</p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-purple-100 dark:border-purple-900/30 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5 lg:p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Award className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-600 dark:text-purple-400" />
                        <span className="text-xl sm:text-2xl font-bold text-foreground">
                          {content.recentCourses?.length || 0}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Recent Courses</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Content Lists */}
                <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="border-2 border-border/50 shadow-sm bg-card">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-base sm:text-lg">Recent Lessons</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {content.recentLessons?.slice(0, 5).map((lesson: any) => (
                          <div key={lesson._id} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-xs sm:text-sm truncate">{lesson.title}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                by {lesson.author?.name || 'Unknown'} • {lesson.difficulty}
                              </p>
                            </div>
                          </div>
                        )) || <p className="text-center text-muted-foreground py-6 sm:py-8 text-xs sm:text-sm">No lessons</p>}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-border/50 shadow-sm bg-card">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-base sm:text-lg">Recent Quizzes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {content.recentQuizzes?.slice(0, 5).map((quiz: any) => (
                          <div key={quiz._id} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-xs sm:text-sm truncate">{quiz.title || 'Quiz'}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                Lesson: {quiz.lesson?.title || 'N/A'}
                              </p>
                            </div>
                          </div>
                        )) || <p className="text-center text-muted-foreground py-6 sm:py-8 text-xs sm:text-sm">No quizzes</p>}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-2 border-border/50 shadow-sm bg-card">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">Recent Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {content.recentCourses?.slice(0, 6).map((course: any) => (
                        <div key={course._id} className="flex items-center gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-xs sm:text-sm truncate">{course.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              by {course.author?.name || 'Unknown'}
                            </p>
                          </div>
                        </div>
                      )) || <p className="text-center text-muted-foreground py-6 sm:py-8 col-span-2 text-xs sm:text-sm">No courses</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Analytics Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* User Growth Chart */}
                  <Card className="border-2 border-border/50 shadow-sm bg-card">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        User Growth
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div>
                            <p className="text-xs text-muted-foreground">This Week</p>
                            <p className="text-xl font-bold text-green-600 dark:text-green-400">+{stats.users?.new || 0}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Growth Rate</p>
                            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                              +{stats.users?.total > 0 ? Math.round((stats.users?.new / stats.users?.total) * 100) : 0}%
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Learners</span>
                              <span className="font-medium">{stats.users?.byRole?.learner || 0}</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all"
                                style={{
                                  width: `${stats.users?.total > 0 ? (stats.users?.byRole?.learner / stats.users?.total * 100) : 0}%`
                                }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Instructors</span>
                              <span className="font-medium">{stats.users?.byRole?.instructor || 0}</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{
                                  width: `${stats.users?.total > 0 ? (stats.users?.byRole?.instructor / stats.users?.total * 100) : 0}%`
                                }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Admins</span>
                              <span className="font-medium">{stats.users?.byRole?.admin || 0}</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all"
                                style={{
                                  width: `${stats.users?.total > 0 ? (stats.users?.byRole?.admin / stats.users?.total * 100) : 0}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Content Performance */}
                  <Card className="border-2 border-border/50 shadow-sm bg-card">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        Content Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
                            <p className="text-xs text-muted-foreground">Lessons</p>
                            <p className="text-xl font-bold text-foreground">{stats.content?.lessons || 0}</p>
                          </div>
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <FileText className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
                            <p className="text-xs text-muted-foreground">Quizzes</p>
                            <p className="text-xl font-bold text-foreground">{stats.content?.quizzes || 0}</p>
                          </div>
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <Award className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" />
                            <p className="text-xs text-muted-foreground">Courses</p>
                            <p className="text-xl font-bold text-foreground">{stats.content?.courses || 0}</p>
                          </div>
                          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <Target className="w-5 h-5 text-orange-600 dark:text-orange-400 mb-2" />
                            <p className="text-xs text-muted-foreground">Flashcards</p>
                            <p className="text-xl font-bold text-foreground">{stats.content?.flashcards || 0}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-muted-foreground">Avg Completion Rate</p>
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {stats.engagement?.averageCompletionRate || 0}%
                              </p>
                            </div>
                            <Activity className="w-8 h-8 text-green-600 dark:text-green-400 opacity-50" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Engagement Metrics */}
                <Card className="border-2 border-border/50 shadow-sm bg-card">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                      Engagement Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground mb-1">Lesson Completions</p>
                        <p className="text-2xl font-bold text-foreground">{stats.engagement?.totalLessonCompletions || 0}</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
                        <FileText className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground mb-1">Quiz Attempts</p>
                        <p className="text-2xl font-bold text-foreground">{stats.engagement?.totalQuizAttempts || 0}</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                        <Award className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground mb-1">Certificates</p>
                        <p className="text-2xl font-bold text-foreground">{stats.engagement?.totalCertificates || 0}</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800">
                        <Users className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground mb-1">Active Users</p>
                        <p className="text-2xl font-bold text-foreground">{stats.users?.active || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Quick Stats */}
                  <Card className="border-2 border-border/50 shadow-sm">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-base sm:text-lg">Platform Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">Total Users</p>
                              <p className="text-xs text-muted-foreground">Registered accounts</p>
                            </div>
                          </div>
                          <p className="text-xl font-bold text-blue-600">{stats.users?.total || 0}</p>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">Total Content</p>
                              <p className="text-xs text-muted-foreground">All learning materials</p>
                            </div>
                          </div>
                          <p className="text-xl font-bold text-green-600">
                            {(stats.content?.lessons || 0) + (stats.content?.quizzes || 0) + (stats.content?.courses || 0)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">Engagement Rate</p>
                              <p className="text-xs text-muted-foreground">Active users ratio</p>
                            </div>
                          </div>
                          <p className="text-xl font-bold text-purple-600">
                            {stats.users?.total > 0 ? Math.round((stats.users?.active / stats.users?.total) * 100) : 0}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Insights */}
                  <Card className="border-2 border-border/50 shadow-sm bg-card">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-base sm:text-lg">Key Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground mb-1">Growing Platform</p>
                              <p className="text-xs text-muted-foreground">
                                {stats.users?.new || 0} new users joined in the last 30 days, showing {stats.users?.total > 0 ? Math.round((stats.users?.new / stats.users?.total) * 100) : 0}% growth
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Activity className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground mb-1">High Engagement</p>
                              <p className="text-xs text-muted-foreground">
                                {stats.users?.active || 0} users actively learning with {stats.engagement?.totalLessonCompletions || 0} lessons completed
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Award className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground mb-1">Certification Success</p>
                              <p className="text-xs text-muted-foreground">
                                {stats.engagement?.totalCertificates || 0} certificates awarded to successful learners
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
