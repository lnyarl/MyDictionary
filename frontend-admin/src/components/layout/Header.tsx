import { LogOut, User } from "lucide-react";
import { Button } from "../ui/button";
import { useAdminAuth } from "../../contexts/AdminAuthContext";

export function Header() {
	const { admin, logout } = useAdminAuth();

	return (
		<header className="bg-white border-b border-gray-200 shadow-sm">
			<div className="container mx-auto px-8 py-4 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						MyDictionary Admin
					</h1>
					<p className="text-sm text-gray-500">Admin Panel</p>
				</div>

				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2 text-sm">
						<User className="w-4 h-4 text-gray-500" />
						<span className="font-medium">{admin?.username}</span>
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
