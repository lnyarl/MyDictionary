import type { Definition } from "@stashy/shared";
import { useState } from "react";
import { FeedEditCard } from "@/components/feed/FeedEditCard";
import { useAuth } from "@/hooks/useAuth";
import { DefinitionCard } from "./DefinitionCard";

type DefinitionListProps = {
  definitions: Definition[];
  onDelete: (id: string) => void;
  onEdit?: (
    id: string,
    data: { content: string; tags: string[]; isPublic: boolean },
  ) => Promise<void>;
};

export function DefinitionList({ definitions, onDelete, onEdit }: DefinitionListProps) {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (definitions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">아직 정의가 없습니다. 첫 정의를 추가해보세요!</p>
      </div>
    );
  }

  const handleSave = async (
    id: string,
    data: { content: string; tags: string[]; isPublic: boolean },
  ) => {
    if (!onEdit) return;
    await onEdit(id, data);
    setEditingId(null);
  };

  return (
    <div className="grid gap-4">
      {definitions.map((definition) => {
        const isOwner = user?.id === definition.userId;
        const isEditing = editingId === definition.id;

        if (isEditing) {
          return (
            <FeedEditCard
              key={definition.id}
              definition={definition}
              onSave={(data) => handleSave(definition.id, data)}
              onCancel={() => setEditingId(null)}
            />
          );
        }

        return (
          <DefinitionCard
            key={definition.id}
            definition={definition}
            onDelete={onDelete}
            onStartEdit={isOwner && onEdit ? () => setEditingId(definition.id) : undefined}
          />
        );
      })}
    </div>
  );
}
