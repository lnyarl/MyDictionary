import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { Header } from "./Header";

export function AdminLayout() {
	const { isAuthenticated, isLoading } = useAdminAuth();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-lg">Loading...</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />
			<main>
				<Outlet />
			</main>
		</div>
	);
}
