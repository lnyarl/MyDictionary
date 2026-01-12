import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page } from "../components/layout/Page";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { followsApi } from "../lib/follows";
import type { User } from "../types/user.types";

export default function FollowersPage() {
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();
	const [followers, setFollowers] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchFollowers();
	}, [userId]);

	const fetchFollowers = async () => {
		setLoading(true);
		try {
			const response = await followsApi.getFollowers(userId);
			setFollowers(response.data);
		} catch (error) {
			console.error("Failed to fetch followers", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Page maxWidth="2xl">
			<Button
				variant="ghost"
				onClick={() => navigate(-1)}
				className="mb-4"
			>
				<ArrowLeft className="mr-2 h-4 w-4" />
				뒤로 가기
			</Button>

			<h1 className="text-3xl font-bold mb-6">팔로워</h1>

			{loading ? (
				<div className="flex items-center justify-center p-12">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			) : followers.length === 0 ? (
				<div className="rounded-lg border border-dashed p-12 text-center">
					<p className="text-muted-foreground">아직 팔로워가 없습니다.</p>
				</div>
			) : (
				<div className="space-y-4">
					{followers.map((user) => (
						<Card
							key={user.id}
							className="hover:shadow-md transition-shadow cursor-pointer"
							onClick={() => navigate(`/users/${user.id}`)}
						>
							<CardContent className="flex items-center gap-4 p-6">
								<Avatar className="h-12 w-12">
									<AvatarImage src={user.profilePicture} />
									<AvatarFallback>{user.nickname[0]}</AvatarFallback>
								</Avatar>
								<div>
									<h3 className="font-semibold">{user.nickname}</h3>
									<p className="text-sm text-muted-foreground">{user.email}</p>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</Page>
	);
}
