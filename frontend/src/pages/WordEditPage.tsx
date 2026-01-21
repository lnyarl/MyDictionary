import { ArrowLeft, Globe, Lock, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { DefinitionForm } from "../components/definitions/DefinitionForm";
import { DefinitionHistoryDialog } from "../components/definitions/DefinitionHistoryDialog";
import { DefinitionList } from "../components/definitions/DefinitionList";
import { Page } from "../components/layout/Page";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { useDefinitions } from "../hooks/useDefinitions";
import { useWords } from "../hooks/useWords";

export default function WordEditPage() {
	const { t } = useTranslation();
	const { wordId } = useParams<{ wordId: string }>();
	const navigate = useNavigate();

	const { words, fetchWords } = useWords();
	const { definitions, loading, fetchDefinitions, createDefinition, deleteDefinition } =
		useDefinitions(wordId || "");

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isHistoryOpen, setIsHistoryOpen] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

	useEffect(() => {
		if (!wordId) {
			navigate("/dashboard");
		}
	}, [wordId, navigate]);

	const word = words.find((w) => w.id === wordId);

	useEffect(() => {
		if (words.length === 0) {
			fetchWords();
		}
	}, [words.length, fetchWords]);

	useEffect(() => {
		if (wordId) {
			fetchDefinitions();
		}
	}, [fetchDefinitions, wordId]);

	if (!wordId) {
		return null;
	}

	const handleCreate = () => {
		setIsFormOpen(true);
	};

	const handleSubmit = async (data: { content: string; tags: string[]; files: File[] }) => {
		await createDefinition({
			wordId: wordId || "",
			content: data.content,
			tags: data.tags,
			files: data.files,
		});
	};

	const handleDelete = async (id: string) => {
		if (confirm(t("word.delete_definition_confirm"))) {
			await deleteDefinition(id);
		}
	};

	const handleViewHistory = (userId: string) => {
		setSelectedUserId(userId);
		setIsHistoryOpen(true);
	};

	return (
		<Page>
			<Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
				<ArrowLeft className="mr-2 h-4 w-4" />
				{t("common.back_to_dashboard")}
			</Button>

			<Card className="mb-8">
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="text-4xl">{word?.term || t("common.loading")}</CardTitle>
						{word && (
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								{word.isPublic ? (
									<>
										<Globe className="h-4 w-4" />
										<span>{t("word.public")}</span>
									</>
								) : (
									<>
										<Lock className="h-4 w-4" />
										<span>{t("word.private")}</span>
									</>
								)}
							</div>
						)}
					</div>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						{word
							? t("word.added_at", { date: new Date(word.createdAt).toLocaleDateString("ko-KR") })
							: ""}
					</p>
				</CardContent>
			</Card>

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-semibold">{t("word.definition")}</h2>
					<Button onClick={handleCreate}>
						<Plus className="mr-2 h-4 w-4" />
						{t("word.add_definition")}
					</Button>
				</div>

				<Separator />

				{loading && definitions.length === 0 ? (
					<div className="rounded-lg border bg-muted/50 p-12 text-center">
						<p className="text-muted-foreground">{t("common.loading")}</p>
					</div>
				) : (
					<DefinitionList
						definitions={definitions}
						onDelete={handleDelete}
						onViewHistory={handleViewHistory}
					/>
				)}
			</div>

			<DefinitionForm open={isFormOpen} onOpenChange={setIsFormOpen} onSubmit={handleSubmit} />

			{selectedUserId && (
				<DefinitionHistoryDialog
					open={isHistoryOpen}
					onOpenChange={setIsHistoryOpen}
					wordId={wordId}
					userId={selectedUserId}
					userName={definitions.find((d) => d.userId === selectedUserId)?.nickname}
				/>
			)}
		</Page>
	);
}
