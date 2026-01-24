import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DefinitionCard } from "../components/definitions/DefinitionCard";
import { Page } from "../components/layout/Page";
import { Button } from "../components/ui/button";
import { useAllFeed } from "@/hooks/useAllFeed";

export default function FeedPage() {
	const { t } = useTranslation();
	const { definitions, loading, fetchAllFeed, loadMore, hasMore } = useAllFeed();

	useEffect(() => {
		fetchAllFeed();
	}, [fetchAllFeed]);

	const handleDelete = async () => {
		fetchAllFeed(1);
	};

	const handleViewHistory = () => {};

	return (
		<Page>
			<div className="mb-8">
				<h1 className="text-3xl font-bold">{t("header.feed")}</h1>
				<p className="text-muted-foreground mt-2">{t("feed.subtitle")}</p>
			</div>

			{loading && definitions.length === 0 ? (
				<div className="rounded-lg border bg-muted/50 p-12 text-center">
					<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
					<p className="text-muted-foreground">{t("common.loading")}</p>
				</div>
			) : definitions.length === 0 ? (
				<div className="rounded-lg border border-dashed p-12 text-center">
					<p className="text-muted-foreground">{t("feed.empty")}</p>
				</div>
			) : (
				<>
					<div className="space-y-4">
						{definitions.map((definition) => (
							<DefinitionCard
								key={definition.id}
								definition={definition}
								onDelete={handleDelete}
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
			)}
		</Page>
	);
}
