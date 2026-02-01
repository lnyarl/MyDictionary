import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
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
      <div className="divide-y divide-border">
        {definitions.map((definition) => (
          <div key={definition.id} className="py-4 first:pt-0 last:pb-0">
            <FeedCard
              definition={definition}
              onDelete={onRefresh}
              showWord={true}
              variant="borderless"
            />
          </div>
        ))}
      </div>

      <div ref={sentinelRef} className="pt-8 pb-4 flex justify-center">
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
  const navigate = useNavigate();
  const { tab } = useParams<{ tab: string }>();
  const activeTab = tab || "all";

  const allFeed = useAllFeed();
  const followingFeed = useFeed();
  const myFeed = useMyFeed();

  const handleSubmit = async (data: CreateWordInput) => {
    await myFeed.createFeed(data);
  };

  return (
    <Page>
      <div className="mb-8">
        <FeedForm onCreate={handleSubmit} />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => navigate(`/feed/${value}`)}
        className="w-full"
      >
        <TabsList className="h-auto p-0 bg-transparent gap-1 justify-start border-b-0 relative z-10 mb-[-1px]">
          <TabsTrigger
            value="all"
            className="px-6 py-2 rounded-t-lg rounded-b-none border border-transparent bg-muted/30 text-muted-foreground data-[state=active]:border-border data-[state=active]:border-b-background data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none transition-none cursor-pointer"
          >
            {t("feed.tabs.all")}
          </TabsTrigger>
          <TabsTrigger
            value="following"
            className="px-6 py-2 rounded-t-lg rounded-b-none border border-transparent bg-muted/30 text-muted-foreground data-[state=active]:border-border data-[state=active]:border-b-background data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none transition-none cursor-pointer"
          >
            {t("feed.tabs.following")}
          </TabsTrigger>
        </TabsList>

        <div className="bg-background border border-border rounded-b-lg rounded-tr-lg relative">
          <TabsContent value="all" className="m-0 p-6 focus-visible:ring-0">
            <FeedList
              definitions={allFeed.definitions}
              loading={allFeed.loading}
              hasMore={allFeed.hasMore}
              loadMore={allFeed.loadMore}
              onRefresh={() => allFeed.fetchAllFeed(1)}
              emptyMessage={t("feed.empty")}
            />
          </TabsContent>

          <TabsContent value="following" className="m-0 p-6 focus-visible:ring-0">
            <FeedList
              definitions={followingFeed.definitions}
              loading={followingFeed.loading}
              hasMore={followingFeed.hasMore}
              loadMore={followingFeed.loadMore}
              onRefresh={() => followingFeed.fetchFeed(1)}
              emptyMessage={t("feed.emptyFollowing")}
            />
          </TabsContent>
        </div>
      </Tabs>
    </Page>
  );
}
