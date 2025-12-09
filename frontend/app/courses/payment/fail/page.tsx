'use client';

import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PaymentFailPage() {
  return (
    <div className="min-h-screen bg-page-gradient flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-card border-border">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-4">
            Payment Failed
          </h1>

          <p className="text-muted-foreground mb-6">
            Unfortunately, your payment could not be processed. Please try again or contact support if the problem persists.
          </p>

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-destructive dark:text-red-400">
              Your card has not been charged. You can try the payment again.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/courses">
              <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
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
