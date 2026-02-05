import { Heart } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "../ui/button";
import { useLike } from "./hooks";

type LikeButtonProps = {
  definitionId: string;
  initialLikesCount: number;
  initialIsLiked?: boolean;
};

export function LikeButton({
  definitionId,
  initialLikesCount,
  initialIsLiked = false,
}: LikeButtonProps) {
  const { isAuthenticated } = useAuth();

  console.log(definitionId, initialIsLiked, initialLikesCount)
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  const { toggleLike } = useLike({ definitionId });

  const handleToggle = async () => {
    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);
    await toggleLike();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{likesCount}</span>
      </div>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleToggle} className="gap-2">
      <Heart
        className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
      />
      <span className="text-sm">{likesCount}</span>
    </Button>
  );
}
