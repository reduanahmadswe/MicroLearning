'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Users,
  Search,
  Filter,
  TrendingUp,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminAPI } from '@/services/api.service';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function UserManagementPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: any = { 
        limit: 1000
      };
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      if (roleFilter && roleFilter !== 'all') {
        params.role = roleFilter;
      }
      
      console.log('Loading users with params:', params);
      const response = await adminAPI.getUsers(params);
      console.log('Users response:', response.data);
      
      // Backend returns: data: result.users
      setUsers(response.data.data || []);
      setCurrentPage(1); // Reset to first page when filters change
    } catch (error: any) {
      toast.error('Failed to load users');
      console.error('Load users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to ban this user?')) return;
    try {
      await adminAPI.banUser(userId);
      toast.success('User banned successfully');
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to ban user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handlePromoteToInstructor = async (userId: string) => {
    try {
      await adminAPI.promoteToInstructor(userId);
      toast.success('User promoted to Instructor');
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to promote user');
    }
  };

  const handleDemoteToLearner = async (userId: string) => {
    try {
      await adminAPI.demoteToLearner(userId);
      toast.success('User demoted to Learner');
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to demote user');
    }
  };

  // Pagination logic
  const filteredUsers = users;
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => paginate(1)}
          className="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="ellipsis1" className="px-2">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`px-3 py-1 text-sm rounded-lg ${
            currentPage === i
              ? 'bg-green-600 text-white font-medium'
              : 'border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="ellipsis2" className="px-2">...</span>);
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => paginate(totalPages)}
          className="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'instructor':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'learner':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Admin Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 text-sm">{filteredUsers.length} total users</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                className="pl-10 w-full border-2 border-green-100 focus:border-green-300 rounded-xl"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
              }}
              className="px-4 py-2 border-2 border-green-100 rounded-xl focus:outline-none focus:border-green-300 bg-white text-sm"
            >
              <option value="all">All Roles</option>
              <option value="learner">Learner</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
            <Button
              onClick={loadUsers}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 rounded-xl"
            >
              Apply
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <Card className="border-2 border-green-100 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-50 to-teal-50 border-b-2 border-green-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Joined</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentUsers.map((user: any) => {
                    const profileImage = user.profilePicture || user.avatar;
                    return (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {profileImage ? (
                              <img 
                                src={profileImage} 
                                alt={user.name || 'User'}
                                className="w-10 h-10 rounded-full object-cover border-2 border-green-200"
                                onError={(e) => {
                                  // Fallback to gradient avatar if image fails to load
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold ${profileImage ? 'hidden' : ''}`}>
                              {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name || 'Unknown'}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                            user.isActive 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {user.isActive ? 'Active' : 'Banned'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/profile/${user._id}`)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="View Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {user.role === 'learner' && (
                              <button
                                onClick={() => handlePromoteToInstructor(user._id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Promote to Instructor"
                              >
                                <TrendingUp className="w-4 h-4" />
                              </button>
                            )}
                            {user.role === 'instructor' && (
                              <button
                                onClick={() => handleDemoteToLearner(user._id)}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                title="Demote to Learner"
                              >
                                <TrendingUp className="w-4 h-4 rotate-180" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    {renderPaginationButtons()}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
