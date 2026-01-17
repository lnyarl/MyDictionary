import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Page } from "../components/layout/Page";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";
import { usersApi } from "../lib/users";

export default function SettingsPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { user, refetchUser } = useAuth();
	const { toast } = useToast();
	const [nickname, setNickname] = useState(user?.nickname || "");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!nickname.trim() || nickname === user?.nickname) return;

		setIsSubmitting(true);

		try {
			await usersApi.updateNickname(nickname.trim());
			await refetchUser();
			toast({
				title: t("common.success"),
				description: t("settings.nickname_success"),
			});
		} catch (err: any) {
			toast({
				title: t("common.error"),
				description:
					err.statusCode === 409
						? t("settings.nickname_already_taken")
						: err.message || t("settings.nickname_failed"),
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		setNickname(user?.nickname || "");
	};

	const isValid = nickname.trim().length >= 2 && nickname.trim().length <= 20;
	const hasChanged = nickname !== user?.nickname;

	return (
		<Page maxWidth="2xl">
			<Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
				<ArrowLeft className="mr-2 h-4 w-4" />
				{t("common.back_to_dashboard")}
			</Button>

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
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label>{t("settings.email")}</Label>
							<Input value={user?.email || ""} disabled />
							<p className="text-sm text-muted-foreground">{t("settings.email_desc")}</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>{t("settings.change_nickname")}</CardTitle>
						<CardDescription>{t("settings.nickname_desc")}</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
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

							<div className="flex gap-2">
								<Button type="submit" disabled={isSubmitting || !isValid || !hasChanged}>
									{isSubmitting ? t("settings.changing") : t("settings.change")}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={handleCancel}
									disabled={isSubmitting || !hasChanged}
								>
									{t("common.cancel")}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>

				<Separator />

				<Card>
					<CardHeader>
						<CardTitle>{t("settings.account_info")}</CardTitle>
						<CardDescription>{t("settings.google_account")}</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-4">
							{user?.profilePicture && (
								<img
									src={user.profilePicture}
									alt={user.nickname}
									className="w-16 h-16 rounded-full"
								/>
							)}
							<div>
								<p className="font-semibold">{user?.nickname}</p>
								<p className="text-sm text-muted-foreground">{user?.email}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</Page>
	);
}
