import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PasswordChangeGuard } from "./components/auth/PasswordChangeGuard";
import { AdminLayout } from "./components/layout/AdminLayout";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import AdminUsersPage from "./pages/AdminUsersPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import LoginPage from "./pages/LoginPage";
import ReportsPage from "./pages/ReportsPage";
import UserDetailPage from "./pages/UserDetailPage";
import UsersListPage from "./pages/UsersListPage";

function App() {
	return (
		<BrowserRouter>
			<AdminAuthProvider>
				<Routes>
					<Route path="/login" element={<LoginPage />} />

					{/* Protected Routes */}
					<Route element={<AdminLayout />}>
						<Route path="/change-password" element={<ChangePasswordPage />} />

						{/* Routes that require password change */}
						<Route element={<PasswordChangeGuard />}>
							<Route path="/users" element={<UsersListPage />} />
							<Route path="/users/:id" element={<UserDetailPage />} />
							<Route path="/reports" element={<ReportsPage />} />
							<Route path="/admin-users" element={<AdminUsersPage />} />
							<Route path="/" element={<Navigate to="/users" replace />} />
						</Route>
					</Route>
				</Routes>
			</AdminAuthProvider>
		</BrowserRouter>
	);
}

export default App;
