import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DefinitionHistoryDialog } from "@/components/definitions/DefinitionHistoryDialog";
import { DefinitionList } from "@/components/definitions/DefinitionList";
import { WordForm } from "@/components/words/WordForm";
import { useAuth } from "@/hooks/useAuth";
import { useDefinitions } from "@/hooks/useDefinitions";
import { useMyFeed } from "@/hooks/useMyFeed";
import { Page } from "../components/layout/Page";
import { followsApi } from "../lib/follows";
import type { FollowStats } from "../types/follow.types";
import type { CreateWordInput } from "../types/word.types";

export default function DashboardPage() {
	const { t } = useTranslation();
	const { user } = useAuth();
	const { definitions, createFeed, fetchMyFeed, loading } = useMyFeed();
	const { deleteDefinition, updateDefinition } = useDefinitions();
	const [selectedDefinitionId, setSelectedDefinitionId] = useState<
		string | null
	>(null);
	const [isHistoryOpen, setIsHistoryOpen] = useState(false);

	const [stats, setStats] = useState<FollowStats | null>(null);
	const handleSubmit = async (data: CreateWordInput) => {
		await createFeed(data);
	};

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
					<p className="text-muted-foreground mt-2">
						{t("dashboard.subtitle")}
					</p>
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
			<div className="mb-8">
				<WordForm onCreate={handleSubmit} />
			</div>
			{loading && definitions.length === 0 ? (
				<div className="rounded-lg border bg-muted/50 p-12 text-center">
					<p className="text-muted-foreground">{t("common.loading")}</p>
				</div>
			) : (
				<DefinitionList
					definitions={definitions}
					onDelete={handleDelete}
					onViewHistory={handleViewHistory}
					onEdit={handleEdit}
				/>
			)}
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
