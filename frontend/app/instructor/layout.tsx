'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <ProtectedRoute requireInstructor={true}>
      <div className="min-h-screen bg-page-gradient">
        {/* Main Content */}
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  );
}
