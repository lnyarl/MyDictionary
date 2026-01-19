import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ui/table";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { useUsers } from "../hooks/useUsers";
import { usersApi } from "../lib/users";
import { AdminRole } from "../types/admin.types";

export default function UsersListPage() {
	const { admin } = useAdminAuth();
	const navigate = useNavigate();
	const canCreateUser =
		admin?.role === AdminRole.SUPER_ADMIN || admin?.role === AdminRole.DEVELOPER;
	console.log("Admin Role:", admin?.role);

	const [page, setPage] = useState(1);
	const [refreshKey, setRefreshKey] = useState(0);
	const { users, isLoading, error, meta } = useUsers(page, 20, refreshKey);

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [email, setEmail] = useState("");
	const [nickname, setNickname] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const handleCreateUser = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);

		if (!email.trim() || !nickname.trim()) {
			setFormError("Email and nickname are required");
			return;
		}

		if (nickname.trim().length < 2) {
			setFormError("Nickname must be at least 2 characters");
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email.trim())) {
			setFormError("Please enter a valid email address");
			return;
		}

		try {
			setIsSubmitting(true);
			await usersApi.createUser({
				email: email.trim(),
				nickname: nickname.trim(),
			});
			setIsDialogOpen(false);
			setEmail("");
			setNickname("");
			setRefreshKey((prev) => prev + 1);
		} catch (err) {
			setFormError(err instanceof Error ? err.message : "Failed to create user");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCreateDummyUser = async () => {
		try {
			await usersApi.createDummyUser();
			setRefreshKey((prev) => prev + 1);
		} catch (_err) {
			alert("Failed to create dummy user");
		}
	};

	const handleDialogClose = (open: boolean) => {
		if (!open) {
			setEmail("");
			setNickname("");
			setFormError(null);
		}
		setIsDialogOpen(open);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-lg">Loading users...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-red-600 bg-red-50 p-4 rounded">Error: {error}</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-8">
			<div className="mb-6 flex justify-between items-start">
				<div>
					<h1 className="text-3xl font-bold">Users Management</h1>
					<p className="text-gray-600 mt-2">View and manage all registered users</p>
				</div>
				<div className="flex gap-2">
					{canCreateUser && (
						<>
							<Button onClick={handleCreateDummyUser} variant="secondary">
								Create Dummy User
							</Button>
							<Button onClick={() => setIsDialogOpen(true)}>Create User</Button>
						</>
					)}
				</div>
			</div>

			<Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New User</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleCreateUser}>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="user@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									disabled={isSubmitting}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="nickname">Nickname</Label>
								<Input
									id="nickname"
									type="text"
									placeholder="Enter nickname"
									value={nickname}
									onChange={(e) => setNickname(e.target.value)}
									disabled={isSubmitting}
								/>
							</div>
							{formError && (
								<div className="text-sm text-red-600 bg-red-50 p-2 rounded">{formError}</div>
							)}
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => handleDialogClose(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Creating..." : "Create"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<div className="bg-white rounded-lg shadow">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Email</TableHead>
							<TableHead>Nickname</TableHead>
							<TableHead>Profile</TableHead>
							<TableHead>Created At</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} className="text-center py-8 text-gray-500">
									No users found
								</TableCell>
							</TableRow>
						) : (
							users.map((user) => (
								<TableRow
									key={user.id}
									className="cursor-pointer hover:bg-gray-50"
									onClick={() => navigate(`/users/${user.id}`)}
								>
									<TableCell className="font-medium">{user.email}</TableCell>
									<TableCell>{user.nickname}</TableCell>
									<TableCell>
										{user.profilePicture ? (
											<img
												src={user.profilePicture}
												alt={user.nickname}
												className="w-8 h-8 rounded-full"
											/>
										) : (
											<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
												<span className="text-xs text-gray-600">
													{user.nickname.charAt(0).toUpperCase()}
												</span>
											</div>
										)}
									</TableCell>
									<TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>

				<div className="flex justify-between items-center p-4 border-t">
					<div className="text-sm text-gray-600">
						Page {meta.page} of {meta.totalPages} ({meta.total} total users)
					</div>
					<div className="space-x-2">
						<Button
							onClick={() => setPage(page - 1)}
							disabled={page === 1}
							variant="outline"
							size="sm"
						>
							Previous
						</Button>
						<Button
							onClick={() => setPage(page + 1)}
							disabled={page >= meta.totalPages}
							variant="outline"
							size="sm"
						>
							Next
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
