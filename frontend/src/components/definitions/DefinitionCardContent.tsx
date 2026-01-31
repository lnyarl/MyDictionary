import { ExternalLink, Globe, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FeedCardContent as RichTextContent } from "@/components/feed/FeedCardContent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Definition } from "@/types/definition.types";

interface DefinitionCardContentProps {
  definition: Definition;
  isEdited?: boolean;
  formattedDate: string;
  likeButton?: React.ReactNode;
}

export function DefinitionCardContent({
  definition,
  isEdited,
  formattedDate,
  likeButton,
}: DefinitionCardContentProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: need to re-run when content changes
  useEffect(() => {
    if (contentRef.current) {
      setIsTruncated(contentRef.current.scrollHeight > contentRef.current.clientHeight);
    }
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
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex-1 mb-4">
        <div ref={contentRef} className="max-h-[200px] overflow-hidden relative text-sm">
          <RichTextContent content={definition.content} />
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
              <RichTextContent content={definition.content} />
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

      <div className="flex items-center justify-between pt-2 mt-auto">
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
        <div className="flex items-center gap-2">
          {likeButton}
          <div className="text-muted-foreground">
            {definition.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
          </div>
        </div>
      </div>
    </div>
  );
}
