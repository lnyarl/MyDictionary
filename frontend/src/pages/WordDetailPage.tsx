import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { SEO } from "@/components/common/SEO";
import { FeedForm } from "@/components/feed/FeedForm";
import { FeedList } from "@/components/feed/FeedList";
import { Page } from "@/components/layout/Page";
import { useDefinitions } from "@/hooks/useDefinitions";
import { useFeedByTerm } from "@/hooks/useFeedByTerm";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useMyFeed } from "@/hooks/useMyFeed";
import type { CreateFeedInput } from "@/lib/api/feed";

export default function WordDetailPage() {
  const { t } = useTranslation();
  const { term } = useParams<{ term: string }>();
  const { updateDefinition, deleteDefinition } = useDefinitions();
  const { createFeed } = useMyFeed();
  const { feeds, loading, loadingMore, hasMore, loadMore, refetch } = useFeedByTerm(term || "");

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: !!hasMore,
    isLoading: loadingMore,
  });

  useEffect(() => {
    if (term) {
      refetch();
    }
  }, [term, refetch]);

  const handleDelete = async (id: string) => {
    if (confirm(t("word.delete_definition_confirm"))) {
      await deleteDefinition(id);
      refetch();
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
    refetch();
  };

  const handleCreateFeed = async (data: CreateFeedInput) => {
    await createFeed(data);
    refetch();
  };

  if (!term) return null;

  return (
    <Page>
      <SEO
        title={term}
        description={`${term}의 정의와 다양한 해석을 확인핳세요.`}
        url={`/word/${encodeURIComponent(term)}`}
      />
      <div className="mb-8">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground break-words leading-tight">
          {term}
        </h1>
      </div>

      <div className="mb-8">
        <FeedForm onCreate={handleCreateFeed} fixedTerm={term} />
      </div>

      <div className="space-y-4">
        {loading && feeds.length === 0 ? (
          <div className="rounded-lg border bg-muted/50 p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        ) : (
          <>
            <FeedList definitions={feeds} onDelete={handleDelete} onEdit={handleEdit} />
            <div ref={sentinelRef} className="h-4 w-full" />
            {loadingMore && (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </>
        )}
      </div>
    </Page>
  );
}
