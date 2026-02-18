import { useCallback, useState } from "react";
import { type UserProfile, usersApi } from "../lib/api/users";

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.getUserProfile(userId);
      setProfile(data);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to fetch profile"));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { profile, loading, error, fetchProfile };
}
