import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export function SupabaseProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useSupabaseAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
