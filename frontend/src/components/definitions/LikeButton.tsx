import { Heart } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { likesApi } from "../../lib/likes";
import { Button } from "../ui/button";

interface LikeButtonProps {
	definitionId: string;
	initialLikesCount: number;
	isOwnDefinition: boolean;
	onLikeToggle?: (newCount: number) => void;
}

export function LikeButton({
	definitionId,
	initialLikesCount,
	isOwnDefinition,
	onLikeToggle,
}: LikeButtonProps) {
	const { isAuthenticated } = useAuth();
	const [likesCount, setLikesCount] = useState(initialLikesCount);
	const [isLiked, setIsLiked] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Don't show like button for own definitions or if not authenticated
	if (isOwnDefinition || !isAuthenticated) {
		return (
			<div className="flex items-center gap-2">
				<Heart className="h-4 w-4 text-muted-foreground" />
				<span className="text-sm text-muted-foreground">{likesCount}</span>
			</div>
		);
	}

	const handleToggle = async () => {
		if (isLoading) return;

		// Optimistic update
		const previousLikesCount = likesCount;
		const previousIsLiked = isLiked;
		const newIsLiked = !isLiked;
		const newLikesCount = newIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

		setIsLiked(newIsLiked);
		setLikesCount(newLikesCount);

		setIsLoading(true);
		try {
			const response = await likesApi.toggle(definitionId);
			// Update with server response
			const actualNewCount = response.liked
				? previousLikesCount + 1
				: Math.max(0, previousLikesCount - 1);
			setLikesCount(actualNewCount);
			setIsLiked(response.liked);

			if (onLikeToggle) {
				onLikeToggle(actualNewCount);
			}
		} catch (error) {
			// Rollback on error
			setIsLiked(previousIsLiked);
			setLikesCount(previousLikesCount);
			console.error("Failed to toggle like:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button variant="ghost" size="sm" onClick={handleToggle} disabled={isLoading} className="gap-2">
			<Heart
				className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
			/>
			<span className="text-sm">{likesCount}</span>
		</Button>
	);
}
