import { History, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { Definition } from "../../types/definition.types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
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

	const handleUserClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		navigate(`/users/${definition.userId}`);
	};

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader>
				{showWord && definition.word && (
					<div className="mb-2">
						<Button
							variant="link"
							className="p-0 h-auto font-semibold text-lg"
							onClick={() => navigate(`/words/${definition.word?.id}/edit`)}
						>
							{definition.word.term}
						</Button>
					</div>
				)}
				<div className="flex items-start justify-between gap-2">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Avatar className="h-6 w-6 cursor-pointer" onClick={handleUserClick}>
							<AvatarImage src={definition.user?.profilePicture} />
							<AvatarFallback>{definition.user?.nickname?.[0] || "U"}</AvatarFallback>
						</Avatar>
						<Button
							variant="link"
							className="p-0 h-auto text-sm text-muted-foreground"
							onClick={handleUserClick}
						>
							{definition.user?.nickname || t("common.user")}
						</Button>
						<span>•</span>
						<span>{formattedDate}</span>
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
			<CardContent>
				<p className="text-base whitespace-pre-wrap">{definition.content}</p>
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
