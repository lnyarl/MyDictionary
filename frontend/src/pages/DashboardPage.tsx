import { WordForm } from "@/components/words/WordForm";
import { useAuth } from "@/hooks/useAuth";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Page } from "../components/layout/Page";
import { WordList } from "../components/words/WordList";
import { useWords } from "../hooks/useWords";
import { followsApi } from "../lib/follows";
import type { FollowStats } from "../types/follow.types";

export default function DashboardPage() {
	const { t } = useTranslation();
	const { user } = useAuth();
	const { words, createWord, loading, fetchWords, deleteWord } = useWords();

	const [stats, setStats] = useState<FollowStats | null>(null);
	const handleSubmit = async (term: string) => {
		await createWord({ term });
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
		fetchWords();
		fetchFollowStats();
	}, [fetchWords, fetchFollowStats]);

	const handleDelete = async (id: string) => {
		if (confirm(t("dashboard.delete_confirm"))) {
			await deleteWord(id);
		}
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
			<div className="mb-8">
				<WordForm onSubmit={handleSubmit} mode={"create"} />
			</div>
			{loading && words.length === 0 ? (
				<div className="rounded-lg border bg-muted/50 p-12 text-center">
					<p className="text-muted-foreground">{t("common.loading")}</p>
				</div>
			) : (
				<WordList
					words={words}
					onEdit={() => {
						throw new Error("TODO Edit Word");
					}}
					onDelete={handleDelete}
				/>
			)}
		</Page>
	);
}
