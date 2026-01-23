import { LogOut, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { AdminRole } from "../../types/admin.types";
import { Button } from "../ui/button";

export function Header() {
	const { admin, logout } = useAdminAuth();
	const location = useLocation();

	const isActive = (path: string) => location.pathname === path;

	return (
		<header className="bg-white border-b border-gray-200 shadow-sm">
			<div className="container mx-auto px-8 py-4 flex items-center justify-between">
				<div className="flex items-center gap-8">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">Stashy Admin</h1>
						<p className="text-sm text-gray-500">Admin Panel</p>
					</div>
					<nav className="flex gap-4">
						<Link
							to="/users"
							className={`px-3 py-2 rounded-md text-sm font-medium ${
								isActive("/users") ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
							}`}
						>
							Users
						</Link>
						<Link
							to="/reports"
							className={`px-3 py-2 rounded-md text-sm font-medium ${
								isActive("/reports")
									? "bg-gray-100 text-gray-900"
									: "text-gray-600 hover:bg-gray-50"
							}`}
						>
							Reports
						</Link>
						{admin?.role === AdminRole.SUPER_ADMIN && (
							<Link
								to="/admin-users"
								className={`px-3 py-2 rounded-md text-sm font-medium ${
									isActive("/admin-users")
										? "bg-gray-100 text-gray-900"
										: "text-gray-600 hover:bg-gray-50"
								}`}
							>
								Admin Users
							</Link>
						)}
					</nav>
				</div>

				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2 text-sm">
						<User className="w-4 h-4 text-gray-500" />
						<span className="font-medium">{admin?.username}</span>
						{admin?.role && (
							<span
								className={`px-2 py-0.5 rounded text-xs ${
									admin.role === AdminRole.SUPER_ADMIN
										? "bg-purple-100 text-purple-800"
										: admin.role === AdminRole.DEVELOPER
											? "bg-blue-100 text-blue-800"
											: "bg-gray-100 text-gray-800"
								}`}
							>
								{admin.role === AdminRole.SUPER_ADMIN
									? "Super Admin"
									: admin.role === AdminRole.DEVELOPER
										? "Developer"
										: "Operator"}
							</span>
						)}
					</div>
					<Button variant="outline" size="sm" onClick={() => logout()}>
						<LogOut className="w-4 h-4 mr-2" />
						Logout
					</Button>
				</div>
			</div>
		</header>
	);
}
