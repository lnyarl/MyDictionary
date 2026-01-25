import { useCallback, useState } from "react";
import { definitionsApi } from "../lib/definitions";
import type {
	CreateDefinitionInput,
	Definition,
	UpdateDefinitionInput,
} from "../types/definition.types";

export function useDefinitions() {
	const [definitions, setDefinitions] = useState<Definition[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchDefinitions = useCallback(async (wordId: string) => {
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
	}, []);

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

	const updateDefinition = useCallback(
		async (id: string, input: UpdateDefinitionInput) => {
			setLoading(true);
			setError(null);
			try {
				const updatedDefinition = await definitionsApi.update(id, input);
				setDefinitions((prev) =>
					prev.map((def) =>
						def.id === id ? { ...def, ...updatedDefinition } : def,
					),
				);
				return updatedDefinition;
			} catch (err: any) {
				setError(err.message || "Failed to update definition");
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

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
		updateDefinition,
		deleteDefinition,
	};
}
