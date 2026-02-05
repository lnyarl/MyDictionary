import { ExternalLink, Flag, Heart, MoreVertical, Pencil, Share, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Definition } from "@/lib/api/definitions";
import { stringToColor } from "@/lib/utils/color-generator";
import { i18nToIsoLocale } from "@/lib/utils/date";
import { LikeButton } from "../definitions/LikeButton";
import { ReportDialog } from "../definitions/ReportDialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { FeedCardContent as RichTextContent } from "./FeedCardContent";

type FeedCardProps = {
  definition: Definition;
  onDelete?: (id: string) => void;
  onStartEdit?: () => void;
  option: { showUser: boolean };
  index?: number;
};

export function FeedCard({
  definition,
  onDelete,
  onStartEdit,
  option = { showUser: true },
  index,
}: FeedCardProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.id === definition.userId;

  const formattedDate = new Date(definition.createdAt).toLocaleDateString(
    i18nToIsoLocale[i18n.language],
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const handleTermClick = () => {
    navigate(`/word/${encodeURIComponent(definition.term)}`);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user?.nickname === definition.nickname) {
      navigate("/profile");
    } else {
      navigate(`/profile/${definition.nickname}`);
    }
  };

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      setIsTruncated(contentRef.current.scrollHeight > contentRef.current.clientHeight);
    }
  }, [definition.content]);

  const needMoreMenu = onDelete || onStartEdit || !isOwner;

  return (
    <article className="grid grid-cols-1 md:grid-cols-[140px_1fr] group border-b border-gray-100 items-start transition-colors hover:bg-accent/5 -mx-4 px-4 pt-2 pb-4 relative">
      <div className="flex flex-col">
        {index !== undefined && (
          <span className="text-[10px] font-black text-primary mb-3 tracking-widest uppercase opacity-40 group-hover:opacity-100 transition-opacity">
            No. {definition.termNumber.toString().padStart(2, "0")}
          </span>
        )}
        <h2
          onClick={handleTermClick}
          className="editorial-number font-serif text-3xl font-medium text-foreground italic transition-all cursor-pointer "
        >
          {definition.term}
        </h2>
      </div>

      <div className="pl-0 md:pl-16 w-full min-w-0">
        <div className="relative mb-10">
          <div
            ref={contentRef}
            className="text-2xl text-foreground leading-snug font-light max-w-2xl font-sans tracking-tight max-h-[300px] overflow-hidden"
          >
            <RichTextContent content={definition.content} />
          </div>
          {isTruncated && (
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
          )}
          {isTruncated && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-gray-700 hover:text-foreground"
                >
                  [ {t("common.more")} ]...
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl font-bold mb-4">
                    {definition.term}
                  </DialogTitle>
                </DialogHeader>
                <RichTextContent content={definition.content} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {definition.mediaUrls && definition.mediaUrls.length > 0 && (
          <div className="mb-10 grid gap-2 grid-cols-1 sm:grid-cols-2 max-w-2xl">
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
                  className="block group/media rounded-lg border overflow-hidden hover:bg-muted/50 transition-colors"
                >
                  {media.image && (
                    <img
                      src={media.image}
                      alt={media.title || "Link preview"}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-3">
                    <h4 className="font-semibold text-sm truncate group-hover/media:text-primary">
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
          <div className="mb-10 flex flex-wrap gap-2">
            {definition.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-6">
            {option.showUser && (
              <a
                href={isOwner ? "/profile" : `/profile/${definition.nickname}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleUserClick(e);
                }}
                className="cursor-pointer flex items-center gap-3"
              >
                <Avatar className={`h-6 w-6 transition-all border border-gray-300 bg-[${stringToColor(definition.id)}]`}>
                  <AvatarImage src={definition.profilePicture} className="object-cover" />
                  <AvatarFallback>{definition.nickname?.[0].toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <span className="text-[10px] tracking-widest text-foreground">
                  @{definition.nickname || t("common.user")}
                </span>
              </a>
            )}
            <span className="text-[9px] text-zinc-400 uppercase tracking-widest">
              {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-2 text-zinc-300">
            <LikeButton
              definitionId={definition.id}
              initialLikesCount={definition.likesCount}
              initialIsLiked={definition.isLiked}
            />
            <button className="hover:text-foreground transition-colors" type="button">
              <Share className="h-5 w-5" />
            </button>
            {needMoreMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hover:text-foreground transition-colors h-8 w-8" >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
                  {isOwner && onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete?.(definition.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("common.delete")}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
