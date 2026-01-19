import { useAuth } from "@/hooks/useAuth";
import type { UserProfile } from "../../types/follow.types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { FollowButton } from "./FollowButton";

interface UserProfileHeaderProps {
	profile: UserProfile;
	isFollowing: boolean;
	onFollowChange: (isFollowing: boolean) => void;
}

export function UserProfileHeader({
	profile,
	isFollowing,
	onFollowChange,
}: UserProfileHeaderProps) {
	const { user: currentUser } = useAuth();
	const isOwnProfile = currentUser?.id === profile.user.id;

	return (
		<div className="flex items-start justify-between mb-8">
			<div className="flex items-center gap-4">
				<Avatar className="h-20 w-20">
					<AvatarImage src={profile.user.profilePicture} />
					<AvatarFallback className="text-2xl">{profile.user.nickname[0]}</AvatarFallback>
				</Avatar>

				<div>
					<h1 className="text-3xl font-bold">{profile.user.nickname}</h1>
					<p className="text-muted-foreground mt-1">
						{new Date(profile.user.createdAt).toLocaleDateString("ko-KR")}에 가입
					</p>
				</div>
			</div>

			{!isOwnProfile && (
				<FollowButton
					userId={profile.user.id}
					initialFollowing={isFollowing}
					onFollowChange={onFollowChange}
				/>
			)}
		</div>
	);
}
