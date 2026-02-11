import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Flag, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { SEO } from "@/components/common/SEO";
import { LikeButton } from "@/components/definitions/LikeButton";
import { ReportDialog } from "@/components/definitions/ReportDialog";
import { FeedCardContent } from "@/components/feed/FeedCardContent";
import { Page } from "@/components/layout/Page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useDefinitions } from "@/hooks/useDefinitions";
import { definitionsApi } from "@/lib/api/definitions";
import { stringToColor } from "@/lib/utils/color-generator";
import { i18nToIsoLocale } from "@/lib/utils/date";

export default function DefinitionDetailPage() {
  const { definitionId } = useParams<{ definitionId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { deleteDefinition } = useDefinitions();
  const { user } = useAuth();

  const {
    data: definition,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["definition", definitionId],
    queryFn: () => {
      if (!definitionId) throw new Error("No definition ID");
      return definitionsApi.getById(definitionId);
    },
    enabled: !!definitionId,
  });

  const handleDelete = async (id: string) => {
    if (confirm(t("word.delete_definition_confirm"))) {
      await deleteDefinition(id);
      navigate(-1);
    }
  };

  const handleUserClick = (e: React.MouseEvent, nickname?: string) => {
    e.stopPropagation();
    if (!nickname) return;
    if (user?.nickname === nickname) {
      navigate("/profile");
    } else {
      navigate(`/profile/${nickname}`);
    }
  };

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  if (isLoading) {
    return (
      <Page>
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Page>
    );
  }

  if (error || !definition) {
    return (
      <Page>
        <div className="text-center p-12">
          <p className="text-muted-foreground">Definition not found</p>
          <Button onClick={() => navigate("/")} variant="link" className="mt-4">
            Go Home
          </Button>
        </div>
      </Page>
    );
  }

  const isOwner = user?.id === definition.userId;
  const formattedDate = new Date(definition.createdAt).toLocaleDateString(
    i18nToIsoLocale[i18n.language],
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const ogImageUrl = definition.mediaUrls?.find((media) => media.type === "image")?.url;

  return (
    <Page>
      <SEO
        title={definition.term}
        description={definition.content.slice(0, 150)}
        url={`/definitions/${definition.id}`}
        image={ogImageUrl}
        type="article"
      />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            className="cursor-pointer inline-block bg-muted text-muted hover:bg-muted shadow-none"
            onClick={() => navigate(`/word/${encodeURIComponent(definition.term)}`)}
          >
            {definition.termNumber && (
              <span className="text-xs font-black text-primary mb-2 block tracking-widest uppercase opacity-60">
                No. {definition.termNumber.toString().padStart(2, "0")}
              </span>
            )}
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground italic hover:text-primary/80 transition-colors mt-2 sm:mx-2">
              {definition.term}
            </h1>
          </Button>
        </div>

        <div className="mb-12 border-b border-gray-400">
          <div className="text-xl md:text-2xl font-light leading-relaxed font-sans text-foreground">
            <FeedCardContent content={definition.content} />
          </div>
        </div>

        <div className="flex items-center justify-between  pb-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 cursor-pointer group">
              <Button
                className="text-muted shadow-none bg-muted hover:bg-muted"
                onClick={(e) => handleUserClick(e, definition.nickname)}
              >
                <Avatar
                  className={`h-10 w-10 border border-gray-200 bg-[${stringToColor(definition.id)}]`}
                >
                  <AvatarImage src={definition.profilePicture} className="object-cover" />
                  <AvatarFallback>{definition.nickname?.[0].toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium group-hover:underline decoration-primary underline-offset-4">
                    @{definition.nickname || t("common.user")}
                  </span>
                  <span className="text-xs text-muted-foreground">{formattedDate}</span>
                </div>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LikeButton
              definitionId={definition.id}
              initialLikesCount={definition.likesCount}
              initialIsLiked={definition.isLiked}
            />

            {(isOwner || user) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwner && (
                    <DropdownMenuItem onClick={() => navigate(`/words/${definition.wordId}/edit`)}>
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
                      onClick={() => handleDelete(definition.id)}
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

        {definition.mediaUrls && definition.mediaUrls.length > 0 && (
          <div className="mb-12 grid gap-4 grid-cols-1 md:grid-cols-2">
            {definition.mediaUrls.map((media) => {
              if (media.type === "image") {
                return (
                  <div key={media.url} className="rounded-xl overflow-hidden border shadow-sm">
                    <img
                      src={media.url}
                      alt="media"
                      className="w-full h-auto object-cover max-h-[400px]"
                    />
                  </div>
                );
              }
              if (media.type === "video") {
                return (
                  <div
                    key={media.url}
                    className="rounded-xl overflow-hidden border shadow-sm bg-black"
                  >
                    <video
                      src={media.url}
                      controls
                      className="w-full h-full object-contain max-h-[400px]"
                    >
                      <track kind="captions" />
                    </video>
                  </div>
                );
              }
              return (
                <a
                  key={media.url}
                  href={media.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block group rounded-xl border overflow-hidden hover:shadow-md transition-all bg-card"
                >
                  {media.image && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={media.image}
                        alt={media.title || "Link preview"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                      {media.title || media.url}
                    </h4>
                    {media.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {media.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
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
          <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-400">
            {definition.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-sm px-3 py-1 cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => navigate(`/tag/${encodeURIComponent(tag)}`)}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
