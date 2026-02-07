import { Hash, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { FeedList } from "@/components/feed/FeedList";
import { Page } from "@/components/layout/Page";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useTagSearch } from "@/hooks/useTagSearch";

export default function TagSearchPage() {
  const { t } = useTranslation();
  const { tag } = useParams<{ tag: string }>();
  const { results, loading, loadingMore, hasMore, search, loadMore } = useTagSearch();

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: loadingMore,
  });

  useEffect(() => {
    if (tag) {
      search(tag);
    }
  }, [tag, search]);

  return (
    <Page>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Hash className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{tag}</h1>
        </div>
        <p className="text-muted-foreground">{t("tag.search_results_for", { tag })}</p>
      </div>

      {loading && (
        <div className="rounded-lg border bg-muted/50 p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-6">
          {results.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <p className="text-muted-foreground">{t("tag.no_results")}</p>
            </div>
          ) : (
            <>
              <FeedList definitions={results} />
              <div ref={sentinelRef} className="py-4 flex justify-center">
                {loadingMore && hasMore ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  results.length > 0 && (
                    <p className="text-sm text-muted-foreground italic">
                      {t("common.end_of_list")}
                    </p>
                  )
                )}
              </div>
            </>
          )}
        </div>
      )}
    </Page>
  );
}
