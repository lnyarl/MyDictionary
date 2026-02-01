import { type ReactNode, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../lib/auth";
import type { User } from "../types/user.types";
import { AuthContext, type AuthContextType, type GoogleCredentialResponse } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUser = useCallback(async ({ showErrorToast } = { showErrorToast: true }) => {
    try {
      const userData = await authApi.getMe({ showErrorToast });
      setUser(userData);
    } catch (_error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser({ showErrorToast: false })
  }, [fetchUser]);

  const handleGoogleLogin = useCallback(
    async (response: GoogleCredentialResponse) => {
      try {
        setIsLoading(true);
        const { user: userData } = await authApi.loginWithGoogle(response.credential);
        setUser(userData);
        navigate("/feed/all");
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
