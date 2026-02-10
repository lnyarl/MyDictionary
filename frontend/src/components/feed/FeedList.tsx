import type { Definition } from "@stashy/shared";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
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
  className?: string;
  option?: { showUser: boolean };
  loading?: boolean;
  emptyMessage?: string;
};

export function FeedList({
  definitions,
  onDelete,
  onEdit,
  className,
  option = { showUser: true },
  loading = false,
  emptyMessage,
}: FeedListProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowLoading(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    if (!showLoading) {
      return null;
    }
    return (
      <div className="rounded-lg border bg-muted/50 p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (definitions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
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
            index={definitions.indexOf(definition) + 1}
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
