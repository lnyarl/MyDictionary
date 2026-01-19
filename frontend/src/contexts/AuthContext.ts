import { createContext } from "react";
import type { User } from "../types/user.types";

export type GoogleCredentialResponse = {
	credential: string;
	select_by?: string;
};

export type AuthContextType = {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	handleGoogleLogin: (response: GoogleCredentialResponse) => Promise<void>;
	logout: () => Promise<void>;
	refetchUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
