import { useNavigate } from "react-router-dom";
import type { UserProfile } from "../../types/follow.types";

interface ProfileStatsProps {
	profile: UserProfile;
	userId: string;
}

export function ProfileStats({ profile, userId }: ProfileStatsProps) {
	const navigate = useNavigate();

	return (
		<div className="grid gap-4 md:grid-cols-4 mb-8">
			<div className="rounded-lg border bg-card p-6">
				<h3 className="font-semibold mb-2">단어</h3>
				<p className="text-3xl font-bold">{profile.stats.wordsCount}</p>
			</div>

			<div className="rounded-lg border bg-card p-6">
				<h3 className="font-semibold mb-2">정의</h3>
				<p className="text-3xl font-bold">{profile.stats.definitionsCount}</p>
			</div>

			<button
				type="button"
				onClick={() => navigate(`/users/${userId}/followers`)}
				className="rounded-lg border bg-card p-6 text-left hover:bg-accent transition-colors"
			>
				<h3 className="font-semibold mb-2">팔로워</h3>
				<p className="text-3xl font-bold">{profile.stats.followersCount}</p>
			</button>

			<button
				type="button"
				onClick={() => navigate(`/users/${userId}/following`)}
				className="rounded-lg border bg-card p-6 text-left hover:bg-accent transition-colors"
			>
				<h3 className="font-semibold mb-2">팔로잉</h3>
				<p className="text-3xl font-bold">{profile.stats.followingCount}</p>
			</button>
		</div>
	);
}
