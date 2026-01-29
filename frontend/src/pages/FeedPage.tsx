import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAllFeed } from "@/hooks/useAllFeed";
import { useFeed } from "@/hooks/useFeed";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useMyFeed } from "@/hooks/useMyFeed";
import { FeedCard } from "../components/feed/FeedCard";
import { FeedForm } from "../components/feed/FeedForm";
import { Page } from "../components/layout/Page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import type { Definition } from "../types/definition.types";
import type { CreateWordInput } from "../types/word.types";

interface FeedListProps {
	definitions: Definition[];
	loading: boolean;
	hasMore: boolean;
	loadMore: () => void;
	onRefresh: () => void;
	emptyMessage: string;
}

function FeedList({
	definitions,
	loading,
	hasMore,
	loadMore,
	onRefresh,
	emptyMessage,
}: FeedListProps) {
	const { t } = useTranslation();

	const { sentinelRef } = useInfiniteScroll({
		onLoadMore: loadMore,
		hasMore,
		isLoading: loading,
	});

	const handleViewHistory = () => { };

	if (loading && definitions.length === 0) {
		return (
			<div className="rounded-lg border bg-muted/50 p-12 text-center">
				<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
				<p className="text-muted-foreground">{t("common.loading")}</p>
			</div>
		);
	}

	if (definitions.length === 0) {
		return (
			<div className="rounded-lg border border-dashed p-12 text-center">
				<p className="text-muted-foreground">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-4">
				{definitions.map((definition) => (
					<FeedCard
						key={definition.id}
						definition={definition}
						onDelete={onRefresh}
						onViewHistory={handleViewHistory}
						showWord={true}
					/>
				))}
			</div>

			<div ref={sentinelRef} className="py-8 flex justify-center">
				{hasMore ? (
					<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				) : (
					definitions.length > 0 && (
						<p className="text-sm text-muted-foreground italic">{t("common.end_of_list")}</p>
					)
				)}
			</div>
		</>
	);
}

export default function FeedPage() {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState("all");

	const allFeed = useAllFeed();
	const followingFeed = useFeed();
	const myFeed = useMyFeed();

	const handleSubmit = async (data: CreateWordInput) => {
		await myFeed.createFeed(data);
		allFeed.fetchAllFeed(1);
	};

	useEffect(() => {
		if (activeTab === "all") {
			allFeed.fetchAllFeed();
		} else {
			followingFeed.fetchFeed();
		}
	}, [activeTab, allFeed.fetchAllFeed, followingFeed.fetchFeed]);

	return (
		<Page>
			<div className="mb-8">
				<FeedForm onCreate={handleSubmit} />
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="mb-6">
					<TabsTrigger value="all">{t("feed.tabs.all")}</TabsTrigger>
					<TabsTrigger value="following">{t("feed.tabs.following")}</TabsTrigger>
				</TabsList>

				<TabsContent value="all">
					<FeedList
						definitions={allFeed.definitions}
						loading={allFeed.loading}
						hasMore={allFeed.hasMore}
						loadMore={allFeed.loadMore}
						onRefresh={() => allFeed.fetchAllFeed(1)}
						emptyMessage={t("feed.empty")}
					/>
				</TabsContent>

				<TabsContent value="following">
					<FeedList
						definitions={followingFeed.definitions}
						loading={followingFeed.loading}
						hasMore={followingFeed.hasMore}
						loadMore={followingFeed.loadMore}
						onRefresh={() => followingFeed.fetchFeed(1)}
						emptyMessage={t("feed.emptyFollowing")}
					/>
				</TabsContent>
			</Tabs>
		</Page>
	);
}
