import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFollowers } from "@/hooks/useFollowers";
import { useFollowing } from "@/hooks/useFollowing";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

type FollowListDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: "followers" | "following";
};

export function FollowListDialog({ isOpen, onClose, userId, type }: FollowListDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isFollowers = type === "followers";
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = isFollowers
    ? useFollowers(userId)
    : useFollowing(userId);

  const users = data?.pages.flatMap((page) => page.data) ?? [];

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore: !!hasNextPage,
    isLoading: isFetchingNextPage,
  });

  const handleUserClick = (targetUserId: string) => {
    navigate(`/users/${targetUserId}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isFollowers ? t("dashboard.followers") : t("dashboard.following")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {isLoading && users.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {isFollowers ? "아직 팔로워가 없습니다." : "아직 팔로우하는 사용자가 없습니다."}
            </div>
          ) : (
            <div className="space-y-4 pt-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => handleUserClick(user.id)}
                >
                  <Avatar className="h-10 w-10 border shadow-sm">
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback>{user.nickname[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{user.nickname}</h4>
                  </div>
                </div>
              ))}

              <div ref={sentinelRef} className="py-2 flex justify-center h-8">
                {isFetchingNextPage && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
