'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { adminAPI } from '@/services/api.service';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalRevenue: number;
  apiCalls: number;
  uptime: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
}

interface PerformanceMetrics {
  cpuUsage: { user: number; system: number };
  memoryUsage: any;
  uptime: number;
  nodeVersion: string;
  platform: string;
}

interface DatabaseHealth {
  status: string;
  collections: number;
  dataSize: number;
  indexSize: number;
  storageSize: number;
}

export default function AdminSystemPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [dbHealth, setDbHealth] = useState<DatabaseHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      const [statsRes, performanceRes, dbHealthRes] = await Promise.all([
        adminAPI.getSystemStats(),
        adminAPI.getPerformanceMetrics(),
        adminAPI.getDatabaseHealth(),
      ]);

      setStats(statsRes.data.data);
      setPerformance(performanceRes.data.data);
      setDbHealth(dbHealthRes.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch system data');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
          <p className="text-white text-xl mt-4">Loading system metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">System Monitoring</h1>
              <p className="text-gray-600 mt-2">Real-time platform statistics and performance metrics</p>
            </div>
            <button
              onClick={fetchSystemData}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>🔄</span>
              Refresh
            </button>
          </div>
        </div>

        {/* Platform Statistics */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Platform Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-blue-600">{stats?.totalUsers.toLocaleString()}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Users (7d)</p>
                  <p className="text-3xl font-bold text-green-600">{stats?.activeUsers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats && stats.totalUsers > 0
                      ? `${((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total`
                      : '0%'}
                  </p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-purple-600">৳{stats?.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* System Info */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <span>💻</span>
                System Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Node Version:</span>
                  <span className="font-medium text-gray-800">{performance?.nodeVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform:</span>
                  <span className="font-medium text-gray-800">{performance?.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime:</span>
                  <span className="font-medium text-gray-800">
                    {performance && formatUptime(performance.uptime)}
                  </span>
                </div>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <span>🧠</span>
                Memory Usage
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">RSS:</span>
                  <span className="font-medium text-gray-800">
                    {stats && formatBytes(stats.memoryUsage.rss)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Heap Total:</span>
                  <span className="font-medium text-gray-800">
                    {stats && formatBytes(stats.memoryUsage.heapTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Heap Used:</span>
                  <span className="font-medium text-gray-800">
                    {stats && formatBytes(stats.memoryUsage.heapUsed)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Database Health */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Database Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {dbHealth?.status === 'connected' ? '✅' : '❌'}
                </div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-xl font-bold text-gray-800 mt-1">{dbHealth?.status}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <div className="text-center">
                <div className="text-4xl mb-2">📚</div>
                <p className="text-sm text-gray-600">Collections</p>
                <p className="text-xl font-bold text-gray-800 mt-1">{dbHealth?.collections}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <div className="text-center">
                <div className="text-4xl mb-2">💾</div>
                <p className="text-sm text-gray-600">Data Size</p>
                <p className="text-xl font-bold text-gray-800 mt-1">
                  {dbHealth && formatBytes(dbHealth.dataSize)}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🗄️</div>
                <p className="text-sm text-gray-600">Storage</p>
                <p className="text-xl font-bold text-gray-800 mt-1">
                  {dbHealth && formatBytes(dbHealth.storageSize)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* API Metrics */}
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">API Metrics</h2>
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-8">
            <div className="text-center">
              <div className="text-5xl mb-4">📊</div>
              <p className="text-sm text-gray-600 mb-2">Total API Calls</p>
              <p className="text-4xl font-bold text-cyan-600">{stats?.apiCalls.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">Last 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
