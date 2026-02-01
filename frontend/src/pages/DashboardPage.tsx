import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { ProfileEditCard } from "@/components/dashboard/ProfileEditCard";
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
  const { user, refetchUser } = useAuth();
  const { definitions, loadMore, hasMore, loading } = useMyFeed();
  const { deleteDefinition, updateDefinition } = useDefinitions();
  const [isEditing, setIsEditing] = useState(false);

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: loading,
  });

  const [stats, setStats] = useState<FollowStats | null>(null);

  const fetchFollowStats = useCallback(async () => {
    try {
      const data = await followsApi.getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  }, []);

  useEffect(() => {
    fetchFollowStats();
  }, [fetchFollowStats]);

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

  const handleSaveProfile = async () => {
    await refetchUser();
    setIsEditing(false);
  };

  return (
    <Page>
      <div className="mb-8">
        {isEditing && user ? (
          <ProfileEditCard
            user={user}
            onCancel={() => setIsEditing(false)}
            onSave={handleSaveProfile}
          />
        ) : user ? (
          <ProfileCard user={user} stats={stats} onEdit={() => setIsEditing(true)} />
        ) : null}
      </div>

      <div className="space-y-4">
        {loading && definitions.length === 0 ? (
          <div className="rounded-lg border bg-muted/50 p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        ) : (
          <>
            <FeedList definitions={definitions} onDelete={handleDelete} onEdit={handleEdit} />
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
    </Page>
  );
}
