import { ExternalLink, History, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Definition } from "../../types/definition.types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";
import { LikeButton } from "./LikeButton";

interface DefinitionCardProps {
	definition: Definition;
	onDelete: (id: string) => void;
	onViewHistory: (userId: string) => void;
	showWord?: boolean;
}

export function DefinitionCard({
	definition,
	onDelete,
	onViewHistory,
	showWord = false,
}: DefinitionCardProps) {
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
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader>
				{showWord && definition.term && (
					<div className="mb-2">
						<Button
							variant="link"
							className="p-0 h-auto font-semibold text-lg"
							onClick={() => navigate(`/words/${definition.wordId}/edit`)}
						>
							{definition.term}
						</Button>
					</div>
				)}
				<div className="flex items-start justify-between gap-2">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Avatar className="h-6 w-6 cursor-pointer border" onClick={handleUserClick}>
							<AvatarImage src={definition.profilePicture} className="object-cover" />
							<AvatarFallback>{definition.nickname?.[0].toUpperCase() || "U"}</AvatarFallback>
						</Avatar>
						<Button
							variant="link"
							className="p-0 h-auto text-sm text-muted-foreground"
							onClick={handleUserClick}
						>
							{definition.nickname || t("common.user")}
						</Button>
						<span>•</span>
						<span>{formattedDate}</span>
						{isEdited && <span className="text-xs text-muted-foreground">(edited)</span>}
					</div>

					<div className="flex gap-1">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onViewHistory(definition.userId)}
							title={t("word.history")}
						>
							<History className="h-4 w-4" />
						</Button>
						{isOwner && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onDelete(definition.id)}
								title={t("common.delete")}
							>
								<Trash2 className="h-4 w-4 text-destructive" />
							</Button>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-base whitespace-pre-wrap">{definition.content}</p>

				{definition.mediaUrls && definition.mediaUrls.length > 0 && (
					<div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
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
					<div className="flex flex-wrap gap-2">
						{definition.tags.map((tag) => (
							<Badge key={tag} variant="secondary" className="text-xs">
								#{tag}
							</Badge>
						))}
					</div>
				)}
			</CardContent>
			<Separator />
			<CardFooter className="pt-4">
				<LikeButton
					definitionId={definition.id}
					initialLikesCount={definition.likesCount}
					isOwnDefinition={isOwner}
				/>
			</CardFooter>
		</Card>
	);
}
