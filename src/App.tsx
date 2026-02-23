// src/App.tsx

import { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";
import { useAuthStore, setupTokenRefresh, selectToken, selectDecodedTid, selectIsLoading } from "./stores/auth";
import { OrgProvider, WorkspaceProvider, ProjectProvider } from "./contexts/workspace";
import { PageLoader } from "./components/LoadingSpinner";
import AuthPageContainer from "./modules/auth/AuthPageContainer";
import OnboardingPage from "./modules/onboarding/OnboardingPage";
import GoogleOAuthCallback from "./modules/auth/oauth/GoogleOAuthCallback";
import GitHubOAuthCallback from "./modules/auth/oauth/GithubOAuthCallback";
import { Toaster } from "sonner";
import AppLayout from "./components/AppLayout";

const DEFAULT_TID = import.meta.env.VITE_DEFAULT_TENANT_ID;

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(selectToken);
  const isLoading = useAuthStore(selectIsLoading);

  // ⛔ IMPORTANT: do NOT unmount routes during loading
  if (!token && !isLoading) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function TenantGate() {
  const token = useAuthStore(selectToken);
  const decodedTid = useAuthStore(selectDecodedTid);
  const isLoading = useAuthStore(selectIsLoading);

  if (isLoading) return <PageLoader />;
  if (!token) return <Navigate to="/auth" replace />;

  return decodedTid === DEFAULT_TID
    ? <Navigate to="/onboarding" replace />
    : <Navigate to="/studio" replace />;
}

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(selectToken);
  const decodedTid = useAuthStore(selectDecodedTid);
  const isLoading = useAuthStore(selectIsLoading);

  if (isLoading) return <PageLoader />;
  if (!token) return <Navigate to="/auth" replace />;

  // If the user is already associated with an organisation, they should never
  // be able to access onboarding even by manually changing the URL.
  if (decodedTid && DEFAULT_TID && decodedTid !== DEFAULT_TID) {
    return <Navigate to="/studio" replace />;
  }

  return <>{children}</>;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(selectToken);
  const isLoading = useAuthStore(selectIsLoading);

  if (isLoading) return <PageLoader />;
  if (token) return <TenantGate />;

  return <>{children}</>;
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
    const cleanup = setupTokenRefresh();
    return cleanup;
  }, [initializeAuth]);

  return <>{children}</>;
}

function AppContent() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path="/auth"
          element={
            <AuthGate>
              <AuthPageContainer />
            </AuthGate>
          }
        />

        <Route path="/oauth/google/callback" element={<GoogleOAuthCallback />} />
        <Route path="/oauth/github/callback" element={<GitHubOAuthCallback />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingGate>
                <OnboardingPage />
              </OnboardingGate>
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <TenantGate />
            </ProtectedRoute>
          }
        />
        <Route element={<AppLayout />}>
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              {/* <OrgProvider>
                <WorkspaceProvider>
                  <ProjectProvider> */}
                    <AppRoutes />
                  {/* </ProjectProvider>
                </WorkspaceProvider>
              </OrgProvider> */}
            </ProtectedRoute>
          }
        />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <OrgProvider>
          <WorkspaceProvider>
            <ProjectProvider>
              <Toaster richColors position="top-right" closeButton />
              <AppContent />
            </ProjectProvider>
          </WorkspaceProvider>
        </OrgProvider>
        
      </AuthInitializer>
    </BrowserRouter>
  );
}