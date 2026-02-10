import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { FeedList } from "../components/feed/FeedList";
import { Page } from "../components/layout/Page";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Separator } from "../components/ui/separator";
import { useToast } from "../hooks/use-toast";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useSearch } from "../hooks/useSearch";

export default function SearchResultsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { results, loading, loadingMore, error, hasMore, search, loadMore } = useSearch();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("term") || "");

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: loadingMore,
  });

  useEffect(() => {
    const term = searchParams.get("term");
    if (term) {
      search(term);
    }
  }, [searchParams, search]);

  useEffect(() => {
    if (error) {
      toast({
        title: t("common.error"),
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast, t]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ term: searchTerm.trim() });
    }
  };

  return (
    <Page>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{t("search.title")}</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder={t("home.search_placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" />
            {t("common.search")}
          </Button>
        </form>
      </div>

      {loading && (
        <div className="rounded-lg border bg-muted/50 p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t("search.searching")}</p>
        </div>
      )}

      {!loading && searchParams.get("term") && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {t("search.results_for", { term: searchParams.get("term") })}
            </h2>
          </div>

          {results.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <p className="text-muted-foreground">{t("search.no_results")}</p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {results.map((word) => (
                  <Card key={word.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl">{word.term}</CardTitle>
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-gray-300">
                            {new Date(word.createdAt).toLocaleDateString("ko-KR")}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {word.definitions && word.definitions.length > 0 ? (
                        <div className="space-y-2">
                          <Separator />
                          <FeedList definitions={word.definitions} onDelete={() => {}} />
                        </div>
                      ) : (
                        <p className="text-muted-foreground">{t("word.no_definitions")}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

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
