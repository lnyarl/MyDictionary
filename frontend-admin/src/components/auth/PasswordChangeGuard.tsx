import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthContext";

export function PasswordChangeGuard() {
	const { admin, isLoading } = useAdminAuth();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-lg">Loading...</div>
			</div>
		);
	}

	if (admin?.mustChangePassword) {
		return <Navigate to="/change-password" replace />;
	}

	return <Outlet />;
}
