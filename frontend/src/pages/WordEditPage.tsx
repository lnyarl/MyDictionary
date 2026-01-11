import { ArrowLeft, Globe, Lock, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DefinitionForm } from "../components/definitions/DefinitionForm";
import { DefinitionHistoryDialog } from "../components/definitions/DefinitionHistoryDialog";
import { DefinitionList } from "../components/definitions/DefinitionList";
import { Page } from "../components/layout/Page";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { useDefinitions } from "../hooks/useDefinitions";
import { useWords } from "../hooks/useWords";

export default function WordEditPage() {
	const { wordId } = useParams<{ wordId: string }>();
	const navigate = useNavigate();

	if (!wordId) {
		navigate("/dashboard");
		return null;
	}

	const { words, fetchWords } = useWords();
	const {
		definitions,
		loading,
		fetchDefinitions,
		createDefinition,
		deleteDefinition,
	} = useDefinitions(wordId);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isHistoryOpen, setIsHistoryOpen] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

	const word = words.find((w) => w.id === wordId);

	useEffect(() => {
		if (words.length === 0) {
			fetchWords();
		}
	}, [words.length, fetchWords]);

	useEffect(() => {
		fetchDefinitions();
	}, [fetchDefinitions]);

	const handleCreate = () => {
		setIsFormOpen(true);
	};

	const handleSubmit = async (content: string) => {
		await createDefinition({ content, wordId });
	};

	const handleDelete = async (id: string) => {
		if (confirm("정말 이 정의를 삭제하시겠습니까?")) {
			await deleteDefinition(id);
		}
	};

	const handleViewHistory = (userId: string) => {
		setSelectedUserId(userId);
		setIsHistoryOpen(true);
	};

	return (
		<Page>
			<Button
				variant="ghost"
				onClick={() => navigate("/dashboard")}
				className="mb-4"
			>
				<ArrowLeft className="mr-2 h-4 w-4" />
				대시보드로 돌아가기
			</Button>

				<Card className="mb-8">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-4xl">
								{word?.term || "로딩 중..."}
							</CardTitle>
							{word && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									{word.isPublic ? (
										<>
											<Globe className="h-4 w-4" />
											<span>공개</span>
										</>
									) : (
										<>
											<Lock className="h-4 w-4" />
											<span>비공개</span>
										</>
									)}
								</div>
							)}
						</div>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">
							{word
								? `${new Date(word.createdAt).toLocaleDateString("ko-KR")}에 추가됨`
								: ""}
						</p>
					</CardContent>
				</Card>

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-semibold">정의</h2>
						<Button onClick={handleCreate}>
							<Plus className="mr-2 h-4 w-4" />
							정의 추가
						</Button>
					</div>

					<Separator />

					{loading && definitions.length === 0 ? (
						<div className="rounded-lg border bg-muted/50 p-12 text-center">
							<p className="text-muted-foreground">로딩 중...</p>
						</div>
					) : (
						<DefinitionList
							definitions={definitions}
							onDelete={handleDelete}
							onViewHistory={handleViewHistory}
						/>
					)}
				</div>

			<DefinitionForm
				open={isFormOpen}
				onOpenChange={setIsFormOpen}
				onSubmit={handleSubmit}
			/>

			{selectedUserId && (
				<DefinitionHistoryDialog
					open={isHistoryOpen}
					onOpenChange={setIsHistoryOpen}
					wordId={wordId}
					userId={selectedUserId}
					userName={
						definitions.find((d) => d.userId === selectedUserId)?.user?.nickname
					}
				/>
			)}
		</Page>
	);
}
