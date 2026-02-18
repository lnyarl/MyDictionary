import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type {
  CreateDefinitionInput,
  Definition,
  UpdateDefinitionInput,
} from "../lib/api/definitions";
import { definitionsApi } from "../lib/api/definitions";

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

export function useDefinitions() {
  const queryClient = useQueryClient();
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDefinitions = useCallback(async (wordId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await definitionsApi.getByWord(wordId);
      setDefinitions(data);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to fetch definitions"));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDefinitionsByTerm = useCallback(async (term: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await definitionsApi.getByTerm(term);
      setDefinitions(data);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to fetch definitions"));
    } finally {
      setLoading(false);
    }
  }, []);

  const createMutation = useMutation({
    mutationFn: (input: CreateDefinitionInput) => definitionsApi.create(input),
    onSuccess: (newDefinition) => {
      setDefinitions((prev) => [newDefinition, ...prev]);
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDefinitionInput }) =>
      definitionsApi.update(id, input),
    onSuccess: (updatedDefinition, variables) => {
      setDefinitions((prev) =>
        prev.map((def) => (def.id === variables.id ? { ...def, ...updatedDefinition } : def)),
      );
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => definitionsApi.delete(id),
    onSuccess: (_, id) => {
      setDefinitions((prev) => prev.filter((def) => def.id !== id));
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  return {
    definitions,
    loading:
      loading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error,
    fetchDefinitions,
    fetchDefinitionsByTerm,
    createDefinition: createMutation.mutateAsync,
    updateDefinition: (id: string, input: UpdateDefinitionInput) =>
      updateMutation.mutateAsync({ id, input }),
    deleteDefinition: deleteMutation.mutateAsync,
  };
}
