import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "../components/layout/Page";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";
import { usersApi } from "../lib/users";

export default function SettingsPage() {
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
				title: "성공",
				description: "닉네임이 성공적으로 변경되었습니다",
			});
		} catch (err: any) {
			toast({
				title: "오류",
				description:
					err.statusCode === 409
						? "이미 사용 중인 닉네임입니다"
						: err.message || "닉네임 변경에 실패했습니다",
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
			<Button
				variant="ghost"
				onClick={() => navigate("/dashboard")}
				className="mb-4"
			>
				<ArrowLeft className="mr-2 h-4 w-4" />
				대시보드로 돌아가기
			</Button>

				<div className="mb-8">
					<h1 className="text-3xl font-bold">설정</h1>
					<p className="text-muted-foreground mt-2">프로필 정보를 관리하세요</p>
				</div>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>프로필 정보</CardTitle>
							<CardDescription>
								기본 프로필 정보를 확인할 수 있습니다
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label>이메일</Label>
								<Input value={user?.email || ""} disabled />
								<p className="text-sm text-muted-foreground">
									Google 계정 이메일은 변경할 수 없습니다
								</p>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>닉네임 변경</CardTitle>
							<CardDescription>
								다른 사용자에게 표시될 닉네임을 변경할 수 있습니다
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="nickname">닉네임</Label>
									<Input
										id="nickname"
										value={nickname}
										onChange={(e) => setNickname(e.target.value)}
										placeholder="닉네임을 입력하세요"
										maxLength={20}
										disabled={isSubmitting}
									/>
									<p className="text-sm text-muted-foreground">
										2-20자의 영문, 한글, 숫자, 언더스코어(_)만 사용 가능합니다
									</p>
								</div>

								<div className="flex gap-2">
									<Button
										type="submit"
										disabled={isSubmitting || !isValid || !hasChanged}
									>
										{isSubmitting ? "변경 중..." : "변경"}
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={handleCancel}
										disabled={isSubmitting || !hasChanged}
									>
										취소
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>

					<Separator />

				<Card>
					<CardHeader>
						<CardTitle>계정 정보</CardTitle>
						<CardDescription>Google 계정으로 로그인했습니다</CardDescription>
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
