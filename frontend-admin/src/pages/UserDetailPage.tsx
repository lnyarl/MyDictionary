import type { BadgeEntity, UserBadgeEntity } from "@stashy/shared";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ui/table";
import { mainBackendApi } from "../lib/api";
import { badgesApi } from "../lib/badges";
import { usersApi } from "../lib/users";
import { type Word, wordsApi } from "../lib/words";
import type { User } from "../types/admin.types";

export default function UserDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [user, setUser] = useState<User | null>(null);
	const [words, setWords] = useState<Word[]>([]);
	const [userBadges, setUserBadges] = useState<
		(UserBadgeEntity & { badge_name: string; badge_code: string })[]
	>([]);
	const [availableBadges, setAvailableBadges] = useState<BadgeEntity[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedBadgeToGrant, setSelectedBadgeToGrant] = useState<string>("");
	const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			if (!id) return;
			try {
				setIsLoading(true);
				const [userData, wordsData, badgesData, allBadgesResponse] =
					await Promise.all([
						usersApi.getUser(id),
						wordsApi.getWordsByUserId(id),
						badgesApi.getUserBadges(id),
						badgesApi.findAll(1, 100), // Fetch first 100 badges for selection
					]);
				setUser(userData);
				setWords(wordsData);
				setUserBadges(badgesData);
				setAvailableBadges(allBadgesResponse.data);
			} catch (error) {
				console.error("Failed to fetch user data", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [id]);

	const handleCreateDummyWord = async () => {
		if (!id) return;
		try {
			await wordsApi.createDummyWord(id);
			const wordsData = await wordsApi.getWordsByUserId(id);
			setWords(wordsData);
		} catch (error) {
			console.error("Failed to create dummy word", error);
			alert("Failed to create dummy word");
		}
	};

	const handleMockLogin = async () => {
		if (!id) return;
		try {
			const { token } = await usersApi.impersonateUser(id);
			const session = await mainBackendApi.post<{
				token: string;
				refreshToken?: string;
			}>("/auth/session", { token });
			const mainAppUrl =
				import.meta.env.VITE_MAIN_APP_URL || "http://localhost:5173";
			const loginUrl = new URL(mainAppUrl);
			loginUrl.searchParams.set("mockAccessToken", session.token);
			if (session.refreshToken) {
				loginUrl.searchParams.set("mockRefreshToken", session.refreshToken);
			}
			window.open(loginUrl.toString(), "_blank");
		} catch (error) {
			console.error("Failed to mock login", error);
			alert("Failed to mock login");
		}
	};

	const handleGrantBadge = async () => {
		if (!id || !selectedBadgeToGrant) return;
		try {
			await badgesApi.grantBadge(id, selectedBadgeToGrant);
			const badgesData = await badgesApi.getUserBadges(id);
			setUserBadges(badgesData);
			setIsGrantDialogOpen(false);
			setSelectedBadgeToGrant("");
		} catch (error) {
			alert(
				"Failed to grant badge: " +
					(error instanceof Error ? error.message : "Unknown error"),
			);
		}
	};

	const handleRevokeBadge = async (badgeId: string) => {
		if (!id || !confirm("Are you sure you want to revoke this badge?")) return;
		try {
			await badgesApi.revokeBadge(id, badgeId);
			const badgesData = await badgesApi.getUserBadges(id);
			setUserBadges(badgesData);
		} catch (error) {
			alert(
				"Failed to revoke badge: " +
					(error instanceof Error ? error.message : "Unknown error"),
			);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-lg">Loading...</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-lg text-red-600">User not found</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-8 space-y-8">
			<div className="flex items-center gap-4">
				<Button variant="outline" onClick={() => navigate("/users")}>
					Back
				</Button>
				<h1 className="text-3xl font-bold">User Details</h1>
			</div>

			<div className="bg-white rounded-lg shadow p-6">
				<div className="flex justify-between items-start mb-4">
					<h2 className="text-xl font-semibold">Profile</h2>
					<Button onClick={handleMockLogin} variant="secondary">
						Mock Login
					</Button>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<span className="font-semibold text-gray-600 block">Nickname</span>
						<span>{user.nickname}</span>
					</div>
					<div>
						<span className="font-semibold text-gray-600 block">Email</span>
						<span>{user.email}</span>
					</div>
					<div>
						<span className="font-semibold text-gray-600 block">Joined</span>
						<span>{new Date(user.createdAt).toLocaleDateString()}</span>
					</div>
				</div>
			</div>

			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold">Badges</h2>
					<Button onClick={() => setIsGrantDialogOpen(true)} variant="outline">
						Grant Badge
					</Button>
					<Dialog open={isGrantDialogOpen} onOpenChange={setIsGrantDialogOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Grant Badge to User</DialogTitle>
							</DialogHeader>
							<div className="py-4">
								<Select
									onValueChange={setSelectedBadgeToGrant}
									value={selectedBadgeToGrant}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a badge" />
									</SelectTrigger>
									<SelectContent>
										{availableBadges.map((badge) => (
											<SelectItem key={badge.id} value={badge.id}>
												{badge.name} ({badge.code})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<DialogFooter>
								<Button
									onClick={handleGrantBadge}
									disabled={!selectedBadgeToGrant}
								>
									Grant
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				<div className="bg-white rounded-lg shadow">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Badge Name</TableHead>
								<TableHead>Code</TableHead>
								<TableHead>Earned At</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{userBadges.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={4}
										className="text-center py-8 text-gray-500"
									>
										No badges earned yet
									</TableCell>
								</TableRow>
							) : (
								userBadges.map((badge) => (
									<TableRow key={badge.id}>
										<TableCell className="font-medium">
											{badge.badge_name}
										</TableCell>
										<TableCell className="font-mono text-sm">
											{badge.badge_code}
										</TableCell>
										<TableCell>
											{new Date(badge.earned_at).toLocaleDateString()}
										</TableCell>
										<TableCell>
											<Button
												variant="destructive"
												size="sm"
												onClick={() => handleRevokeBadge(badge.badge_id)}
											>
												Revoke
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold">Words</h2>
					<Button onClick={handleCreateDummyWord}>Create Dummy Word</Button>
				</div>

				<div className="bg-white rounded-lg shadow">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Term</TableHead>
								<TableHead>Created At</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{words.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={2}
										className="text-center py-8 text-gray-500"
									>
										No words found
									</TableCell>
								</TableRow>
							) : (
								words.map((word) => (
									<TableRow key={word.id}>
										<TableCell className="font-medium">{word.term}</TableCell>
										<TableCell>
											{new Date(word.createdAt).toLocaleDateString()}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	);
}
