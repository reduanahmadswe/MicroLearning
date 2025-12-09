'use client';

import Link from 'next/link';
import { Ban, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-page-gradient flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-card border-border">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ban className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-4">
            Payment Cancelled
          </h1>

          <p className="text-muted-foreground mb-6">
            You cancelled the payment process. No charges have been made to your account.
          </p>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              You can return to the course page and try again when you're ready.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/courses">
              <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                Browse Courses
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
