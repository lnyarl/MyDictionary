import { useState } from "react";
import { Button } from "../components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ui/table";
import { useUsers } from "../hooks/useUsers";

export default function UsersListPage() {
	const [page, setPage] = useState(1);
	const { users, isLoading, error, meta } = useUsers(page, 20);

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
				<div className="text-red-600 bg-red-50 p-4 rounded">
					Error: {error}
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-8">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">Users Management</h1>
				<p className="text-gray-600 mt-2">
					View and manage all registered users
				</p>
			</div>

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
								<TableRow key={user.id}>
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
									<TableCell>
										{new Date(user.createdAt).toLocaleDateString()}
									</TableCell>
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
