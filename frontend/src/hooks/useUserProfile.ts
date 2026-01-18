import { useCallback, useState } from "react";
import { usersApi } from "../lib/users";
import type { UserProfile } from "../types/follow.types";

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
		} catch (err: any) {
			setError(err.message || "Failed to fetch profile");
		} finally {
			setLoading(false);
		}
	}, [userId]);

	return { profile, loading, error, fetchProfile };
}
