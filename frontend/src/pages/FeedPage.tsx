import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { FeedList } from "@/components/feed/FeedList";
import { useAllFeed } from "@/hooks/useAllFeed";
import { useFeed } from "@/hooks/useFeed";
import { useMyFeed } from "@/hooks/useMyFeed";
import type { CreateFeedInput } from "@/lib/api/feed";
import { FeedForm } from "../components/feed/FeedForm";
import { Page } from "../components/layout/Page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export default function FeedPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tab } = useParams<{ tab: string }>();
  const activeTab = tab || "all";

  const allFeed = useAllFeed();
  const followingFeed = useFeed();
  const myFeed = useMyFeed();

  const handleSubmit = async (data: CreateFeedInput) => {
    allFeed.definitions.push(await myFeed.createFeed(data));
    myFeed.definitions.push(await myFeed.createFeed(data));
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
        <TabsList className="h-auto p-0 bg-transparent justify-start flex gap-8 mb-12 border-b border-gray-200 pb-4 w-full">
          <TabsTrigger
            value="all"
            className="text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-gray-800 transition-colors pb-4 -mb-[18px] data-[state=active]:font-black data-[state=active]:text-gray-800 data-[state=active]:border-b-2 data-[state=active]:border-gray-800 data-[state=active]:shadow-none bg-transparent rounded-none"
          >
            {t("feed.tabs.all")}
          </TabsTrigger>
          <TabsTrigger
            value="following"
            className="text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-gray-800 transition-colors pb-4 -mb-[18px] data-[state=active]:font-black data-[state=active]:text-gray-800 data-[state=active]:border-b-2 data-[state=active]:border-gray-800 data-[state=active]:shadow-none bg-transparent rounded-none"
          >
            {t("feed.tabs.following")}
          </TabsTrigger>
        </TabsList>

        <div className="relative bg-transparent">
          <TabsContent value="all" className="m-0 p-6 ">
            <FeedList definitions={allFeed.definitions} />
          </TabsContent>

          <TabsContent value="following" className="m-0 p-6">
            <FeedList definitions={followingFeed.definitions} />
          </TabsContent>
        </div>
      </Tabs>
    </Page>
  );
}
