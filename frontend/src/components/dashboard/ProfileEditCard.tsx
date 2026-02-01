import { Loader2, Save, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usersApi } from "@/lib/users";
import type { User } from "@/types/user.types";
import { stringToColor } from "@/utils/color-generator";

interface ProfileEditCardProps {
  user: User;
  onCancel: () => void;
  onSave: () => Promise<void>;
}

export function ProfileEditCard({ user, onCancel, onSave }: ProfileEditCardProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [nickname, setNickname] = useState(user.nickname);
  const [bio, setBio] = useState(user.bio || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!nickname.trim()) {
      toast({
        title: t("common.error"),
        description: t("validation.nickname_required"),
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      await usersApi.updateProfile({ nickname, bio });
      await onSave();
      toast({
        title: t("common.success"),
        description: t("profile.update_success"),
      });
    } catch (error) {
      console.error("Failed to update profile", error);
      toast({
        title: t("common.error"),
        description: t("profile.update_failed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const bioColor = stringToColor(user.email || "");

  return (
    <Card className="overflow-hidden border-none shadow-md bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
      <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group">
          <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white dark:border-zinc-800 shadow-lg">
            <AvatarImage src={user.profilePicture} className="object-cover" />
            <AvatarFallback className="text-4xl font-bold bg-linear-to-br from-indigo-500 to-purple-500 text-white">
              {user.nickname?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 w-full space-y-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex-1 w-full space-y-2">
              <div className="space-y-2">
                <Label htmlFor="nickname" className="sr-only">
                  {t("profile.nickname")}
                </Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  disabled={isLoading}
                  className="h-12 md:text-3xl sm:text-3xl font-bold tracking-tight text-foreground border-none shadow-none"
                  placeholder={t("profile.nickname")}
                />
              </div>
              <p className="text-sm text-muted-foreground px-1">{user.email}</p>
            </div>

            <div className="flex gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
              <Button
                variant="ghost"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                <X className="w-4 h-4 mr-2" />
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={isLoading} className="flex-1 sm:flex-none">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {t("common.save")}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="sr-only">
              {t("profile.bio")}
            </Label>

            <div
              className="relative p-4 rounded-2xl text-sm leading-relaxed text-zinc-800 dark:text-zinc-900 font-medium shadow-sm"
              style={{ backgroundColor: bioColor }}
            >
              <div
                className="absolute -top-2 left-1/2 sm:left-8 -translate-x-1/2 sm:translate-x-0 w-4 h-4 rotate-45"
                style={{ backgroundColor: bioColor }}
              />
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="resize-none text-sm leading-relaxed border-none shadow-none"
                placeholder={t("profile.bio")}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
