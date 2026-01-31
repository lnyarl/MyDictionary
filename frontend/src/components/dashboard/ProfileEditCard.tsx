import { Loader2, Save, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usersApi } from "@/lib/users";
import type { User } from "@/types/user.types";

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

  return (
    <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
      <CardHeader>
        <CardTitle>{t("profile.edit_profile")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nickname">{t("auth.nickname")}</Label>
          <Input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={t("auth.nickname_placeholder")}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">{t("profile.bio")}</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={t("profile.bio_placeholder")}
            className="min-h-[100px] resize-none"
            disabled={isLoading}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
          <X className="w-4 h-4 mr-2" />
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {t("common.save")}
        </Button>
      </CardFooter>
    </Card>
  );
}
