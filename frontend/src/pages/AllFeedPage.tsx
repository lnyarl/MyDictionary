import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/common/SEO";
import { FeedForm } from "@/components/feed/FeedForm";
import { FeedList } from "@/components/feed/FeedList";
import { Page } from "@/components/layout/Page";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAllFeed } from "@/hooks/useAllFeed";
import { useMyFeed } from "@/hooks/useMyFeed";
import type { CreateFeedInput } from "@/lib/api/feed";

export default function AllFeedPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const allFeed = useAllFeed();
  const myFeed = useMyFeed();

  const handleSubmit = async (data: CreateFeedInput) => {
    await myFeed.createFeed(data);
  };

  return (
    <Page>
      <SEO />
      <div className="mb-8">
        <FeedForm onCreate={handleSubmit} />
      </div>

      <Tabs value="all" className="w-full">
        <TabsList className="h-auto p-0 bg-transparent justify-start flex gap-8 border-b border-gray-200 pb-4 w-full">
          <TabsTrigger
            value="all"
            onClick={() => navigate("/feed/all")}
            className="text-sm uppercase tracking-widest text-slate-300 hover:text-gray-800 transition-colors pb-4 -mb-[18px] data-[state=active]:text-gray-800 data-[state=active]:border-b-2 data-[state=active]:border-gray-800 data-[state=active]:shadow-none bg-transparent rounded-none"
          >
            {t("feed.tabs.all")}
          </TabsTrigger>
          <TabsTrigger
            value="following"
            onClick={() => navigate("/feed/following")}
            className="text-sm uppercase tracking-widest text-slate-300 hover:text-gray-800 transition-colors pb-4 -mb-[18px] data-[state=active]:text-gray-800 data-[state=active]:border-b-2 data-[state=active]:border-gray-800 data-[state=active]:shadow-none bg-transparent rounded-none"
          >
            {t("feed.tabs.following")}
          </TabsTrigger>
          <TabsTrigger
            value="liked"
            onClick={() => navigate("/feed/liked")}
            className="text-sm uppercase tracking-widest text-slate-300 hover:text-gray-800 transition-colors pb-4 -mb-[18px] data-[state=active]:text-gray-800 data-[state=active]:border-b-2 data-[state=active]:border-gray-800 data-[state=active]:shadow-none bg-transparent rounded-none"
          >
            {t("feed.tabs.liked")}
          </TabsTrigger>
        </TabsList>

        <div className="relative bg-transparent m-0 p-0">
          <FeedList
            definitions={allFeed.definitions}
            loading={allFeed.loading}
            emptyMessage={t("feed.empty")}
          />
        </div>
      </Tabs>
    </Page>
  );
}
