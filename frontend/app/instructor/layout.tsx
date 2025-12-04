'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <ProtectedRoute requireInstructor={true}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
        {/* Main Content */}
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  );
}
