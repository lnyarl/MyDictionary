import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthLayout } from "./components/layout/AuthLayout";
import { Header } from "./components/layout/Header";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import FeedPage from "./pages/FeedPage";
import FollowersPage from "./pages/FollowersPage";
import FollowingPage from "./pages/FollowingPage";
import HomePage from "./pages/HomePage";
import SearchResultsPage from "./pages/SearchResultsPage";
import SettingsPage from "./pages/SettingsPage";
import UserProfilePage from "./pages/UserProfilePage";
import WordEditPage from "./pages/WordEditPage";

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<div className="min-h-screen flex flex-col">
					<Header />
					<main className="flex-1">
						<Routes>
							<Route path="/" element={<HomePage />} />
							<Route path="/search" element={<SearchResultsPage />} />

							{/* Protected Routes */}
							<Route element={<AuthLayout />}>
								<Route path="/feed" element={<FeedPage />} />
								<Route path="/dashboard" element={<DashboardPage />} />
								<Route path="/words/:wordId/edit" element={<WordEditPage />} />
								<Route path="/settings" element={<SettingsPage />} />
								<Route path="/users/:userId" element={<UserProfilePage />} />
								<Route path="/users/:userId/followers" element={<FollowersPage />} />
								<Route path="/users/:userId/following" element={<FollowingPage />} />
							</Route>
						</Routes>
					</main>
				</div>
				<Toaster />
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
