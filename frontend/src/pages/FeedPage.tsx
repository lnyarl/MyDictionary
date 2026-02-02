import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { FeedList } from "@/components/feed/FeedList";
import { useAllFeed } from "@/hooks/useAllFeed";
import { useDefinitions } from "@/hooks/useDefinitions";
import { useFeed } from "@/hooks/useFeed";
import { useMyFeed } from "@/hooks/useMyFeed";
import { FeedForm } from "../components/feed/FeedForm";
import { Page } from "../components/layout/Page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import type { CreateWordInput } from "../types/word.types";

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

  const { deleteDefinition } = useDefinitions();
  const handleDelete = async (definitionId: string) => {
    if (confirm(t("dashboard.delete_confirm"))) {
      await deleteDefinition(definitionId);
      await myFeed.fetchMyFeed(1);
      await allFeed.fetchAllFeed(1);
    }
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
        <TabsList className="h-auto p-0 bg-transparent gap-1 justify-start border-b-0 relative z-10 -mb-px">
          <TabsTrigger
            value="all"
            className="px-6 py-2  rounded-b-none cursor-pointer border border-gray-200 data-[state=active]:border-t-black data-[state=active]:border-t-2"
          >
            {t("feed.tabs.all")}
          </TabsTrigger>
          <TabsTrigger
            value="following"
            className="px-6 py-2  rounded-b-none cursor-pointer border border-gray-200 data-[state=active]:border-t-black data-[state=active]:border-t-2"
          >
            {t("feed.tabs.following")}
          </TabsTrigger>
        </TabsList>

        <div className="shadow-[0_0_10px_1px_rgba(0,0,0,0.1)] relative">
          <TabsContent value="all" className="m-0 p-6 ">
            <FeedList
              definitions={allFeed.definitions}
              onDelete={handleDelete}
            />
          </TabsContent>

          <TabsContent value="following" className="m-0 p-6">
            <FeedList
              definitions={followingFeed.definitions}
              onDelete={handleDelete}
            />
          </TabsContent>
        </div>
      </Tabs>
    </Page>
  );
}
