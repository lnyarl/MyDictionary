import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { adminAuthApi } from "../lib/auth";
import type { AdminUser } from "../types/admin.types";

interface AdminAuthContextType {
	admin: AdminUser | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	login: (username: string, password: string) => Promise<{ mustChangePassword: boolean }>;
	logout: () => Promise<void>;
	refetchAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
	const [admin, setAdmin] = useState<AdminUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const fetchAdmin = useCallback(async () => {
		try {
			const adminData = await adminAuthApi.getMe();
			setAdmin(adminData);
		} catch {
			setAdmin(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchAdmin();
	}, [fetchAdmin]);

	const login = async (username: string, password: string) => {
		const { admin: adminData } = await adminAuthApi.login(username, password);
		setAdmin(adminData);
		return { mustChangePassword: adminData.mustChangePassword };
	};

	const logout = async () => {
		await adminAuthApi.logout();
		setAdmin(null);
		window.location.href = "/login";
	};

	const refetchAdmin = async () => {
		await fetchAdmin();
	};

	return (
		<AdminAuthContext.Provider
			value={{
				admin,
				isLoading,
				isAuthenticated: !!admin,
				login,
				logout,
				refetchAdmin,
			}}
		>
			{children}
		</AdminAuthContext.Provider>
	);
}

export const useAdminAuth = () => {
	const context = useContext(AdminAuthContext);
	if (!context) {
		throw new Error("useAdminAuth must be used within AdminAuthProvider");
	}
	return context;
};
