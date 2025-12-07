'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminAPI } from '@/services/api.service';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'analytics'>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [content, setContent] = useState<any>({ recentLessons: [], recentQuizzes: [], recentCourses: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/home');
  };

  useEffect(() => {
    loadDashboard();
  }, [activeTab]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'overview') {
        const response = await adminAPI.getStats();
        setStats(response.data.data || {});
      } else if (activeTab === 'users') {
        const params: any = {};
        if (roleFilter !== 'all') params.role = roleFilter;
        if (searchQuery) params.search = searchQuery;
        
        const response = await adminAPI.getUsers(params);
        setUsers(response.data.data || []);
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

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone and will delete all user data.')) return;

    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to ban this user?')) return;

    try {
      await adminAPI.banUser(userId);
      toast.success('User banned successfully');
      loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to unban this user?')) return;

    try {
      await adminAPI.unbanUser(userId);
      toast.success('User unbanned successfully');
      loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to unban user');
    }
  };

  const handlePromoteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to promote this user to Instructor?')) return;

    try {
      await adminAPI.promoteToInstructor(userId);
      toast.success('User promoted to Instructor');
      loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to promote user');
    }
  };

  const handleDemoteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to demote this user to Learner?')) return;

    try {
      await adminAPI.demoteToLearner(userId);
      toast.success('User demoted to Learner');
      loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to demote user');
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-red-100 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <span className="text-xl sm:text-2xl lg:text-3xl">Admin Panel</span>
              </h1>
              <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">Manage platform content and users</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="text-left sm:text-right order-last sm:order-first w-full sm:w-auto">
                <p className="text-xs sm:text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <Link href="/admin/content" className="flex-1 sm:flex-initial">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs sm:text-sm h-9 sm:h-10">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Manage </span>Content
                </Button>
              </Link>
              <Link href="/admin/marketplace" className="flex-1 sm:flex-initial">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-xs sm:text-sm h-9 sm:h-10">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Marketplace
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm h-9 sm:h-10"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 mt-4 sm:mt-5 lg:mt-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 sm:px-4 lg:px-6 py-2 font-medium rounded-lg transition-all text-xs sm:text-sm ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-red-50 border-2 border-red-100'
              }`}
            >
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 sm:px-4 lg:px-6 py-2 font-medium rounded-lg transition-all text-xs sm:text-sm ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-red-50 border-2 border-red-100'
              }`}
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`px-3 sm:px-4 lg:px-6 py-2 font-medium rounded-lg transition-all text-xs sm:text-sm ${
                activeTab === 'content'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-red-50 border-2 border-red-100'
              }`}
            >
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
              Content
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 sm:px-4 lg:px-6 py-2 font-medium rounded-lg transition-all text-xs sm:text-sm ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-red-50 border-2 border-red-100'
              }`}
            >
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
              Analytics
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12 sm:py-16 lg:py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading...</p>
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
                  <Card className="border-2 border-red-100 shadow-sm">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-base sm:text-lg">Top Performers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 sm:space-y-3">
                        {stats.topPerformers?.slice(0, 5).map((user: any, index: number) => (
                          <div key={user.userId} className="flex items-center justify-between p-2 sm:p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0 ${
                                index === 0 ? 'bg-yellow-500' :
                                index === 1 ? 'bg-gray-400' :
                                index === 2 ? 'bg-orange-600' :
                                'bg-gray-300'
                              }`}>
                                {index + 1}
                              </div>
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{user.name}</p>
                                <p className="text-xs text-gray-600 truncate">{user.completedLessons} lessons completed</p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <p className="text-xs sm:text-sm font-semibold text-purple-600">{user.xp} XP</p>
                              <p className="text-xs text-gray-500">Level {user.level}</p>
                            </div>
                          </div>
                        )) || (
                          <p className="text-center text-gray-500 py-6 sm:py-8 text-xs sm:text-sm">No data available</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-red-100 shadow-sm">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-base sm:text-lg">System Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-600 rounded-full"></div>
                            <span className="text-xs sm:text-sm font-medium text-gray-700">Database</span>
                          </div>
                          <span className="text-xs sm:text-sm text-green-600 font-medium">Healthy</span>
                        </div>
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-600 rounded-full"></div>
                            <span className="text-xs sm:text-sm font-medium text-gray-700">API Server</span>
                          </div>
                          <span className="text-xs sm:text-sm text-green-600 font-medium">Running</span>
                        </div>
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-600 rounded-full"></div>
                            <span className="text-xs sm:text-sm font-medium text-gray-700">Storage</span>
                          </div>
                          <span className="text-xs sm:text-sm text-green-600 font-medium">
                            {stats.storageUsed || 0}% used
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full"></div>
                            <span className="text-xs sm:text-sm font-medium text-gray-700">Total Certificates</span>
                          </div>
                          <span className="text-xs sm:text-sm text-blue-600 font-medium">
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
                {/* Search */}
                <Card className="border-2 border-red-100 shadow-sm">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search users..."
                          className="pl-9 sm:pl-10 h-9 sm:h-10 text-xs sm:text-sm bg-white"
                        />
                      </div>
                      <select
                        value={roleFilter}
                        onChange={(e) => {
                          setRoleFilter(e.target.value);
                          loadDashboard();
                        }}
                        className="px-3 py-2 border-2 border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs sm:text-sm h-9 sm:h-10 bg-white"
                      >
                        <option value="all">All Roles</option>
                        <option value="learner">Learner</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                      <Button variant="outline" onClick={loadDashboard} className="border-2 border-red-200 hover:bg-red-50 h-9 sm:h-10 text-xs sm:text-sm">
                        <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Apply
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Users Table */}
                <Card className="border-2 border-red-100 shadow-sm">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">User Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Mobile Card View */}
                    <div className="block lg:hidden space-y-3">
                      {users.filter(user => 
                        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((user) => (
                        <div key={user._id} className="p-3 sm:p-4 bg-red-50 rounded-lg border-2 border-red-100">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold flex-shrink-0">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{user.name}</p>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  user.role === 'admin' ? 'bg-red-100 text-red-700' :
                                  user.role === 'instructor' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {user.role || 'student'}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {user.role !== 'admin' && (
                              user.isActive ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleBanUser(user._id)}
                                  className="text-orange-600 hover:text-orange-700 border-orange-200 text-xs"
                                >
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Ban
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUnbanUser(user._id)}
                                  className="text-green-600 hover:text-green-700 border-green-200 text-xs"
                                >
                                  <Shield className="w-3 h-3 mr-1" />
                                  Unban
                                </Button>
                              )
                            )}
                            {user.role === 'learner' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePromoteUser(user._id)}
                                className="text-blue-600 hover:text-blue-700 border-blue-200 text-xs"
                              >
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Promote
                              </Button>
                            )}
                            {user.role === 'instructor' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDemoteUser(user._id)}
                                className="text-yellow-600 hover:text-yellow-700 border-yellow-200 text-xs"
                              >
                                <Activity className="w-3 h-3 mr-1" />
                                Demote
                              </Button>
                            )}
                            {user.role !== 'admin' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteUser(user._id)}
                                className="text-red-600 hover:text-red-700 border-red-200 text-xs"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Joined</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.filter(user => 
                            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.email?.toLowerCase().includes(searchQuery.toLowerCase())
                          ).map((user) => (
                            <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {user.name?.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{user.name}</p>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  user.role === 'admin' ? 'bg-red-100 text-red-700' :
                                  user.role === 'instructor' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {user.role || 'student'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  {/* Ban/Unban Button */}
                                  {user.role !== 'admin' && (
                                    user.isActive ? (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleBanUser(user._id)}
                                        className="text-orange-600 hover:text-orange-700"
                                        title="Ban User"
                                      >
                                        <AlertCircle className="w-4 h-4" />
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleUnbanUser(user._id)}
                                        className="text-green-600 hover:text-green-700"
                                        title="Unban User"
                                      >
                                        <Shield className="w-4 h-4" />
                                      </Button>
                                    )
                                  )}
                                  
                                  {/* Promote/Demote Button */}
                                  {user.role === 'learner' && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handlePromoteUser(user._id)}
                                      className="text-blue-600 hover:text-blue-700"
                                      title="Promote to Instructor"
                                    >
                                      <TrendingUp className="w-4 h-4" />
                                    </Button>
                                  )}
                                  
                                  {user.role === 'instructor' && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDemoteUser(user._id)}
                                      className="text-yellow-600 hover:text-yellow-700"
                                      title="Demote to Learner"
                                    >
                                      <Activity className="w-4 h-4" />
                                    </Button>
                                  )}
                                  
                                  {/* Delete Button */}
                                  {user.role !== 'admin' && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteUser(user._id)}
                                      className="text-red-600 hover:text-red-700"
                                      title="Delete User"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Content Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  <Card className="border-2 border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5 lg:p-6">
                      <div className="flex items-center justify-between mb-2">
                        <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
                        <span className="text-xl sm:text-2xl font-bold text-gray-900">
                          {content.recentLessons?.length || 0}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">Recent Lessons</p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-green-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5 lg:p-6">
                      <div className="flex items-center justify-between mb-2">
                        <FileText className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-600" />
                        <span className="text-xl sm:text-2xl font-bold text-gray-900">
                          {content.recentQuizzes?.length || 0}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">Recent Quizzes</p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5 lg:p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Award className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-600" />
                        <span className="text-xl sm:text-2xl font-bold text-gray-900">
                          {content.recentCourses?.length || 0}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">Recent Courses</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Content Lists */}
                <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="border-2 border-red-100 shadow-sm">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-base sm:text-lg">Recent Lessons</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {content.recentLessons?.slice(0, 5).map((lesson: any) => (
                          <div key={lesson._id} className="flex items-center justify-between p-2 sm:p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{lesson.title}</p>
                              <p className="text-xs text-gray-600 truncate">
                                by {lesson.author?.name || 'Unknown'} • {lesson.difficulty}
                              </p>
                            </div>
                          </div>
                        )) || <p className="text-center text-gray-500 py-6 sm:py-8 text-xs sm:text-sm">No lessons</p>}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-red-100 shadow-sm">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-base sm:text-lg">Recent Quizzes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {content.recentQuizzes?.slice(0, 5).map((quiz: any) => (
                          <div key={quiz._id} className="flex items-center justify-between p-2 sm:p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{quiz.title || 'Quiz'}</p>
                              <p className="text-xs text-gray-600 truncate">
                                Lesson: {quiz.lesson?.title || 'N/A'}
                              </p>
                            </div>
                          </div>
                        )) || <p className="text-center text-gray-500 py-6 sm:py-8 text-xs sm:text-sm">No quizzes</p>}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-2 border-red-100 shadow-sm">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">Recent Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {content.recentCourses?.slice(0, 6).map((course: any) => (
                        <div key={course._id} className="flex items-center gap-3 p-2 sm:p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Award className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{course.title}</p>
                            <p className="text-xs text-gray-600 truncate">
                              by {course.author?.name || 'Unknown'}
                            </p>
                          </div>
                        </div>
                      )) || <p className="text-center text-gray-500 py-6 sm:py-8 col-span-2 text-xs sm:text-sm">No courses</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-4 sm:space-y-6">
                <Card className="p-8 sm:p-10 lg:p-12 text-center border-2 border-red-100 shadow-sm">
                  <BarChart3 className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
                  <p className="text-gray-600 text-xs sm:text-sm lg:text-base">Detailed analytics and reporting coming soon</p>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
