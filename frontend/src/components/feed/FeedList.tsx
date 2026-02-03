import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Definition } from "@/lib/api/definitions";
import { cn } from "@/lib/utils";
import { FeedCard } from "./FeedCard";
import { FeedEditCard } from "./FeedEditCard";

type FeedListProps = {
  definitions: Definition[];
  onDelete?: (id: string) => void;
  onEdit?: (
    id: string,
    data: { content: string; tags: string[]; isPublic: boolean },
  ) => Promise<void>;
  className?: string
  option?: { showUser: boolean }
}

export function FeedList({ definitions, onDelete, onEdit, className, option = { showUser: true } }: FeedListProps) {
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
    <div className={cn("grid gap-0", className)}>
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
          <FeedCard
            key={definition.id}
            definition={definition}
            onDelete={onDelete}
            onStartEdit={isOwner && onEdit ? () => setEditingId(definition.id) : undefined}
            option={option}
          />
        );
      })}
    </div>
  );
}
