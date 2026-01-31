import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthLayout } from "./components/layout/AuthLayout";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./contexts/AuthProvider";
import { queryClient } from "./lib/api";
import DashboardPage from "./pages/DashboardPage";
import FeedPage from "./pages/FeedPage";
import FollowersPage from "./pages/FollowersPage";
import FollowingPage from "./pages/FollowingPage";
import HomePage from "./pages/HomePage";
import ImpersonatePage from "./pages/ImpersonatePage";
import NotificationsPage from "./pages/NotificationsPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import SettingsPage from "./pages/SettingsPage";
import UserProfilePage from "./pages/UserProfilePage";
import WordDetailPage from "./pages/WordDetailPage";
import WordEditPage from "./pages/WordEditPage";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <AppLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/auth/impersonate" element={<ImpersonatePage />} />

                <Route element={<AuthLayout />}>
                  <Route path="/feed" element={<Navigate to="/feed/all" replace />} />
                  <Route path="/feed/:tab" element={<FeedPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/word/:term" element={<WordDetailPage />} />
                  <Route path="/words/:wordId/edit" element={<WordEditPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/users/:userId" element={<UserProfilePage />} />
                  <Route path="/users/:userId/followers" element={<FollowersPage />} />
                  <Route path="/users/:userId/following" element={<FollowingPage />} />
                </Route>
              </Routes>
            </AppLayout>
            <Toaster />
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
