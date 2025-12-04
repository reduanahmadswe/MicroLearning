'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  Calendar,
  DollarSign,
  CheckCircle,
  Eye,
  ArrowLeft,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { coursesAPI } from '@/services/api.service';
import { toast } from 'sonner';

export default function PurchasedCoursesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getPaymentHistory();
      setPayments(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load payment history');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <ShoppingBag className="inline-block w-8 h-8 mr-3 text-blue-600" />
            Purchased Courses
          </h1>
          <p className="text-gray-600">
            View all your course purchases and access your enrolled courses
          </p>
        </div>

        {/* Payment History */}
        {payments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Purchases Yet
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't purchased any courses yet. Browse our course catalog to find something you'd like to learn!
              </p>
              <Link href="/courses">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Browse Courses
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment: any) => (
              <Card key={payment._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Course Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {payment.course?.thumbnail && (
                          <img
                            src={payment.course.thumbnail}
                            alt={payment.course.title}
                            className="w-24 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {payment.course?.title || 'Course'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {payment.course?.topic || 'General'}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {payment.amount} {payment.currency}
                            </span>
                            <span
                              className={`flex items-center gap-1 px-2 py-1 rounded ${
                                payment.paymentStatus === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : payment.paymentStatus === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {payment.paymentStatus === 'completed' && (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              {payment.paymentStatus.charAt(0).toUpperCase() +
                                payment.paymentStatus.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {payment.paymentStatus === 'completed' && (
                      <div className="flex gap-2">
                        <Link href={`/courses/${payment.course._id}`}>
                          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            <Eye className="w-4 h-4 mr-2" />
                            View Course
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Transaction Details */}
                  {payment.transactionId && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Transaction ID: {payment.transactionId}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {payments.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Purchase Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {payments.filter((p) => p.paymentStatus === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600">Completed Purchases</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {payments
                      .filter((p) => p.paymentStatus === 'completed')
                      .reduce((sum, p) => sum + p.amount, 0)}{' '}
                    BDT
                  </p>
                  <p className="text-sm text-gray-600">Total Spent</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {payments.length}
                  </p>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
