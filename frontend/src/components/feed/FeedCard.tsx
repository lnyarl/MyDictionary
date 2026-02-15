import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Definition } from "@stashy/shared";
import { ExternalLink, Flag, MoreVertical, Pencil, Trash2, X } from "lucide-react";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { definitionsApi } from "@/lib/api/definitions";
import { feedApi } from "@/lib/api/feed";
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
import {
	QUOTE_TOGGLE_EVENT,
	type QuoteToggleEventDetail,
} from "../ui/codemirror/quote-extension";
import { FeedCardContent as RichTextContent } from "./FeedCardContent";
import { FeedForm } from "./FeedForm";

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

type TermColumnProps = {
	definition: Definition;
	onTermClick: () => void;
};

function TermColumn({ definition, onTermClick }: TermColumnProps) {
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
			<h2
				onClick={onTermClick}
				className="editorial-number font-bold md:text-3xl text-2xl text-foreground transition-all cursor-pointer"
				style={{ fontFamily: '"Gowun Batang", serif' }}
			>
				{definition.term}
			</h2>
		</div>
	);
}

type ContentSectionProps = {
	content: string;
	term: string;
	contentRef: RefObject<HTMLDivElement | null>;
	isTruncated: boolean;
	onContentMouseUp: () => void;
};

function ContentSection({
	content,
	term,
	contentRef,
	isTruncated,
	onContentMouseUp,
}: ContentSectionProps) {
	const { t } = useTranslation();

	return (
		<div>
			<div className="relative" onMouseUp={onContentMouseUp}>
				<div
					ref={contentRef}
					className="text-2xl text-foreground leading-snug font-light max-w-2xl font-sans tracking-tight max-h-75 overflow-hidden"
					style={isTruncated ? { maskImage: "linear-gradient(to bottom, #000 60%, transparent 100%)" } : {}}
				>
					<RichTextContent content={content} />
				</div>
			</div>
			{isTruncated && (
				<Dialog>
					<DialogTrigger asChild>
						<Button variant="ghost" size="sm" className="mt-2 text-gray-700 hover:text-foreground">
							[ {t("common.more")} ]...
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle className="font-serif text-2xl font-bold mb-4">{term}</DialogTitle>
						</DialogHeader>
						<RichTextContent content={content} />
					</DialogContent>
				</Dialog>
			)}
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
					return <img key={media.url} src={media.url} alt="media" className="rounded-lg object-cover w-full h-48 border" />;
				}
				if (media.type === "video") {
					return (
						<video key={media.url} src={media.url} controls className="rounded-lg w-full h-48 object-cover border">
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
						{media.image && <img src={media.image} alt={media.title || "Link preview"} className="w-full h-32 object-cover" />}
						<div className="p-3">
							<h4 className="font-semibold text-sm truncate group-hover/media:text-primary">{media.title || media.url}</h4>
							{media.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{media.description}</p>}
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
						<Avatar className={`h-6 w-6 transition-all border border-gray-300 bg-[${stringToColor(definition.id)}]`}>
							<AvatarImage src={definition.profilePicture} className="object-cover" />
							<AvatarFallback>{definition.nickname?.[0].toUpperCase() || "U"}</AvatarFallback>
						</Avatar>
						<span className="text-[10px] tracking-widest text-foreground">@{definition.nickname || t("common.user")}</span>
					</a>
				)}
				<span className="text-[9px] text-zinc-400 uppercase tracking-widest">
					<a href={`/definitions/${definition.id}`}>{formattedDate}</a>
				</span>
			</div>

			<div className="flex items-center gap-2 text-zinc-300">
				<LikeButton definitionId={definition.id} initialLikesCount={definition.likesCount} initialIsLiked={definition.isLiked} />
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
								<DropdownMenuItem onClick={() => onDelete(definition.id)} className="text-destructive focus:text-destructive">
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
						원문 보기: {item.source.term}
					</a>
					<div className="mt-2 text-base leading-relaxed text-gray-700">
						<RichTextContent content={item.source.content} />
					</div>
				</div>
			))}
		</div>
	);
}

