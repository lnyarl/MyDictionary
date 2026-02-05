import { Pencil } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { FollowStats } from "@/lib/api/follows";
import type { User } from "@/lib/api/users";
import { stringToColor } from "@/lib/utils/color-generator";
import { FollowListDialog } from "./FollowListDialog";

type ProfileCardProps = {
  user: User;
  stats: FollowStats | null;
  onEdit?: () => void;
  actionButton?: React.ReactNode;
};

export function ProfileCard({ user, stats, onEdit, actionButton }: ProfileCardProps) {
  const { t } = useTranslation();
  const bioColor = stringToColor(user.email || "");
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: "followers" | "following";
  }>({
    isOpen: false,
    type: "followers",
  });

  const openDialog = (type: "followers" | "following") => {
    setDialogState({ isOpen: true, type });
  };

  return (
    <Card className="overflow-hidden border-none shadow-none ">
      <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group">
          <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white dark:border-zinc-800 shadow-lg">
            <AvatarImage src={user.profilePicture} className="object-cover" />
            <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
              {user.nickname?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-4 w-full">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 ">
            <div>
              <h2
                className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
                style={{ backgroundColor: bioColor }}
              >
                {user.nickname}
              </h2>
              {/* <p className="text-sm text-muted-foreground font-medium mt-1">{user.email}</p> */}
            </div>
            {actionButton ? (
              actionButton
            ) : onEdit ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="shrink-0 gap-2 rounded-full hover:bg-secondary transition-colors"
              >
                <Pencil className="w-4 h-4" />
                {t("common.edit")}
              </Button>
            ) : null}
          </div>

          {user.bio && (
            <div className="relative p-4 text-sm leading-relaxed text-zinc-800 dark:text-zinc-900 font-medium shadow-sm bg-[#9f9b8623]">
              {user.bio}
            </div>
          )}

          {stats && (
            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => openDialog("followers")}
                className="hover:underline hover:text-foreground transition-colors cursor-pointer"
              >
                {t("dashboard.followers")}{" "}
                <span className="font-semibold text-foreground">{stats.followersCount}</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openDialog("following")}
                className="hover:underline hover:text-foreground transition-colors cursor-pointer"
              >
                {t("dashboard.following")}{" "}
                <span className="font-semibold text-foreground">{stats.followingCount}</span>
              </button>
            </div>
          )}
        </div>
      </CardContent>

      <FollowListDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        userId={user.id}
        type={dialogState.type}
      />
    </Card>
  );
}
