import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Page } from "../components/layout/Page";
import { Button } from "../components/ui/button";
import { WordForm } from "../components/words/WordForm";
import { WordList } from "../components/words/WordList";
import { useAuth } from "../contexts/AuthContext";
import { useWords } from "../hooks/useWords";
import type { Word } from "../types/word.types";

export default function DashboardPage() {
	const { user } = useAuth();
	const { words, loading, fetchWords, createWord, updateWord, deleteWord } =
		useWords();

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingWord, setEditingWord] = useState<Word | undefined>(undefined);

	useEffect(() => {
		fetchWords();
	}, [fetchWords]);

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
		if (confirm("정말 이 단어를 삭제하시겠습니까?")) {
			await deleteWord(id);
		}
	};

	return (
		<Page>
			<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">
							안녕하세요, {user?.nickname}님!
						</h1>
						<p className="text-muted-foreground mt-2">
							나만의 단어 사전을 만들어보세요.
						</p>
					</div>
					<Button onClick={handleCreate} size="lg">
						<Plus className="mr-2 h-4 w-4" />
						단어 추가
					</Button>
				</div>

				<div className="grid gap-4 md:grid-cols-3 mb-8">
					<div className="rounded-lg border bg-card p-6">
						<h3 className="font-semibold mb-2">내 단어</h3>
						<p className="text-3xl font-bold">{words.length}</p>
						<p className="text-sm text-muted-foreground mt-1">
							{words.length === 0 ? "아직 단어가 없습니다" : "개의 단어"}
						</p>
					</div>

					<div className="rounded-lg border bg-card p-6">
						<h3 className="font-semibold mb-2">내 정의</h3>
						<p className="text-3xl font-bold">0</p>
						<p className="text-sm text-muted-foreground mt-1">개의 정의</p>
					</div>

					<div className="rounded-lg border bg-card p-6">
						<h3 className="font-semibold mb-2">받은 좋아요</h3>
						<p className="text-3xl font-bold">0</p>
						<p className="text-sm text-muted-foreground mt-1">개의 좋아요</p>
					</div>
				</div>

				{loading && words.length === 0 ? (
					<div className="rounded-lg border bg-muted/50 p-12 text-center">
						<p className="text-muted-foreground">로딩 중...</p>
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
