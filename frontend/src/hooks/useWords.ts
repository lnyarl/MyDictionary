import { useCallback, useState } from "react";
import { wordsApi } from "../lib/words";
import type {
	CreateWordInput,
	UpdateWordInput,
	Word,
} from "../types/word.types";

export function useWords() {
	const [words, setWords] = useState<Word[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchWords = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await wordsApi.getAll();
			setWords(data);
		} catch (err: any) {
			setError(err.message || "Failed to fetch words");
		} finally {
			setLoading(false);
		}
	}, []);

	const createWord = useCallback(async (input: CreateWordInput) => {
		setLoading(true);
		setError(null);
		try {
			const newWord = await wordsApi.create(input);
			setWords((prev) => [newWord, ...prev]);
			return newWord;
		} catch (err: any) {
			setError(err.message || "Failed to create word");
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	const updateWord = useCallback(async (id: string, input: UpdateWordInput) => {
		setLoading(true);
		setError(null);
		try {
			const updatedWord = await wordsApi.update(id, input);
			setWords((prev) =>
				prev.map((word) => (word.id === id ? updatedWord : word)),
			);
			return updatedWord;
		} catch (err: any) {
			setError(err.message || "Failed to update word");
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	const deleteWord = useCallback(async (id: string) => {
		setLoading(true);
		setError(null);
		try {
			await wordsApi.delete(id);
			setWords((prev) => prev.filter((word) => word.id !== id));
		} catch (err: any) {
			setError(err.message || "Failed to delete word");
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		words,
		loading,
		error,
		fetchWords,
		createWord,
		updateWord,
		deleteWord,
	};
}
