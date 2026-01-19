import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ui/table";
import { usersApi } from "../lib/users";
import { type Word, wordsApi } from "../lib/words";
import type { User } from "../types/admin.types";

export default function UserDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [user, setUser] = useState<User | null>(null);
	const [words, setWords] = useState<Word[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			if (!id) return;
			try {
				setIsLoading(true);
				const [userData, wordsData] = await Promise.all([
					usersApi.getUser(id),
					wordsApi.getWordsByUserId(id),
				]);
				setUser(userData);
				setWords(wordsData);
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
			const mainAppUrl = import.meta.env.VITE_MAIN_APP_URL || "http://localhost:5173";
			window.open(`${mainAppUrl}/auth/impersonate?token=${token}`, "_blank");
		} catch (error) {
			console.error("Failed to mock login", error);
			alert("Failed to mock login");
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
									<TableCell colSpan={2} className="text-center py-8 text-gray-500">
										No words found
									</TableCell>
								</TableRow>
							) : (
								words.map((word) => (
									<TableRow key={word.id}>
										<TableCell className="font-medium">{word.term}</TableCell>
										<TableCell>{new Date(word.createdAt).toLocaleDateString()}</TableCell>
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
