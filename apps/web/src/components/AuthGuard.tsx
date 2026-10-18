'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // If on the registration or login page, allow access without check
    if (pathname === '/register') {
      setIsAuthenticated(true);
      return;
    }

    const checkAuth = () => {
      try {
        const stored = localStorage.getItem('koru_guardian');
        const hasCookie = typeof document !== 'undefined' && document.cookie.includes('koru_auth=true');
        
        if (stored || hasCookie) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.replace('/register');
        }
      } catch {
        setIsAuthenticated(false);
        router.replace('/register');
      }
    };

    checkAuth();

    const handleAuthUpdate = () => checkAuth();
    window.addEventListener('koru_guardian_updated', handleAuthUpdate);
    window.addEventListener('storage', handleAuthUpdate);

    return () => {
      window.removeEventListener('koru_guardian_updated', handleAuthUpdate);
      window.removeEventListener('storage', handleAuthUpdate);
    };
  }, [pathname, router]);

  // Always render register page directly
  if (pathname === '/register') {
    return <>{children}</>;
  }

  // Loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary animate-pulse">
          <svg 
            viewBox="0 0 24 24" 
            className="w-7 h-7 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round"
          >
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10c0 3.314-2.686 6-6 6s-6-2.686-6-6c0-1.657 1.343-3 3-3s3 1.343 3 3" />
          </svg>
        </div>
        <div>
          <h3 className="font-headline text-lg text-primary font-medium">Entering Sanctuary</h3>
          <p className="font-body text-xs text-on-surface-variant mt-1">Verifying guardian consecration...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated on a protected page, return gate message while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-secondary-container/80 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-2xl">lock</span>
        </div>
        <div className="space-y-1">
          <h3 className="font-headline text-lg text-primary font-medium">Sanctuary Guardian Required</h3>
          <p className="font-body text-xs text-on-surface-variant max-w-xs">
            Please register your family guardian account to enter the living memory sanctuary.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
