import { useCallback, useState } from "react";
import { definitionsApi } from "../lib/definitions";
import type { CreateDefinitionInput, Definition } from "../types/definition.types";

export function useDefinitions(wordId: string) {
	const [definitions, setDefinitions] = useState<Definition[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchDefinitions = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await definitionsApi.getByWord(wordId);
			setDefinitions(data);
		} catch (err: any) {
			setError(err.message || "Failed to fetch definitions");
		} finally {
			setLoading(false);
		}
	}, [wordId]);

	const createDefinition = useCallback(async (input: CreateDefinitionInput) => {
		setLoading(true);
		setError(null);
		try {
			const newDefinition = await definitionsApi.create(input);
			setDefinitions((prev) => [newDefinition, ...prev]);
			return newDefinition;
		} catch (err: any) {
			setError(err.message || "Failed to create definition");
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	const deleteDefinition = useCallback(async (id: string) => {
		setLoading(true);
		setError(null);
		try {
			await definitionsApi.delete(id);
			setDefinitions((prev) => prev.filter((def) => def.id !== id));
		} catch (err: any) {
			setError(err.message || "Failed to delete definition");
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		definitions,
		loading,
		error,
		fetchDefinitions,
		createDefinition,
		deleteDefinition,
	};
}
