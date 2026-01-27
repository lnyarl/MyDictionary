import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAllFeed } from "@/hooks/useAllFeed";
import { useFeed } from "@/hooks/useFeed";
import { FeedCard } from "../components/feed/FeedCard";
import { Page } from "../components/layout/Page";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import type { Definition } from "../types/definition.types";

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

			{hasMore && (
				<div className="mt-8 text-center">
					<Button onClick={loadMore} disabled={loading} variant="outline">
						{loading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{t("common.loading")}
							</>
						) : (
							t("common.more")
						)}
					</Button>
				</div>
			)}
		</>
	);
}

export default function FeedPage() {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState("all");

	const allFeed = useAllFeed();
	const myFeed = useFeed();

	useEffect(() => {
		if (activeTab === "all") {
			allFeed.fetchAllFeed();
		} else {
			myFeed.fetchFeed();
		}
	}, [activeTab, allFeed.fetchAllFeed]);

	return (
		<Page>
			<div className="mb-8">
				<h1 className="text-3xl font-bold">{t("header.feed")}</h1>
				<p className="text-muted-foreground mt-2">{t("feed.subtitle")}</p>
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
						definitions={myFeed.definitions}
						loading={myFeed.loading}
						hasMore={myFeed.hasMore}
						loadMore={myFeed.loadMore}
						onRefresh={() => myFeed.fetchFeed(1)}
						emptyMessage={t("feed.emptyFollowing")}
					/>
				</TabsContent>
			</Tabs>
		</Page>
	);
}
