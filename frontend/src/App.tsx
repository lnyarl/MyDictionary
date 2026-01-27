import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthLayout } from "./components/layout/AuthLayout";
import { Header } from "./components/layout/Header";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./contexts/AuthProvider";
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
import WordEditPage from "./pages/WordEditPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/auth/impersonate" element={<ImpersonatePage />} />

                {/* Protected Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/feed" element={<FeedPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/words/:wordId/edit" element={<WordEditPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/users/:userId" element={<UserProfilePage />} />
                  <Route path="/users/:userId/followers" element={<FollowersPage />} />
                  <Route path="/users/:userId/following" element={<FollowingPage />} />
                </Route>
              </Routes>
            </main>
          </div>
          <Toaster />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
