import { Flag, History, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Definition } from "../../types/definition.types";
import { DefinitionCardContent } from "../definitions/DefinitionCardContent";
import { LikeButton } from "../definitions/LikeButton";
import { ReportDialog } from "../definitions/ReportDialog";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface FeedCardProps {
  definition: Definition;
  onDelete: (id: string) => void;
  onViewHistory: (definitionId: string) => void;
  onStartEdit?: () => void;
  showWord?: boolean;
  variant?: "default" | "borderless";
}

export function FeedCard({
  definition,
  onDelete,
  onViewHistory,
  onStartEdit,
  showWord = false,
  variant = "default",
}: FeedCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.id === definition.userId;

  const formattedDate = new Date(definition.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isEdited = definition.updatedAt !== definition.createdAt;

  // Check if term is a date (YYYY.MM.DD or YYYY. M. D.)
  const isDateTerm = /^\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.?$/.test(definition.term);

  const handleTermClick = () => {
    navigate(`/word/${definition.term}`);
  };

  return (
    <Card
      className={cn(
        "relative transition-all overflow-hidden",
        variant === "default"
          ? "hover:shadow-md"
          : "border-none shadow-none bg-transparent hover:bg-muted/30",
      )}
    >
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

      <div className="flex flex-col md:flex-row">
        {!isDateTerm && (
          <div className="p-6 md:w-[200px] lg:w-[250px] flex-shrink-0 flex flex-col gap-4 border-b md:border-b-0 md:border-r bg-muted/10">
            <div className="flex-1">
              {showWord && definition.term ? (
                <Button
                  variant="link"
                  className="p-0 h-auto font-serif text-3xl md:text-4xl font-bold text-foreground whitespace-normal text-left break-words leading-tight hover:no-underline hover:text-primary transition-colors"
                  onClick={handleTermClick}
                >
                  {definition.term}
                </Button>
              ) : (
                <div className="font-serif text-3xl md:text-4xl font-bold text-foreground break-words leading-tight">
                  {definition.term}
                </div>
              )}
            </div>
            <div className="pt-2">
              <LikeButton
                definitionId={definition.id}
                initialLikesCount={definition.likesCount}
                initialIsLiked={definition.isLiked}
                isOwnDefinition={isOwner}
              />
            </div>
          </div>
        )}

        <div className="flex-1 p-6 flex flex-col min-w-0">
          {isDateTerm && showWord && (
            <div className="mb-4">
              <Button
                variant="link"
                className="p-0 h-auto font-serif text-xl font-bold text-foreground hover:no-underline hover:text-primary transition-colors"
                onClick={handleTermClick}
              >
                {definition.term}
              </Button>
            </div>
          )}
          <DefinitionCardContent
            definition={definition}
            isEdited={isEdited}
            formattedDate={formattedDate}
            likeButton={
              isDateTerm ? (
                <LikeButton
                  definitionId={definition.id}
                  initialLikesCount={definition.likesCount}
                  initialIsLiked={definition.isLiked}
                  isOwnDefinition={isOwner}
                />
              ) : undefined
            }
          />
        </div>
      </div>
    </Card>
  );
}
