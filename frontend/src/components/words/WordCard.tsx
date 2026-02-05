import { Edit2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { Word } from "@/lib/api/words";
import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

type WordCardProps = {
  word: Word;
  onEdit: (word: Word) => void;
  onDelete: (id: string) => void;
};

export function WordCard({ word, onEdit, onDelete }: WordCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const formattedDate = new Date(word.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleCardClick = () => {
    navigate(`/words/${word.id}/edit`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(word);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(word.id);
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleCardClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">{word.term}</CardTitle>
            <CardDescription>{t("word.added_at", { date: formattedDate })}</CardDescription>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEditClick}
              title={t("common.edit")}
              className="hover:border-1"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteClick}
              title={t("common.delete")}
              className="hover:border-1"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
