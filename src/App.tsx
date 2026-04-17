import { lazy, Suspense, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { posthog } from './lib/posthog';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SupabaseProtectedRoute } from '@/shared/components/SupabaseProtectedRoute';

// ── Lazy routes ─────────────────────────────────────────────────────
const Landing      = lazy(() => import('@/features/landing/pages/Landing'));
const NotFound     = lazy(() => import('@/features/landing/pages/NotFound'));
const Login        = lazy(() => import('@/features/auth/pages/Login'));
const Signup       = lazy(() => import('@/features/auth/pages/Signup'));
const ForgotPassword = lazy(() => import('@/features/auth/pages/ForgotPassword'));
const Dashboard    = lazy(() => import('@/features/links/pages/Dashboard'));
const Admin        = lazy(() => import('@/features/admin/pages/Admin'));
const Billing      = lazy(() => import('@/features/billing/pages/Billing'));

// ── Query client ────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            30_000,          // 30s before refetch on focus
      gcTime:               5 * 60 * 1000,  // 5m cache retention
      retry:                1,
      refetchOnWindowFocus: false,
    },
  },
});

// ── PostHog page tracker ─────────────────────────────────────────────
function PostHogPageTracker() {
  const location = useLocation();
  useEffect(() => {
    posthog.capture('$pageview', { $current_url: window.location.href });
  }, [location.pathname]);
  return null;
}

// ── Helpers ──────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const protected_ = (element: JSX.Element) => (
  <SupabaseProtectedRoute>{element}</SupabaseProtectedRoute>
);

// ── App ──────────────────────────────────────────────────────────────
const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SupabaseAuthProvider>
          <PostHogPageTracker />
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/"               element={<Landing />} />
                <Route path="/login"          element={<Login />} />
                <Route path="/signup"         element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/dashboard"      element={protected_(<Dashboard />)} />
                <Route path="/admin"          element={protected_(<Admin />)} />
                <Route path="/billing"        element={protected_(<Billing />)} />
                <Route path="*"              element={<NotFound />} />
              </Routes>
            </Suspense>
          </TooltipProvider>
        </SupabaseAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
