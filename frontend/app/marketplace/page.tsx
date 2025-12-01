'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart,
  DollarSign,
  Search,
  Filter,
  Star,
  TrendingUp,
  Package,
  CreditCard,
  Plus,
  Eye,
  Heart,
  ShoppingBag,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { marketplaceAPI } from '@/services/api.service';
import { toast } from 'sonner';

interface MarketplaceItem {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  category: string;
  seller: {
    _id: string;
    name: string;
  };
  rating: number;
  sales: number;
  tags: string[];
  type: string;
}

export default function MarketplacePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'browse' | 'myItems' | 'purchases'>('browse');
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [myItems, setMyItems] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const categories = ['Courses', 'E-books', 'Templates', 'Study Guides', 'Certificates', 'Tools'];
  const priceRanges = [
    { label: 'All Prices', value: 'all' },
    { label: 'Free', value: 'free' },
    { label: 'Under $10', value: '0-10' },
    { label: '$10 - $50', value: '10-50' },
    { label: '$50+', value: '50+' },
  ];

  useEffect(() => {
    if (activeTab === 'browse') {
      loadItems();
    } else if (activeTab === 'myItems') {
      loadMyItems();
    } else if (activeTab === 'purchases') {
      loadPurchases();
    }
  }, [activeTab, selectedCategory, priceRange]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      if (priceRange !== 'all' && priceRange !== 'free') {
        const [min, max] = priceRange.split('-');
        if (min) params.minPrice = min;
        if (max) params.maxPrice = max;
      }
      if (priceRange === 'free') params.maxPrice = 0;

      const response = await marketplaceAPI.getItems(params);
      setItems(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load items');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyItems = async () => {
    try {
      setLoading(true);
      const response = await marketplaceAPI.getMyItems();
      setMyItems(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load your items');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const response = await marketplaceAPI.getPurchases();
      setPurchases(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load purchases');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (itemId: string, price: number) => {
    if (!confirm(`Purchase this item for $${price}?`)) return;

    try {
      const response = await marketplaceAPI.purchaseItem(itemId);
      const paymentUrl = response.data.data.paymentUrl;
      
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        toast.success('Purchase successful!');
        loadItems();
        loadPurchases();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to purchase');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadItems();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
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
                <ShoppingCart className="w-8 h-8 text-green-600" />
                Marketplace
              </h1>
              <p className="text-gray-600 mt-1">Buy and sell learning resources</p>
            </div>
            <Button
              onClick={() => router.push('/marketplace/create')}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              List Item
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'browse'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4 inline mr-2" />
              Browse
            </button>
            <button
              onClick={() => setActiveTab('myItems')}
              className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'myItems'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              My Items ({myItems.length})
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'purchases'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <CreditCard className="w-4 h-4 inline mr-2" />
              Purchases ({purchases.length})
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            {activeTab === 'browse' && (
              <>
                {/* Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === 'all'
                            ? 'bg-green-100 text-green-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        All Categories
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                            selectedCategory === cat
                              ? 'bg-green-100 text-green-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Price Range */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Price Range</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {priceRanges.map((range) => (
                        <button
                          key={range.value}
                          onClick={() => setPriceRange(range.value)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                            priceRange === range.value
                              ? 'bg-green-100 text-green-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Stats */}
            <Card className="bg-gradient-to-br from-green-600 to-blue-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Marketplace Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/90">Total Items</span>
                  <span className="text-2xl font-bold">{items.length}</span>
                </div>
                {activeTab === 'myItems' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-white/90">Listed</span>
                      <span className="text-2xl font-bold">{myItems.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/90">Total Sales</span>
                      <span className="text-2xl font-bold">
                        {myItems.reduce((sum, item) => sum + (item.sales || 0), 0)}
                      </span>
                    </div>
                  </>
                )}
                {activeTab === 'purchases' && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/90">Purchased</span>
                    <span className="text-2xl font-bold">{purchases.length}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Sellers */}
            {activeTab === 'browse' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Top Sellers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((rank) => (
                      <div key={rank} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {rank}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Seller {rank}</p>
                          <p className="text-xs text-gray-600">{100 - rank * 10} sales</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'browse' && (
              <>
                {/* Search */}
                <Card>
                  <CardContent className="p-4">
                    <form onSubmit={handleSearch} className="flex gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search items..."
                          className="pl-10"
                        />
                      </div>
                      <Button type="submit">Search</Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Items Grid */}
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  </div>
                ) : items.length === 0 ? (
                  <Card className="p-12 text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                    <p className="text-gray-600">Try adjusting your filters</p>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                      <Card key={item._id} className="hover:shadow-xl transition-all hover:-translate-y-1">
                        {item.thumbnail && (
                          <div className="h-48 overflow-hidden rounded-t-lg">
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-2">
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                              {item.category}
                            </span>
                            <button className="text-gray-400 hover:text-red-500">
                              <Heart className="w-5 h-5" />
                            </button>
                          </div>

                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {item.description}
                          </p>

                          <div className="flex items-center gap-2 mb-3 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-medium">{item.rating?.toFixed(1) || 'N/A'}</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">{item.sales || 0} sales</span>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div>
                              <p className="text-2xl font-bold text-green-600">
                                ${item.price.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">by {item.seller?.name}</p>
                            </div>
                            <Button
                              onClick={() => handlePurchase(item._id, item.price)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              Buy
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'myItems' && (
              <>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  </div>
                ) : myItems.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No items listed</h3>
                    <p className="text-gray-600 mb-4">Start selling your learning resources</p>
                    <Button onClick={() => router.push('/marketplace/create')}>
                      <Plus className="w-4 h-4 mr-2" />
                      List Item
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {myItems.map((item) => (
                      <Card key={item._id} className="hover:shadow-lg transition-all">
                        <CardContent className="p-6">
                          <div className="flex gap-6">
                            {item.thumbnail && (
                              <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={item.thumbnail}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                    {item.category}
                                  </span>
                                </div>
                                <p className="text-2xl font-bold text-green-600">
                                  ${item.price.toFixed(2)}
                                </p>
                              </div>
                              <p className="text-gray-600 mb-4">{item.description}</p>
                              <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span>{item.rating?.toFixed(1) || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ShoppingCart className="w-4 h-4 text-green-600" />
                                  <span>{item.sales || 0} sales</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="w-4 h-4 text-blue-600" />
                                  <span>{item.views || 0} views</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                  <span>${((item.sales || 0) * item.price).toFixed(2)} earned</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'purchases' && (
              <>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  </div>
                ) : purchases.length === 0 ? (
                  <Card className="p-12 text-center">
                    <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No purchases yet</h3>
                    <p className="text-gray-600 mb-4">Browse the marketplace to find great resources</p>
                    <Button onClick={() => setActiveTab('browse')}>
                      Browse Items
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {purchases.map((purchase) => {
                      const item = purchase.item;
                      return (
                        <Card key={purchase._id} className="hover:shadow-lg transition-all">
                          <CardContent className="p-6">
                            <div className="flex gap-6">
                              {item.thumbnail && (
                                <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={item.thumbnail}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                                    <p className="text-sm text-gray-600">
                                      Purchased on {new Date(purchase.purchasedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold text-green-600">
                                      ${purchase.price.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {purchase.paymentStatus}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-gray-600 mb-4">{item.description}</p>
                                <div className="flex gap-3">
                                  <Button size="sm">
                                    <Eye className="w-4 h-4 mr-1" />
                                    View Item
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    Download
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
