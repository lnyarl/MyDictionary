import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { followsApi } from "../lib/api/follows";
import { useToast } from "./use-toast";

export function useFollow(initialFollowing = false) {
  const { t } = useTranslation();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const toggleFollow = useCallback(
    async (userId: string) => {
      setLoading(true);
      try {
        if (isFollowing) {
          await followsApi.unfollow(userId);
          setIsFollowing(false);
          toast({ description: t("follow.unfollowed") });
        } else {
          await followsApi.follow(userId);
          setIsFollowing(true);
          toast({ description: t("follow.followed") });
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          description: error.message || t("follow.error"),
        });
      } finally {
        setLoading(false);
      }
    },
    [isFollowing, toast, t],
  );

  return { isFollowing, setIsFollowing, loading, toggleFollow };
}
