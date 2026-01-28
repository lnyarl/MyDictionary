import { ArrowLeft, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Page } from "../components/layout/Page";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { followsApi } from "../lib/follows";
import type { User } from "../types/user.types";

export default function FollowingPage() {
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();
	const [following, setFollowing] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [page, setPage] = useState(1);
	const [cursor, setCursor] = useState<string | undefined>(undefined);
	const [hasMore, setHasMore] = useState(false);
	const { t } = useTranslation();

	const fetchFollowing = useCallback(
		async (pageNum: number, nextCursor?: string, append = false) => {
			if (append) {
				setLoadingMore(true);
			} else {
				setLoading(true);
			}

			try {
				const response = await followsApi.getFollowing(userId, pageNum, 20, nextCursor);
				if (append) {
					setFollowing((prev) => {
						const newItems = response.data.filter(
							(newItem) => !prev.some((existingItem) => existingItem.id === newItem.id)
						);
						return [...prev, ...newItems];
					});
				} else {
					setFollowing(response.data);
				}
				setHasMore(!!response.meta.nextCursor);
				setPage(pageNum);
				setCursor(response.meta.nextCursor);
			} catch (error) {
				console.error("Failed to fetch following", error);
			} finally {
				setLoading(false);
				setLoadingMore(false);
			}
		},
		[userId],
	);

	useEffect(() => {
		fetchFollowing(1);
	}, [fetchFollowing]);

	const handleLoadMore = useCallback(() => {
		fetchFollowing(page + 1, cursor, true);
	}, [page, cursor, fetchFollowing]);

	const { sentinelRef } = useInfiniteScroll({
		onLoadMore: handleLoadMore,
		hasMore,
		isLoading: loadingMore,
	});

	return (
		<Page maxWidth="2xl">
			<Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
				<ArrowLeft className="mr-2 h-4 w-4" />
				뒤로 가기
			</Button>

			<h1 className="text-3xl font-bold mb-6">팔로잉</h1>

			{loading && following.length === 0 ? (
				<div className="flex items-center justify-center p-12">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			) : following.length === 0 ? (
				<div className="rounded-lg border border-dashed p-12 text-center">
					<p className="text-muted-foreground">아직 팔로우하는 사용자가 없습니다.</p>
				</div>
			) : (
				<>
					<div className="space-y-4">
						{following.map((user) => (
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

					<div ref={sentinelRef} className="py-4 flex justify-center">
						{(loadingMore && hasMore) ? (
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						) : (
							following.length > 0 && (
								<p className="text-sm text-muted-foreground italic">{t("common.end_of_list")}</p>
							)
						)}
					</div>
				</>
			)}
		</Page>
	);
}