function getTextOffset(root: Node, targetNode: Node, nodeOffset: number): number {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	let currentOffset = 0;
	while (walker.nextNode()) {
		const node = walker.currentNode;
		if (node === targetNode) {
			return currentOffset + nodeOffset;
		}
		currentOffset += node.textContent?.length ?? 0;
	}
	return currentOffset;
}

export function FeedCard({ definition, onDelete, onStartEdit, option = { showUser: true } }: FeedCardProps) {
	const { i18n } = useTranslation();
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const isOwner = user?.id === definition.userId;
	const needMoreMenu = onDelete || onStartEdit || !isOwner;
	const contentRef = useRef<HTMLDivElement>(null);

	const [quoteSelection, setQuoteSelection] = useState<QuoteSelection | null>(null);
	const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
	const [linkedSources, setLinkedSources] = useState<LinkedSourceItem[]>([]);
	const [isTruncated, setIsTruncated] = useState(false);

	const formattedDate = new Date(definition.createdAt).toLocaleDateString(i18nToIsoLocale[i18n.language], {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const createFeedMutation = useMutation({
		mutationFn: feedApi.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["feed"] });
			setIsQuoteDialogOpen(false);
			setQuoteSelection(null);
		},
	});

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

	useEffect(() => {
		const element = contentRef.current;
		if (!element) return;

		const observer = new ResizeObserver(() => {
			setIsTruncated(element.scrollHeight > element.clientHeight);
		});

		observer.observe(element);
		return () => observer.disconnect();
	}, [definition.content]);

	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (!target.closest(".quote-action-menu")) {
				setQuoteSelection(null);
			}
		};

		document.addEventListener("mousedown", handleOutsideClick);
		return () => document.removeEventListener("mousedown", handleOutsideClick);
	}, []);

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

	const handleContentMouseUp = () => {
		if (!user) {
			return;
		}

		const root = contentRef.current;
		const selection = window.getSelection();
		if (!root || !selection || selection.rangeCount === 0 || selection.isCollapsed) {
			setQuoteSelection(null);
			return;
		}

		const range = selection.getRangeAt(0);
		if (!root.contains(range.commonAncestorContainer)) {
			setQuoteSelection(null);
			return;
		}

		const selectedText = selection.toString().trim();
		if (!selectedText) {
			setQuoteSelection(null);
			return;
		}

		const startOffset = getTextOffset(root, range.startContainer, range.startOffset);
		const endOffset = getTextOffset(root, range.endContainer, range.endOffset);
		const rect = range.getBoundingClientRect();

		setQuoteSelection({
			text: selectedText,
			startOffset,
			endOffset,
			x: rect.left + rect.width / 2,
			y: rect.bottom + 8,
		});
	};

	const handleTermClick = () => {
		navigate(`/word/${encodeURIComponent(definition.term)}`);
	};

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
			<article className="group border-t border-gray-200 flex items-start md:flex-row flex-col transition-colors px-4 pt-2 pb-7 relative hover:bg-[#f0f3ec]">
				<TermColumn definition={definition} onTermClick={handleTermClick} />

				<div className="w-full min-w-0 pb-3 pt-6">
					<ContentSection
						content={definition.content}
						term={definition.term}
						contentRef={contentRef}
						isTruncated={isTruncated}
						onContentMouseUp={handleContentMouseUp}
					/>
					<MediaSection mediaUrls={definition.mediaUrls} />
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

				{quoteSelection && (
					<div className="quote-action-menu fixed z-50" style={{ left: quoteSelection.x, top: quoteSelection.y }}>
						<Button type="button" size="sm" className="h-8 text-xs" onClick={() => setIsQuoteDialogOpen(true)}>
							인용하기
						</Button>
					</div>
				)}

				<Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
					<DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>인용 글쓰기</DialogTitle>
						</DialogHeader>
						<FeedForm
							fixedTerm={definition.term}
							initialContent={quoteBlockContent}
							onCreate={async (data) => {
								await createFeedMutation.mutateAsync(data);
							}}
						/>
					</DialogContent>
				</Dialog>
			</article>

			<LinkedSourceList items={linkedSources} onClose={handleCloseLinkedSource} />
		</div>
	);
}
