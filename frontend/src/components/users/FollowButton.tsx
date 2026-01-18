import { UserMinus, UserPlus } from "lucide-react";
import { useFollow } from "../../hooks/useFollow";
import { Button } from "../ui/button";

interface FollowButtonProps {
	userId: string;
	initialFollowing: boolean;
	onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({ userId, initialFollowing, onFollowChange }: FollowButtonProps) {
	const { isFollowing, loading, toggleFollow } = useFollow(initialFollowing);

	const handleClick = async () => {
		await toggleFollow(userId);
		onFollowChange?.(!isFollowing);
	};

	return (
		<Button onClick={handleClick} disabled={loading} variant={isFollowing ? "outline" : "default"}>
			{isFollowing ? (
				<>
					<UserMinus className="mr-2 h-4 w-4" />
					팔로잉
				</>
			) : (
				<>
					<UserPlus className="mr-2 h-4 w-4" />
					팔로우
				</>
			)}
		</Button>
	);
}
