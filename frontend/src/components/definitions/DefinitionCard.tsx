import { History, Trash2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import type { Definition } from "../../types/definition.types";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";
import { LikeButton } from "./LikeButton";

interface DefinitionCardProps {
	definition: Definition;
	onDelete: (id: string) => void;
	onViewHistory: (userId: string) => void;
}

export function DefinitionCard({
	definition,
	onDelete,
	onViewHistory,
}: DefinitionCardProps) {
	const { user } = useAuth();
	const isOwner = user?.id === definition.userId;

	const formattedDate = new Date(definition.createdAt).toLocaleDateString(
		"ko-KR",
		{
			year: "numeric",
			month: "long",
			day: "numeric",
		},
	);

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader>
				<div className="flex items-start justify-between gap-2">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<span>{definition.user?.nickname || "사용자"}</span>
						<span>•</span>
						<span>{formattedDate}</span>
					</div>

					<div className="flex gap-1">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onViewHistory(definition.userId)}
							title="히스토리 보기"
						>
							<History className="h-4 w-4" />
						</Button>
						{isOwner && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onDelete(definition.id)}
								title="삭제"
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
