import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthLayout } from "./components/layout/AuthLayout";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./contexts/AuthProvider";
import { queryClient } from "./lib/api/api";
import AllFeedPage from "./pages/AllFeedPage";
import DefinitionDetailPage from "./pages/DefinitionDetailPage";
import FollowingFeedPage from "./pages/FollowingFeedPage";
import HomePage from "./pages/HomePage";
import ImpersonatePage from "./pages/ImpersonatePage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import SearchResultsPage from "./pages/SearchResultsPage";
import SettingsPage from "./pages/SettingsPage";
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
                  <Route path="/feed/all" element={<AllFeedPage />} />
                  <Route path="/feed/following" element={<FollowingFeedPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/profile/:nickname" element={<ProfilePage />} />
                  <Route path="/word/:term" element={<WordDetailPage />} />
                  <Route path="/definitions/:definitionId" element={<DefinitionDetailPage />} />
                  <Route path="/words/:wordId/edit" element={<WordEditPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
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
