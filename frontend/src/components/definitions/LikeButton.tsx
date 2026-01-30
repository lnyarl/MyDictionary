import { useMutation } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { likesApi } from "../../lib/likes";
import { Button } from "../ui/button";

interface LikeButtonProps {
	definitionId: string;
	initialLikesCount: number;
	initialIsLiked?: boolean;
	isOwnDefinition: boolean;
}

export function LikeButton({
	definitionId,
	initialLikesCount,
	initialIsLiked = false,
	isOwnDefinition,
}: LikeButtonProps) {
	const { isAuthenticated } = useAuth();
	const [likesCount, setLikesCount] = useState(initialLikesCount);
	const [isLiked, setIsLiked] = useState(initialIsLiked);

	const mutation = useMutation({
		mutationFn: () => likesApi.toggle(definitionId),
		onMutate: async () => {
			const previousLikesCount = likesCount;
			const previousIsLiked = isLiked;
			const newIsLiked = !isLiked;
			const newLikesCount = newIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

			setIsLiked(newIsLiked);
			setLikesCount(newLikesCount);

			return { previousLikesCount, previousIsLiked };
		},
		onError: (err, _variables, context) => {
			if (context) {
				setIsLiked(context.previousIsLiked);
				setLikesCount(context.previousLikesCount);
			}
			console.error("Failed to toggle like:", err);
		},
		onSuccess: (data, _variables, context) => {
			const actualNewCount = data.liked
				? context.previousLikesCount + 1
				: Math.max(0, context.previousLikesCount - 1);

			setLikesCount(actualNewCount);
			setIsLiked(data.liked);
		},
	});

	if (isOwnDefinition || !isAuthenticated) {
		return (
			<div className="flex items-center gap-2">
				<Heart className="h-4 w-4 text-muted-foreground" />
				<span className="text-sm text-muted-foreground">{likesCount}</span>
			</div>
		);
	}

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={() => mutation.mutate()}
			disabled={mutation.isPending}
			className="gap-2"
		>
			<Heart
				className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
			/>
			<span className="text-sm">{likesCount}</span>
		</Button>
	);
};
