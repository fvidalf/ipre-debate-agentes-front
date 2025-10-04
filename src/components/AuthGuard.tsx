'use client';

import { useAuthContext } from '@/components/AuthProvider';
import { LoginView } from '@/views/login';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();
  
  const isLoginPage = pathname === '/login';

  // Handle authenticated user on login page
  useEffect(() => {
    if (isAuthenticated && isLoginPage) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoginPage, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login view if not authenticated and not already on login page
  if (!isAuthenticated && !isLoginPage) {
    return <LoginView />;
  }

  // Don't render anything if authenticated user is on login page (redirect will happen)
  if (isAuthenticated && isLoginPage) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show the protected app content
  return <>{children}</>;
}