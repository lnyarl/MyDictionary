import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../lib/auth";
import type { User } from "../types/user.types";

interface GoogleCredentialResponse {
	credential: string;
	select_by?: string;
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	handleGoogleLogin: (response: GoogleCredentialResponse) => Promise<void>;
	logout: () => Promise<void>;
	refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();

	const fetchUser = useCallback(async () => {
		try {
			const userData = await authApi.getMe();
			setUser(userData);
		} catch (_error) {
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchUser();
	}, [fetchUser]);

	const handleGoogleLogin = useCallback(
		async (response: GoogleCredentialResponse) => {
			try {
				setIsLoading(true);
				const { user: userData } = await authApi.loginWithGoogle(
					response.credential,
				);
				setUser(userData);
				navigate("/dashboard");
			} catch (error) {
				console.error("Google login failed:", error);
				setUser(null);
			} finally {
				setIsLoading(false);
			}
		},
		[navigate],
	);

	const logout = async () => {
		try {
			await authApi.logout();
			setUser(null);
			window.location.href = "/";
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const refetchUser = async () => {
		setIsLoading(true);
		await fetchUser();
	};

	const value: AuthContextType = {
		user,
		isLoading,
		isAuthenticated: !!user,
		handleGoogleLogin,
		logout,
		refetchUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
