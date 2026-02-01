import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { DefinitionList } from "@/components/definitions/DefinitionList";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { useDefinitions } from "@/hooks/useDefinitions";

export default function WordDetailPage() {
  const { t } = useTranslation();
  const { term } = useParams<{ term: string }>();
  const navigate = useNavigate();
  const { definitions, loading, fetchDefinitionsByTerm, updateDefinition, deleteDefinition } =
    useDefinitions();

  useEffect(() => {
    if (term) {
      fetchDefinitionsByTerm(term);
    }
  }, [term, fetchDefinitionsByTerm]);

  const handleDelete = async (id: string) => {
    if (confirm(t("word.delete_definition_confirm"))) {
      await deleteDefinition(id);
    }
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

  if (!term) return null;

  const sortedDefinitions = [...definitions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <Page>
      <div className="mb-8">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground break-words leading-tight">
          {term}
        </h1>
      </div>

      <div className="space-y-4">
        {loading && definitions.length === 0 ? (
          <div className="rounded-lg border bg-muted/50 p-12 text-center">
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        ) : (
          <DefinitionList
            definitions={sortedDefinitions}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
      </div>
    </Page>
  );
}
