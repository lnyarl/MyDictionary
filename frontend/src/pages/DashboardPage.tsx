import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Page } from "../components/layout/Page";
import { Button } from "../components/ui/button";
import { WordForm } from "../components/words/WordForm";
import { WordList } from "../components/words/WordList";
import { useWords } from "../hooks/useWords";
import { followsApi } from "../lib/follows";
import type { FollowStats } from "../types/follow.types";
import type { Word } from "../types/word.types";

export default function DashboardPage() {
	const { t } = useTranslation();
	const { user } = useAuth();
	const { words, loading, fetchWords, createWord, updateWord, deleteWord } = useWords();

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingWord, setEditingWord] = useState<Word | undefined>(undefined);
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
		fetchWords();
		fetchFollowStats();
	}, [fetchWords, fetchFollowStats]);

	const handleCreate = () => {
		setEditingWord(undefined);
		setIsFormOpen(true);
	};

	const handleEdit = (word: Word) => {
		setEditingWord(word);
		setIsFormOpen(true);
	};

	const handleSubmit = async (term: string) => {
		if (editingWord) {
			await updateWord(editingWord.id, { term });
		} else {
			await createWord({ term });
		}
	};

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
				<Button onClick={handleCreate} size="lg">
					<Plus className="mr-2 h-4 w-4" />
					{t("word.add_word")}
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-2 mb-8">
				<div className="rounded-lg border bg-card p-6">
					<h3 className="font-semibold mb-2">{t("dashboard.followers")}</h3>
					<p className="text-3xl font-bold">{stats?.followersCount || 0}</p>
					<p className="text-sm text-muted-foreground mt-1">{t("dashboard.count_unit")}</p>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<h3 className="font-semibold mb-2">{t("dashboard.following")}</h3>
					<p className="text-3xl font-bold">{stats?.followingCount || 0}</p>
					<p className="text-sm text-muted-foreground mt-1">{t("dashboard.count_unit")}</p>
				</div>
			</div>

			{loading && words.length === 0 ? (
				<div className="rounded-lg border bg-muted/50 p-12 text-center">
					<p className="text-muted-foreground">{t("common.loading")}</p>
				</div>
			) : (
				<WordList words={words} onEdit={handleEdit} onDelete={handleDelete} />
			)}

			<WordForm
				open={isFormOpen}
				onOpenChange={setIsFormOpen}
				onSubmit={handleSubmit}
				word={editingWord}
				mode={editingWord ? "edit" : "create"}
			/>
		</Page>
	);
}
