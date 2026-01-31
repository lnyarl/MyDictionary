import { Flag, History, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LikeButton } from "@/components/definitions/LikeButton";
import { ReportDialog } from "@/components/definitions/ReportDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import type { Definition } from "@/types/definition.types";
import { DefinitionCardContent } from "./DefinitionCardContent";

interface DefinitionCardProps {
  definition: Definition;
  onDelete: (id: string) => void;
  onViewHistory: (definitionId: string) => void;
  onStartEdit?: () => void;
}

export function DefinitionCard({
  definition,
  onDelete,
  onViewHistory,
  onStartEdit,
}: DefinitionCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isOwner = user?.id === definition.userId;

  const formattedDate = new Date(definition.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isEdited = definition.updatedAt !== definition.createdAt;

  return (
    <Card className="relative transition-all overflow-hidden hover:shadow-md">
      <div className="absolute top-4 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewHistory(definition.id)}>
              <History className="mr-2 h-4 w-4" />
              {t("word.history")}
            </DropdownMenuItem>
            {isOwner && onStartEdit && (
              <DropdownMenuItem onClick={onStartEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                {t("common.edit")}
              </DropdownMenuItem>
            )}
            {!isOwner && user && (
              <ReportDialog
                reportedUserId={definition.userId}
                definitionId={definition.id}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Flag className="mr-2 h-4 w-4" />
                    {t("common.report")}
                  </DropdownMenuItem>
                }
              />
            )}
            {isOwner && (
              <DropdownMenuItem
                onClick={() => onDelete(definition.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("common.delete")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-6">
        <DefinitionCardContent
          definition={definition}
          isEdited={isEdited}
          formattedDate={formattedDate}
          likeButton={
            <LikeButton
              definitionId={definition.id}
              initialLikesCount={definition.likesCount}
              initialIsLiked={definition.isLiked}
              isOwnDefinition={isOwner}
            />
          }
        />
      </div>
    </Card>
  );
}
