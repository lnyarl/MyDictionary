import { LogOut, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSwitcherSettings } from "../components/layout/LanguageSwitcherSettings";
import { Page } from "../components/layout/Page";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";
import { usersApi } from "../lib/api/users";
import { processProfileImage } from "../lib/utils/image";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { user, refetchUser, logout } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState(user?.nickname || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profilePicture || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const processedFile = await processProfileImage(file, 256);

      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setProfileImage(processedFile);
      setPreviewUrl(URL.createObjectURL(processedFile));
    } catch (error) {
      console.error("Failed to process image:", error);
      toast({
        title: t("common.error"),
        description: t("settings.image_processing_failed"),
        variant: "destructive",
      });
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    setIsSubmitting(true);

    try {
      await usersApi.updateProfile({
        nickname: nickname.trim(),
        bio: bio.trim(),
        profilePicture: profileImage || undefined,
      });
      await refetchUser();
      toast({
        title: t("common.success"),
        description: t("settings.profile_updated"),
      });
    } catch (err: any) {
      toast({
        title: t("common.error"),
        description:
          err.statusCode === 409
            ? t("settings.nickname_already_taken")
            : err.message || t("settings.update_failed"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setNickname(user?.nickname || "");
    setBio(user?.bio || "");
    setProfileImage(null);
    setPreviewUrl(user?.profilePicture || null);
  };

  const isValid = nickname.trim().length >= 2 && nickname.trim().length <= 20;
  const hasChanged =
    nickname !== user?.nickname || bio !== (user?.bio || "") || profileImage !== null;

  return (
    <Page maxWidth="2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("settings.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("settings.subtitle")}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.profile_info")}</CardTitle>
            <CardDescription>{t("settings.profile_info_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center sm:flex-row gap-6">
                <div className="relative group">
                  <Avatar className="w-24 h-24 border-2 border-muted">
                    <AvatarImage src={previewUrl || undefined} className="object-cover" />
                    <AvatarFallback className="text-2xl">
                      {nickname.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-6 h-6 text-white" />
                  </button>
                </div>
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row gap-2 justify-center sm:justify-start">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {t("settings.upload_image")}
                    </Button>
                    {previewUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={handleRemoveImage}
                      >
                        {t("settings.remove_image")}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{t("settings.image_help")}</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="nickname">{t("settings.nickname")}</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={t("settings.nickname_placeholder")}
                  maxLength={20}
                  disabled={isSubmitting}
                />
                <p className="text-sm text-muted-foreground">{t("settings.nickname_hint")}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">{t("settings.bio")}</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t("settings.bio_placeholder")}
                  maxLength={150}
                  disabled={isSubmitting}
                  className="resize-none"
                  rows={3}
                />
                <p className="text-xs text-right text-muted-foreground">{bio.length}/150</p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting || !hasChanged}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting || !isValid || !hasChanged}>
                  {isSubmitting ? t("common.saving") : t("common.save")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.account_info")}</CardTitle>
            <CardDescription>{t("settings.google_account")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>{t("settings.email")}</Label>
              <Input value={user?.email || ""} disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.language")}</CardTitle>
            <CardDescription>{t("settings.language_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <LanguageSwitcherSettings />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.logout")}</CardTitle>
            <CardDescription>{t("settings.logout_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={logout} className="w-full sm:w-auto">
              <LogOut className="mr-2 h-4 w-4" />
              {t("settings.logout")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
