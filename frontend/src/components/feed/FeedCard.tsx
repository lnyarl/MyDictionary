import {
  ExternalLink,
  Flag,
  Globe,
  History,
  Lock,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Definition } from "../../types/definition.types";
import { LikeButton } from "../definitions/LikeButton";
import { ReportDialog } from "../definitions/ReportDialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { FeedCardContent } from "./FeedCardContent";

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
  const contentRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const formattedDate = new Date(definition.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isEdited = definition.updatedAt !== definition.createdAt;

  useEffect(() => {
    if (contentRef.current) {
      setIsTruncated(contentRef.current.scrollHeight > contentRef.current.clientHeight);
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: need to re-run when content changes
  }, [definition.content]);

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/users/${definition.userId}`);
  };

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
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
        <div className="p-6 md:w-[200px] lg:w-[250px] flex-shrink-0 flex flex-col gap-4 border-b md:border-b-0 md:border-r bg-muted/10">
          <div className="flex-1">
            {showWord && definition.term ? (
              <Button
                variant="link"
                className="p-0 h-auto font-serif text-3xl md:text-4xl font-bold text-foreground whitespace-normal text-left break-words leading-tight hover:no-underline hover:text-primary transition-colors"
                onClick={() => navigate(`/words/${definition.wordId}/edit`)}
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

        <div className="flex-1 p-6 flex flex-col min-w-0">
          <div className="flex-1 mb-4">
            <div ref={contentRef} className="max-h-[200px] overflow-hidden relative">
              <FeedCardContent content={definition.content} />
              {isTruncated && (
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
              )}
            </div>
            {isTruncated && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-muted-foreground hover:text-foreground"
                  >
                    {t("common.more")}...
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl font-bold mb-4">
                      {definition.term}
                    </DialogTitle>
                  </DialogHeader>
                  <FeedCardContent content={definition.content} />
                </DialogContent>
              </Dialog>
            )}

            {definition.mediaUrls && definition.mediaUrls.length > 0 && (
              <div className="mt-4 grid gap-2 grid-cols-1 sm:grid-cols-2">
                {definition.mediaUrls.map((media) => {
                  if (media.type === "image") {
                    return (
                      <img
                        key={media.url}
                        src={media.url}
                        alt="media"
                        className="rounded-lg object-cover w-full h-48 border"
                      />
                    );
                  }
                  if (media.type === "video") {
                    return (
                      <video
                        key={media.url}
                        src={media.url}
                        controls
                        className="rounded-lg w-full h-48 object-cover border"
                      >
                        <track kind="captions" />
                      </video>
                    );
                  }
                  return (
                    <a
                      key={media.url}
                      href={media.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block group rounded-lg border overflow-hidden hover:bg-muted/50 transition-colors"
                    >
                      {media.image && (
                        <img
                          src={media.image}
                          alt={media.title || "Link preview"}
                          className="w-full h-32 object-cover"
                        />
                      )}
                      <div className="p-3">
                        <h4 className="font-semibold text-sm truncate group-hover:text-primary">
                          {media.title || media.url}
                        </h4>
                        {media.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {media.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <ExternalLink className="h-3 w-3" />
                          <span className="truncate">{getHostname(media.url)}</span>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}

            {definition.tags && definition.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {definition.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t mt-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Avatar className="h-6 w-6 cursor-pointer border" onClick={handleUserClick}>
                <AvatarImage src={definition.profilePicture} className="object-cover" />
                <AvatarFallback>{definition.nickname?.[0].toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <Button
                variant="link"
                className="p-0 h-auto text-sm text-muted-foreground font-medium hover:text-foreground"
                onClick={handleUserClick}
              >
                {definition.nickname || t("common.user")}
              </Button>
              <span className="text-muted-foreground/50">•</span>
              <span>{formattedDate}</span>
              {isEdited && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="text-xs">(edited)</span>
                </>
              )}
            </div>
            <div className="text-muted-foreground">
              {definition.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
