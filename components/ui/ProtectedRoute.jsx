'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ 
  children, 
  roles = [], // Empty array means all authenticated users
  redirectTo = '/auth/login'
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    // If not authenticated, redirect to login
    if (!session) {
      router.push(redirectTo);
      return;
    }

    // If roles are specified and user doesn't have required role
    if (roles.length > 0 && !roles.includes(session.user.role)) {
      router.push('/dashboard');
      return;
    }
  }, [session, status, roles, router, redirectTo]);

  // Show loading spinner while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memeriksa akses..." />
      </div>
    );
  }

  // Don't render children if not authenticated or doesn't have required role
  if (!session || (roles.length > 0 && !roles.includes(session.user.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Mengalihkan..." />
      </div>
    );
  }

  return children;
}