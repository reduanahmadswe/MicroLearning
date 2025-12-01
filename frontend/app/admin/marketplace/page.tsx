'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  User,
  Star,
  Flag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { marketplaceAPI } from '@/services/api.service';
import { toast } from 'sonner';

type TabType = 'pending' | 'approved' | 'rejected' | 'reported' | 'sellers';

export default function MarketplaceModerationPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'sellers') {
        const response = await marketplaceAPI.getAllSellers();
        setSellers(response.data.data || []);
      } else {
        const response = await marketplaceAPI.getItemsByStatus(activeTab);
        setItems(response.data.data || []);
      }

      // Load stats
      const statsResponse = await marketplaceAPI.getModerationStats();
      setStats(statsResponse.data.data || {});
    } catch (error: any) {
      toast.error('Failed to load marketplace data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveItem = async (itemId: string) => {
    try {
      await marketplaceAPI.moderateItem(itemId, { status: 'approved' });
      toast.success('Item approved successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve item');
    }
  };

  const handleRejectItem = async (itemId: string) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;

    try {
      await marketplaceAPI.moderateItem(itemId, { status: 'rejected', reason });
      toast.success('Item rejected');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to permanently delete this item?')) return;

    try {
      await marketplaceAPI.deleteItem(itemId);
      toast.success('Item deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleVerifySeller = async (sellerId: string) => {
    try {
      await marketplaceAPI.verifySeller(sellerId);
      toast.success('Seller verified successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to verify seller');
    }
  };

  const handleSuspendSeller = async (sellerId: string) => {
    const reason = prompt('Reason for suspension:');
    if (!reason) return;

    try {
      await marketplaceAPI.suspendSeller(sellerId, { reason });
      toast.success('Seller suspended');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to suspend seller');
    }
  };

  const filteredItems = items.filter((item) =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSellers = sellers.filter((seller) =>
    seller.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seller.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="mb-2">
                  ← Back to Admin
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-8 h-8 text-green-600" />
                Marketplace Moderation
              </h1>
              <p className="text-gray-600 mt-1">Review items, verify sellers, and handle disputes</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending || 0}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.approved || 0}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Reported</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.reported || 0}</p>
                  </div>
                  <Flag className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.revenue || 0}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto">
            {(['pending', 'approved', 'rejected', 'reported', 'sellers'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab === 'pending' && <AlertTriangle className="w-4 h-4 inline mr-2" />}
                {tab === 'approved' && <CheckCircle className="w-4 h-4 inline mr-2" />}
                {tab === 'rejected' && <XCircle className="w-4 h-4 inline mr-2" />}
                {tab === 'reported' && <Flag className="w-4 h-4 inline mr-2" />}
                {tab === 'sellers' && <User className="w-4 h-4 inline mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab === 'sellers' ? 'sellers' : 'items'}...`}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={loadData}>
                <Filter className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : activeTab === 'sellers' ? (
          // Sellers List
          <div className="space-y-4">
            {filteredSellers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500 text-lg">No sellers found</p>
                </CardContent>
              </Card>
            ) : (
              filteredSellers.map((seller) => (
                <Card key={seller._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {seller.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {seller.name}
                            </h3>
                            {seller.isVerified && (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                ✓ Verified
                              </span>
                            )}
                            {seller.isSuspended && (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                                Suspended
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{seller.email}</p>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <ShoppingBag className="w-4 h-4" />
                              {seller.totalItems || 0} items
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              ${seller.totalSales || 0} sales
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              {seller.rating || 0} rating
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {!seller.isVerified && !seller.isSuspended && (
                          <Button
                            size="sm"
                            onClick={() => handleVerifySeller(seller._id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            title="Verify Seller"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Verify
                          </Button>
                        )}
                        
                        {!seller.isSuspended && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSuspendSeller(seller._id)}
                            className="text-red-600 hover:text-red-700"
                            title="Suspend"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          // Items List
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500 text-lg">No items found</p>
                </CardContent>
              </Card>
            ) : (
              filteredItems.map((item) => (
                <Card key={item._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        {item.thumbnail && (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {item.title}
                            </h3>
                            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                              ${item.price}
                            </span>
                            {item.isReported && (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                                <Flag className="w-3 h-3 inline mr-1" />
                                Reported
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {item.description}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Seller: {item.seller?.name || 'Unknown'}</span>
                            <span>{item.category || 'Uncategorized'}</span>
                            <span>{item.downloads || 0} downloads</span>
                            {item.createdAt && (
                              <span>
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {activeTab === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproveItem(item._id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRejectItem(item._id)}
                              className="text-red-600 hover:text-red-700"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteItem(item._id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
