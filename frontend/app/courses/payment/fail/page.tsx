'use client';

import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PaymentFailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Failed
          </h1>
          
          <p className="text-gray-600 mb-6">
            Unfortunately, your payment could not be processed. Please try again or contact support if the problem persists.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">
              Your card has not been charged. You can try the payment again.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/courses">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
