import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DefinitionHistoryDialog } from "@/components/definitions/DefinitionHistoryDialog";
import { FeedList } from "@/components/feed/FeedList";
import { useAuth } from "@/hooks/useAuth";
import { useDefinitions } from "@/hooks/useDefinitions";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useMyFeed } from "@/hooks/useMyFeed";
import { Page } from "../components/layout/Page";
import { followsApi } from "../lib/follows";
import type { FollowStats } from "../types/follow.types";

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { definitions, fetchMyFeed, loadMore, hasMore, loading } = useMyFeed();
  const { deleteDefinition, updateDefinition } = useDefinitions();
  const [selectedDefinitionId, setSelectedDefinitionId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: loading,
  });

  const [stats, setStats] = useState<FollowStats | null>(null);

  const handleViewHistory = (definitionId: string) => {
    setSelectedDefinitionId(definitionId);
    setIsHistoryOpen(true);
  };

  const fetchFollowStats = useCallback(async () => {
    try {
      const data = await followsApi.getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  }, []);

  useEffect(() => {
    fetchMyFeed();
    fetchFollowStats();
  }, [fetchMyFeed, fetchFollowStats]);

  const handleDelete = async (definitionId: string) => {
    if (confirm(t("dashboard.delete_confirm"))) {
      await deleteDefinition(definitionId);
    }
  };

  const handleEdit = async (
    id: string,
    data: { content: string; tags: string[]; isPublic: boolean },
  ) => {
    await updateDefinition(id, {
      content: data.content,
      tags: data.tags,
      isPublic: data.isPublic,
    });
  };

  return (
    <Page>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t("dashboard.welcome", { nickname: user?.nickname })}
          </h1>
          <p className="text-muted-foreground mt-2">{t("dashboard.subtitle")}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-8 mb-8">
        <div>
          <span className="font-semibold mb-2">{t("dashboard.followers")}</span>
          <span className="font-bold ml-2">{stats?.followersCount || 0}</span>
        </div>
        <div>
          <span className="font-semibold mb-2">{t("dashboard.following")}</span>
          <span className="font-bold ml-2">{stats?.followingCount || 0}</span>
        </div>
      </div>
      <div className="space-y-4">
        {loading && definitions.length === 0 ? (
          <div className="rounded-lg border bg-muted/50 p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        ) : (
          <>
            <FeedList
              definitions={definitions}
              onDelete={handleDelete}
              onViewHistory={handleViewHistory}
              onEdit={handleEdit}
            />
            <div ref={sentinelRef} className="py-4 flex justify-center">
              {loading && hasMore ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                definitions.length > 0 && (
                  <p className="text-sm text-muted-foreground italic">{t("common.end_of_list")}</p>
                )
              )}
            </div>
          </>
        )}
      </div>

      {selectedDefinitionId && (
        <DefinitionHistoryDialog
          open={isHistoryOpen}
          onOpenChange={setIsHistoryOpen}
          definitionId={selectedDefinitionId}
        />
      )}
    </Page>
  );
}
