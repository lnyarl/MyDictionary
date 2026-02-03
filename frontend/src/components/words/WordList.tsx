import type { Word } from "@/lib/api/words";
import { WordCard } from "./WordCard";

type WordListProps = {
	words: Word[];
	onEdit: (word: Word) => void;
	onDelete: (id: string) => void;
}

export function WordList({ words, onEdit, onDelete }: WordListProps) {
	if (words.length === 0) {
		return (
			<div className="rounded-lg border border-dashed p-12 text-center">
				<p className="text-muted-foreground">아직 단어가 없습니다. 첫 단어를 추가해보세요!</p>
			</div>
		);
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{words.map((word) => (
				<WordCard key={word.id} word={word} onEdit={onEdit} onDelete={onDelete} />
			))}
		</div>
	);
}
