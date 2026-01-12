import { useState, useCallback } from "react";
import { followsApi } from "../lib/follows";
import { useToast } from "./use-toast";

export function useFollow(initialFollowing = false) {
	const [isFollowing, setIsFollowing] = useState(initialFollowing);
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	const toggleFollow = useCallback(
		async (userId: string) => {
			setLoading(true);
			try {
				if (isFollowing) {
					await followsApi.unfollow(userId);
					setIsFollowing(false);
					toast({ description: "팔로우를 취소했습니다." });
				} else {
					await followsApi.follow(userId);
					setIsFollowing(true);
					toast({ description: "팔로우했습니다." });
				}
			} catch (error: any) {
				toast({
					variant: "destructive",
					description: error.message || "오류가 발생했습니다.",
				});
			} finally {
				setLoading(false);
			}
		},
		[isFollowing, toast],
	);

	return { isFollowing, setIsFollowing, loading, toggleFollow };
}
