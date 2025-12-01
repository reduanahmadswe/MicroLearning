'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { getDashboardPath, getDashboardLabel } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackToDashboardProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  showIcon?: boolean;
}

export default function BackToDashboard({ 
  className = '', 
  variant = 'outline',
  showIcon = true 
}: BackToDashboardProps) {
  const { user } = useAuthStore();
  const dashboardPath = getDashboardPath(user?.role);
  const dashboardLabel = getDashboardLabel(user?.role);

  return (
    <Link href={dashboardPath}>
      <Button variant={variant} className={className}>
        {showIcon && <ArrowLeft className="w-4 h-4 mr-2" />}
        {dashboardLabel}
      </Button>
    </Link>
  );
}
