import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { ProfileEditCard } from "@/components/dashboard/ProfileEditCard";
import { FeedList } from "@/components/feed/FeedList";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useDefinitions } from "@/hooks/useDefinitions";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { definitionsApi } from "@/lib/definitions";
import { feedApi } from "@/lib/feed";
import { followsApi } from "@/lib/follows";
import { usersApi } from "@/lib/users";
import { Page } from "../components/layout/Page";
import type { FollowStats, UserProfile } from "../types/follow.types";
import type { User } from "../types/user.types";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { nickname } = useParams<{ nickname: string }>();
  const { user: currentUser, refetchUser } = useAuth();
  const { deleteDefinition, updateDefinition } = useDefinitions();

  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [stats, setStats] = useState<FollowStats | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const isMe = !nickname || (currentUser && currentUser.nickname === nickname);

  const fetchProfileData = useCallback(async () => {
    setLoadingProfile(true);
    try {
      let data: UserProfile | undefined;
      if (nickname) {
        data = await usersApi.getUserProfileByNickname(nickname);
      } else if (currentUser) {
        data = await usersApi.getUserProfile(currentUser.id);
      }

      if (data) {
        if (isMe && currentUser) {
          setProfileUser({ ...currentUser, ...data.user } as User);
        } else {
          setProfileUser(data.user as User);
        }
        setStats(data.stats);

        if (nickname && currentUser && data.user.id !== currentUser.id) {
          const followResult = await followsApi.checkFollowing(data.user.id);
          setIsFollowing(followResult.isFollowing);
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoadingProfile(false);
    }
  }, [nickname, currentUser, isMe]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const {
    data: feedData,
    fetchNextPage,
    hasNextPage,
    isLoading: feedLoading,
    refetch: refetchFeed,
  } = useInfiniteQuery({
    queryKey: ["feed", isMe ? "me" : profileUser?.id],
    queryFn: ({ pageParam }) => {
      const param = pageParam as { page: number; cursor?: string };
      if (isMe) {
        return feedApi.getMyFeed(param.page, 20, param.cursor);
      }
      if (profileUser?.id) {
        return definitionsApi.getByUserId(profileUser.id, param.page, 20, param.cursor);
      }
      return Promise.resolve({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
    },
    initialPageParam: { page: 1, cursor: undefined as string | undefined },
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.nextCursor) return undefined;
      return {
        page: lastPage.meta.page + 1,
        cursor: lastPage.meta.nextCursor,
      };
    },
    enabled: isMe || !!profileUser?.id,
  });

  const definitions = feedData?.pages.flatMap((page) => page.data) ?? [];

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore: !!hasNextPage,
    isLoading: feedLoading || false,
  });

  const handleDelete = async (definitionId: string) => {
    if (confirm(t("dashboard.delete_confirm"))) {
      await deleteDefinition(definitionId);
      refetchFeed();
      fetchProfileData();
    }
  };

  const handleEdit = async (
    id: string,
    data: { content: string; tags: string[]; isPublic: boolean },
  ) => {
    await updateDefinition(id, {
      content: data.content,
      tags: data.tags,
      isPublic: data.isPublic,
    });
    refetchFeed();
  };

  const handleSaveProfile = async () => {
    await refetchUser();
    setIsEditing(false);
    fetchProfileData();
  };

  const handleFollow = async () => {
    if (!profileUser) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followsApi.unfollow(profileUser.id);
        setIsFollowing(false);
      } else {
        await followsApi.follow(profileUser.id);
        setIsFollowing(true);
      }
      fetchProfileData();
    } catch (error) {
      console.error("Follow action failed", error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loadingProfile && !profileUser) {
    return (
      <Page>
        <div className="flex items-center justify-center min-h-100">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="mb-8">
        {isEditing && currentUser ? (
          <ProfileEditCard
            user={currentUser}
            onCancel={() => setIsEditing(false)}
            onSave={handleSaveProfile}
          />
        ) : profileUser ? (
          <ProfileCard
            user={profileUser}
            stats={stats}
            onEdit={isMe ? () => setIsEditing(true) : undefined}
            actionButton={
              !isMe && currentUser ? (
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  onClick={handleFollow}
                  disabled={followLoading}
                  className="rounded-full"
                >
                  {isFollowing ? t("profile.unfollow") : t("user.follow")}
                </Button>
              ) : null
            }
          />
        ) : null}
      </div>

      <div className="shadow-[0_0_10px_1px_rgba(0,0,0,0.1)] pt-1">
        {feedLoading && definitions.length === 0 ? (
          <div className="rounded-lg border bg-muted/50 p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        ) : (
          <>
            <FeedList
              definitions={definitions}
              onDelete={handleDelete}
              onEdit={isMe ? handleEdit : undefined}
              className="m-5"
            />
            <div ref={sentinelRef} className="py-4 flex justify-center">
              {feedLoading && hasNextPage ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                definitions.length > 0 && (
                  <p className="text-sm text-muted-foreground italic">{t("common.end_of_list")}</p>
                )
              )}
            </div>
          </>
        )}
      </div>
    </Page>
  );
}
