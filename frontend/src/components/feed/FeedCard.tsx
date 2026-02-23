import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Definition } from "@stashy/shared";
import { ExternalLink, Flag, MoreVertical, Pencil, Trash2, X } from "lucide-react";
import React, { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { definitionsApi } from "@/lib/api/definitions";
import { type CreateFeedInput, feedApi } from "@/lib/api/feed";
import { stringToColor } from "@/lib/utils/color-generator";
import { i18nToIsoLocale } from "@/lib/utils/date";
import { createQuoteBlock } from "@/lib/utils/quote-block";
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
import { QUOTE_TOGGLE_EVENT, type QuoteToggleEventDetail } from "../ui/codemirror/quote-extension";
import { FeedCardContent as RichTextContent } from "./FeedCardContent";
import { FeedForm } from "./FeedForm";
import type { EditorView } from "@codemirror/view";
import type { SelectionRange } from "@codemirror/state";
import { useMyFeed } from "@/hooks/useMyFeed";

type FeedCardProps = {
  definition: Definition;
  onDelete?: (id: string) => void;
  onStartEdit?: () => void;
  option: { showUser: boolean };
  index?: number;
};

type QuoteSelection = {
  text: string;
  startOffset: number;
  endOffset: number;
  x: number;
  y: number;
};

type LinkedSourceItem = {
  key: string;
  source: Definition;
};

function TermColumn({ definition }: {definition: Definition}) {
  if (!definition.term) {
    return null;
  }

  return (
    <div className="flex flex-col pr-6 h-full md:w-60 w-full">
      {definition.termNumber && (
        <span className="text-[10px] font-black text-primary mb-3 tracking-widest uppercase opacity-40 group-hover:opacity-100 transition-opacity">
          No. {definition.termNumber.toString().padStart(2, "0")}
        </span>
      )}
      <a href={`/word/${encodeURIComponent(definition.term)}`}>
      <h2
        className="editorial-number font-bold md:text-3xl text-2xl text-foreground transition-all cursor-pointer break-all"
        style={{ fontFamily: '"Gowun Batang", serif' }}
      >
        {definition.term}
      </h2>
      </a>
    </div>
  );
}

type ContentSectionProps = {
  definition: Definition;
};

function ContentSection({ definition }: ContentSectionProps) {
  const { t } = useTranslation();
  const contentRef: RefObject<HTMLDivElement | null> = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  // 더보기 표시
  // biome-ignore lint/correctness/useExhaustiveDependencies: content가 있을때 계산되어야 한다
  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const observer = new ResizeObserver(() => {
      setIsTruncated(element.scrollHeight > element.clientHeight);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [definition.content]);

  return (
    <div>
      <div className="relative">
        <div
          ref={contentRef}
          className="text-2xl text-foreground leading-snug font-light max-w-2xl font-sans tracking-tight max-h-75"
          style={
            isTruncated
              ? { maskImage: "linear-gradient(to bottom, #000 60%, transparent 100%)" }
              : {}
          }
        >
            <EditorWrapper definition={definition} />
        </div>
      </div>
      {isTruncated && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="relative w-full font-semibold mt-2 -top-12 text-xs text-gray-700 hover:text-foreground">
              [ {t("common.more")} ]...
            </Button>
          </DialogTrigger>
          <DialogContent className="feed max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-bold mb-4">
                {definition.term}
              </DialogTitle>
            </DialogHeader>
            <EditorWrapper definition={definition} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function EditorWrapper({definition}: { definition: Definition}) {
  const [quoteSelection, setQuoteSelection] = useState<QuoteSelection | null>(() => {
    return null;
  });
  const { user } = useAuth();
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const { t } = useTranslation();
  
  const handleContentSelection = useCallback((range: SelectionRange, view: EditorView) => {
    if (!user) {
      return;
    }
    if (range.empty) {
      setQuoteSelection(() => null);
      return;
    }
    const from = range.from;
    const to = range.to;
    let doc = view.state.sliceDoc(from, to);
    const match = view.state.doc.lineAt(from).text.match(/^(> )+/);
    if (match) {
      doc = match[0] + doc;
    }

    if (!doc) {
      setQuoteSelection(() => null);
      return;
    }

    const pos = range.to; // 커서 끝 지점
    const coords = view.coordsAtPos(pos);
    const standard = view.dom.closest(".feed")?.getBoundingClientRect();
    const editorRect = view.dom.getBoundingClientRect();
    if (coords && standard && editorRect) {
      const absoluteX = editorRect.left - standard.left;
      const absoluteY = coords.bottom - standard.top;
      setQuoteSelection(() => ({
        text: doc,
        startOffset: from,
        endOffset: to,
        x: absoluteX,
        y: absoluteY + 6,
      }));
    } else {
    }
  }, [user]);
  const { createFeed } = useMyFeed();
  const createFeedMutation = async (input: CreateFeedInput) => {
    await createFeed(input);
    setIsQuoteDialogOpen(false);
    setQuoteSelection(null);
  };
  const quoteBlockContent = useMemo(() => {
    if (!quoteSelection) {
      return "";
    }

    const sourceUrl = `${window.location.origin}/definitions/${definition.id}`;
    return `${createQuoteBlock(
      {
        definitionId: definition.id,
        term: definition.term,
        sourceUrl,
        startOffset: quoteSelection.startOffset,
        endOffset: quoteSelection.endOffset,
      },
      quoteSelection.text,
    )}\n\n`;
  }, [definition.id, definition.term, quoteSelection]);

  return (
    <div className="feed relative">
      <RichTextContent content={definition.content} onSelectionChange={handleContentSelection} />
      {quoteSelection && (
        <div
          className="quote-action-menu absolute z-50"
          style={{ left: quoteSelection.x, top: quoteSelection.y }}
        >
          <Button
            type="button"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setIsQuoteDialogOpen(true)}
          >
            {t("feed.quotation.add")}
          </Button>
        </div>
      )}

      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <FeedForm
            fixedTerm={definition.term}
            initialContent={quoteBlockContent}
            onCreate={async (data) => {
              await createFeedMutation(data);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

type MediaSectionProps = {
  mediaUrls?: Definition["mediaUrls"];
};

function MediaSection({ mediaUrls }: MediaSectionProps) {
  if (!mediaUrls || mediaUrls.length === 0) {
    return null;
  }

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="mb-10 grid gap-2 grid-cols-1 sm:grid-cols-2 max-w-2xl">
      {mediaUrls.map((media) => {
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
  );
}

type TagsSectionProps = {
  tags: string[];
  onTagClick: (tag: string) => void;
};

function TagsSection({ tags, onTagClick }: TagsSectionProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="mb-1 flex text-gray-400 flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
          onClick={() => onTagClick(tag)}
        >
          #{tag}
        </Badge>
      ))}
    </div>
  );
}

type FooterSectionProps = {
  definition: Definition;
  formattedDate: string;
  isOwner: boolean;
  showUser: boolean;
  needMoreMenu: boolean;
  onStartEdit?: () => void;
  onDelete?: (id: string) => void;
  onUserClick: (event: React.MouseEvent) => void;
};

function FooterSection({
  definition,
  formattedDate,
  isOwner,
  showUser,
  needMoreMenu,
  onStartEdit,
  onDelete,
  onUserClick,
}: FooterSectionProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-6">
        {showUser && (
          <a
            href={isOwner ? "/profile" : `/profile/${definition.nickname}`}
            onClick={(e) => {
              e.preventDefault();
              onUserClick(e);
            }}
            className="cursor-pointer flex items-center gap-3"
          >
            <Avatar
              className={`h-6 w-6 transition-all border border-gray-300 bg-[${stringToColor(definition.id)}]`}
            >
              <AvatarImage src={definition.profilePicture} className="object-cover" />
              <AvatarFallback>{definition.nickname?.[0].toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <span className="text-[10px] tracking-widest text-foreground">
              @{definition.nickname || t("common.user")}
            </span>
          </a>
        )}
        <span className="text-[9px] text-zinc-400 uppercase tracking-widest">
          <a href={`/definitions/${definition.id}`}>{formattedDate}</a>
        </span>
      </div>

      <div className="flex items-center gap-2 text-zinc-300">
        <LikeButton
          definitionId={definition.id}
          initialLikesCount={definition.likesCount}
          initialIsLiked={definition.isLiked}
        />
        {needMoreMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="hover:text-foreground transition-colors h-8 w-8">
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
                  onClick={() => onDelete(definition.id)}
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
  );
}

type LinkedSourceListProps = {
  items: LinkedSourceItem[];
  onClose: (key: string) => void;
};

function LinkedSourceList({ items, onClose }: LinkedSourceListProps) {
  const { t } = useTranslation();
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3 px-4 pb-4">
      {items.map((item) => (
        <div key={item.key} className="rounded-md border bg-gray-50 p-4 md:ml-66 relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 text-gray-500 hover:text-gray-700"
            onClick={() => onClose(item.key)}
          >
            <X className="h-4 w-4" />
          </Button>
          <a href={`/definitions/${item.source.id}`} className="text-xs text-gray-500 underline">
            {t("feed.quotation.goto_source")}
          </a>
          <div className="mt-2 text-base leading-relaxed text-gray-700">
            <RichTextContent content={item.source.content} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FeedCard({
  definition,
  onDelete,
  onStartEdit,
  option = { showUser: true },
}: FeedCardProps) {
  const {i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.id === definition.userId;
  const needMoreMenu = onDelete || onStartEdit || !isOwner;
  const [linkedSources, setLinkedSources] = useState<LinkedSourceItem[]>([]);

  const formattedDate = new Date(definition.createdAt).toLocaleDateString(
    i18nToIsoLocale[i18n.language],
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  useEffect(() => {
    const handleQuoteToggle = async (event: Event) => {
      const quoteEvent = event as CustomEvent<QuoteToggleEventDetail>;
      const detail = quoteEvent.detail;
      if (!detail || detail.hostDefinitionId !== definition.id) {
        return;
      }

      try {
        const source = await definitionsApi.getById(detail.sourceDefinitionId);
        setLinkedSources((prev) => {
          if (prev.some((item) => item.source.id === source.id)) {
            return prev;
          }
          return [
            ...prev,
            { key: `${source.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`, source },
          ];
        });
      } catch (error) {
        console.error("Failed to load quoted source", error);
      }
    };

    document.addEventListener(QUOTE_TOGGLE_EVENT, handleQuoteToggle as EventListener);
    return () => {
      document.removeEventListener(QUOTE_TOGGLE_EVENT, handleQuoteToggle as EventListener);
    };
  }, [definition.id]);

  const handleUserClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (user?.nickname === definition.nickname) {
      navigate("/profile");
      return;
    }
    navigate(`/profile/${definition.nickname}`);
  };

  const handleTagClick = (tag: string) => {
    navigate(`/tag/${encodeURIComponent(tag)}`);
  };

  const handleCloseLinkedSource = (key: string) => {
    setLinkedSources((prev) => prev.filter((item) => item.key !== key));
  };

  return (
    <div data-definition-id={definition.id}>
      <article className="feed group border-t border-gray-200 flex items-start md:flex-row flex-col transition-colors px-4 pt-2 pb-7 relative hover:bg-[#f0f3ec]">
        <TermColumn definition={definition} />

        <div className="w-full min-w-0 pb-3 pt-6">
          <ContentSection definition={definition} />
          {/* <MediaSection mediaUrls={definition.mediaUrls} /> */}
          <TagsSection tags={definition.tags || []} onTagClick={handleTagClick} />
          <FooterSection
            definition={definition}
            formattedDate={formattedDate}
            isOwner={isOwner}
            showUser={option.showUser}
            needMoreMenu={!!needMoreMenu}
            onStartEdit={onStartEdit}
            onDelete={onDelete}
            onUserClick={handleUserClick}
          />
        </div>
      </article>

      <LinkedSourceList items={linkedSources} onClose={handleCloseLinkedSource} />
    </div>
  );
}
