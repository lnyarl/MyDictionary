import { ArrowLeft, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { DefinitionForm } from "../components/definitions/DefinitionForm";
import { DefinitionHistoryDialog } from "../components/definitions/DefinitionHistoryDialog";
import { FeedList } from "../components/feed/FeedList";
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
	const {
		definitions,
		loading,
		fetchDefinitions,
		createDefinition,
		updateDefinition,
		deleteDefinition,
	} = useDefinitions();

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isHistoryOpen, setIsHistoryOpen] = useState(false);
	const [selectedDefinitionId, setSelectedDefinitionId] = useState<string | null>(null);

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
			fetchDefinitions(wordId);
		}
	}, [fetchDefinitions, wordId]);

	if (!wordId) {
		return null;
	}

	const handleCreate = () => {
		setIsFormOpen(true);
	};

	const handleSubmit = async (data: {
		content: string;
		tags: string[];
		isPublic: boolean;
		files: File[];
	}) => {
		await createDefinition({
			wordId: wordId || "",
			content: data.content,
			tags: data.tags,
			isPublic: data.isPublic,
			files: data.files,
		});
	};

	const handleDelete = async (id: string) => {
		if (confirm(t("word.delete_definition_confirm"))) {
			await deleteDefinition(id);
		}
	};

	const handleViewHistory = (definitionId: string) => {
		setSelectedDefinitionId(definitionId);
		setIsHistoryOpen(true);
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
			<Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
				<ArrowLeft className="mr-2 h-4 w-4" />
				{t("common.back_to_dashboard")}
			</Button>

			<Card className="mb-8">
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="text-4xl">{word?.term || t("common.loading")}</CardTitle>
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
					<FeedList
						definitions={definitions}
						onDelete={handleDelete}
						onViewHistory={handleViewHistory}
						onEdit={handleEdit}
					/>
				)}
			</div>

			<DefinitionForm open={isFormOpen} onOpenChange={setIsFormOpen} onSubmit={handleSubmit} />

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
