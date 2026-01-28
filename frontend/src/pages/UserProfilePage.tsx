import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { BadgeList } from "../components/badges/BadgeList";
import { FeedCard } from "../components/feed/FeedCard";
import { Page } from "../components/layout/Page";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ProfileStats } from "../components/users/ProfileStats";
import { UserProfileHeader } from "../components/users/UserProfileHeader";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useUserProfile } from "../hooks/useUserProfile";
import { badgesApi } from "../lib/badges";
import { followsApi } from "../lib/follows";
import { usersApi } from "../lib/users";
import type { BadgeWithProgress } from "../types/badge.types";
import type { Definition } from "../types/definition.types";
import type { Word } from "../types/word.types";

export default function UserProfilePage() {
	const { userId } = useParams<{ userId: string }>();
	const [searchParams, setSearchParams] = useSearchParams();
	const initialTab = searchParams.get("tab") || "words";

	const { profile, loading, fetchProfile } = useUserProfile(userId!);
	const [isFollowing, setIsFollowing] = useState(false);

	const [words, setWords] = useState<Word[]>([]);
	const [definitions, setDefinitions] = useState<Definition[]>([]);
	const [badges, setBadges] = useState<BadgeWithProgress[]>([]);

	const [wordsLoading, setWordsLoading] = useState(false);
	const [wordsLoadingMore, setWordsLoadingMore] = useState(false);
	const [wordsPage, setWordsPage] = useState(1);
	const [wordsCursor, setWordsCursor] = useState<string | undefined>(undefined);
	const [wordsHasMore, setWordsHasMore] = useState(false);

	const [defsLoading, setDefsLoading] = useState(false);
	const [defsLoadingMore, setDefsLoadingMore] = useState(false);
	const [defsPage, setDefsPage] = useState(1);
	const [defsCursor, setDefsCursor] = useState<string | undefined>(undefined);
	const [defsHasMore, setDefsHasMore] = useState(false);

	const [badgesLoading, setBadgesLoading] = useState(false);

	const checkFollowing = useCallback(async () => {
		try {
			const result = await followsApi.checkFollowing(userId!);
			setIsFollowing(result.isFollowing);
		} catch (error) {
			console.error("Failed to check following status", error);
		}
	}, [userId]);

	const fetchWords = useCallback(
		async (pageNum: number, nextCursor?: string, append = false) => {
			if (append) {
				setWordsLoadingMore(true);
			} else {
				setWordsLoading(true);
			}

			try {
				const response = await usersApi.getUserWords(userId!, pageNum, 20, nextCursor);
				if (append) {
					setWords((prev) => {
						const newItems = response.data.filter(
							(newItem) => !prev.some((existingItem) => existingItem.id === newItem.id)
						);
						return [...prev, ...newItems];
					});
				} else {
					setWords(response.data);
				}
				setWordsHasMore(!!response.meta.nextCursor);
				setWordsPage(pageNum);
				setWordsCursor(response.meta.nextCursor);
			} catch (error) {
				console.error("Failed to fetch words", error);
			} finally {
				setWordsLoading(false);
				setWordsLoadingMore(false);
			}
		},
		[userId],
	);

	const fetchDefinitions = useCallback(
		async (pageNum: number, nextCursor?: string, append = false) => {
			if (append) {
				setDefsLoadingMore(true);
			} else {
				setDefsLoading(true);
			}

			try {
				const response = await usersApi.getUserDefinitions(userId!, pageNum, 20, nextCursor);
				if (append) {
					setDefinitions((prev) => {
						const newItems = response.data.filter(
							(newItem) => !prev.some((existingItem) => existingItem.id === newItem.id)
						);
						return [...prev, ...newItems];
					});
				} else {
					setDefinitions(response.data);
				}
				setDefsHasMore(!!response.meta.nextCursor);
				setDefsPage(pageNum);
				setDefsCursor(response.meta.nextCursor);
			} catch (error) {
				console.error("Failed to fetch definitions", error);
			} finally {
				setDefsLoading(false);
				setDefsLoadingMore(false);
			}
		},
		[userId],
	);

	const fetchBadges = useCallback(async () => {
		setBadgesLoading(true);
		try {
			const response = await badgesApi.getUserBadges(userId!);
			setBadges(response);
		} catch (error) {
			console.error("Failed to fetch badges", error);
		} finally {
			setBadgesLoading(false);
		}
	}, [userId]);

	useEffect(() => {
		if (userId) {
			fetchProfile();
			checkFollowing();
		}
	}, [userId, fetchProfile, checkFollowing]);

	useEffect(() => {
		if (!userId) return;

		if (initialTab === "words" && words.length === 0) fetchWords(1);
		else if (initialTab === "definitions" && definitions.length === 0) fetchDefinitions(1);
		else if (initialTab === "badges" && badges.length === 0) fetchBadges();
	}, [
		userId,
		initialTab,
		fetchWords,
		fetchDefinitions,
		fetchBadges,
		words.length,
		definitions.length,
		badges.length,
	]);

	const handleLoadMoreWords = useCallback(() => {
		fetchWords(wordsPage + 1, wordsCursor, true);
	}, [wordsPage, wordsCursor, fetchWords]);

	const handleLoadMoreDefs = useCallback(() => {
		fetchDefinitions(defsPage + 1, defsCursor, true);
	}, [defsPage, defsCursor, fetchDefinitions]);

	const { sentinelRef: wordsSentinelRef } = useInfiniteScroll({
		onLoadMore: handleLoadMoreWords,
		hasMore: wordsHasMore,
		isLoading: wordsLoadingMore,
	});

	const { sentinelRef: defsSentinelRef } = useInfiniteScroll({
		onLoadMore: handleLoadMoreDefs,
		hasMore: defsHasMore,
		isLoading: defsLoadingMore,
	});

	const onTabChange = (value: string) => {
		setSearchParams({ tab: value });
	};

	if (loading || !profile) {
		return (
			<Page>
				<div className="flex items-center justify-center min-h-[400px]">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			</Page>
		);
	}

	return (
		<Page>
			<UserProfileHeader
				profile={profile}
				isFollowing={isFollowing}
				onFollowChange={setIsFollowing}
			/>

			<ProfileStats profile={profile} userId={userId!} />

			<Tabs defaultValue={initialTab} onValueChange={onTabChange} className="w-full">
				<TabsList>
					<TabsTrigger value="words">단어</TabsTrigger>
					<TabsTrigger value="definitions">정의</TabsTrigger>
					<TabsTrigger value="badges">뱃지</TabsTrigger>
				</TabsList>

				<TabsContent value="words">
					{wordsLoading && words.length === 0 ? (
						<div className="flex items-center justify-center p-12">
							<Loader2 className="h-8 w-8 animate-spin" />
						</div>
					) : words.length === 0 ? (
						<div className="rounded-lg border border-dashed p-12 text-center">
							<p className="text-muted-foreground">아직 단어가 없습니다.</p>
						</div>
					) : (
						<>
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
								{words.map((word) => (
									<Card key={word.id} className="hover:shadow-md transition-shadow">
										<CardHeader>
											<h3 className="font-semibold text-lg">{word.term}</h3>
										</CardHeader>
										<CardContent>
											<p className="text-sm text-muted-foreground">
												{new Date(word.createdAt).toLocaleDateString("ko-KR")}
											</p>
										</CardContent>
									</Card>
								))}
							</div>

							<div ref={wordsSentinelRef} className="py-4 flex justify-center">
								{wordsLoadingMore && wordsHasMore && (
									<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
								)}
							</div>
						</>
					)}
				</TabsContent>

				<TabsContent value="definitions">
					{defsLoading && definitions.length === 0 ? (
						<div className="flex items-center justify-center p-12">
							<Loader2 className="h-8 w-8 animate-spin" />
						</div>
					) : definitions.length === 0 ? (
						<div className="rounded-lg border border-dashed p-12 text-center">
							<p className="text-muted-foreground">아직 정의가 없습니다.</p>
						</div>
					) : (
						<>
							<div className="space-y-4 mt-4">
								{definitions.map((definition) => (
									<FeedCard
										key={definition.id}
										definition={definition}
										onDelete={() => {}}
										onViewHistory={() => {}}
										showWord={true}
									/>
								))}
							</div>

							<div ref={defsSentinelRef} className="py-4 flex justify-center">
								{defsLoadingMore && defsHasMore && (
									<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
								)}
							</div>
						</>
					)}
				</TabsContent>

				<TabsContent value="badges">
					<BadgeList badges={badges} loading={badgesLoading} />
				</TabsContent>
			</Tabs>
		</Page>
	);
}
