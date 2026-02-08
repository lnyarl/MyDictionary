import { createContext } from "react";
import { User } from "@/lib/api/users";

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
