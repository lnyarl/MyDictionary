import { useCallback, useEffect, useState } from "react";
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
import { adminUsersApi } from "../lib/admin-users";
import { AdminRole, type AdminRoleType, type AdminUser } from "../types/admin.types";

const roleLabels: Record<AdminRoleType, string> = {
	super_admin: "Super Admin",
	developer: "Developer",
	operator: "Operator",
};

export default function AdminUsersPage() {
	const [admins, setAdmins] = useState<AdminUser[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState<Exclude<AdminRoleType, "super_admin">>(AdminRole.OPERATOR);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
	const [editRole, setEditRole] = useState<Exclude<AdminRoleType, "super_admin">>(
		AdminRole.OPERATOR,
	);

	const fetchAdmins = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const data = await adminUsersApi.getAll();
			setAdmins(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch admin users");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchAdmins();
	}, [fetchAdmins]);

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);

		if (!username.trim() || !password.trim()) {
			setFormError("Username and password are required");
			return;
		}

		if (username.trim().length < 3) {
			setFormError("Username must be at least 3 characters");
			return;
		}

		if (password.length < 8) {
			setFormError("Password must be at least 8 characters");
			return;
		}

		try {
			setIsSubmitting(true);
			await adminUsersApi.create({
				username: username.trim(),
				password,
				role,
			});
			setIsCreateDialogOpen(false);
			setUsername("");
			setPassword("");
			setRole(AdminRole.OPERATOR);
			fetchAdmins();
		} catch (err) {
			setFormError(err instanceof Error ? err.message : "Failed to create admin user");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdateRole = async () => {
		if (!editingAdmin) return;

		try {
			setIsSubmitting(true);
			await adminUsersApi.updateRole(editingAdmin.id, { role: editRole });
			setEditingAdmin(null);
			fetchAdmins();
		} catch (err) {
			setFormError(err instanceof Error ? err.message : "Failed to update role");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCreateDialogClose = (open: boolean) => {
		if (!open) {
			setUsername("");
			setPassword("");
			setRole(AdminRole.OPERATOR);
			setFormError(null);
		}
		setIsCreateDialogOpen(open);
	};

	const handleEditDialogClose = (open: boolean) => {
		if (!open) {
			setEditingAdmin(null);
			setFormError(null);
		}
	};

	const openEditDialog = (admin: AdminUser) => {
		if (admin.role === AdminRole.SUPER_ADMIN) return;
		setEditingAdmin(admin);
		setEditRole(admin.role as Exclude<AdminRoleType, "super_admin">);
		setFormError(null);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-lg">Loading admin users...</div>
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
					<h1 className="text-3xl font-bold">Admin Users Management</h1>
					<p className="text-gray-600 mt-2">Manage admin accounts and roles</p>
				</div>
				<Button onClick={() => setIsCreateDialogOpen(true)}>Create Admin User</Button>
			</div>

			<Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogClose}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create Admin User</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleCreate}>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="username">Username</Label>
								<Input
									id="username"
									type="text"
									placeholder="Enter username"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									disabled={isSubmitting}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									placeholder="Enter password (min 8 chars)"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									disabled={isSubmitting}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="role">Role</Label>
								<select
									id="role"
									className="w-full border rounded-md px-3 py-2"
									value={role}
									onChange={(e) => setRole(e.target.value as Exclude<AdminRoleType, "super_admin">)}
									disabled={isSubmitting}
								>
									<option value={AdminRole.OPERATOR}>Operator</option>
									<option value={AdminRole.DEVELOPER}>Developer</option>
								</select>
							</div>
							{formError && (
								<div className="text-sm text-red-600 bg-red-50 p-2 rounded">{formError}</div>
							)}
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => handleCreateDialogClose(false)}
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

			<Dialog open={!!editingAdmin} onOpenChange={handleEditDialogClose}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Role: {editingAdmin?.username}</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="edit-role">Role</Label>
							<select
								id="edit-role"
								className="w-full border rounded-md px-3 py-2"
								value={editRole}
								onChange={(e) =>
									setEditRole(e.target.value as Exclude<AdminRoleType, "super_admin">)
								}
								disabled={isSubmitting}
							>
								<option value={AdminRole.OPERATOR}>Operator</option>
								<option value={AdminRole.DEVELOPER}>Developer</option>
							</select>
						</div>
						{formError && (
							<div className="text-sm text-red-600 bg-red-50 p-2 rounded">{formError}</div>
						)}
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleEditDialogClose(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button onClick={handleUpdateRole} disabled={isSubmitting}>
							{isSubmitting ? "Saving..." : "Save"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<div className="bg-white rounded-lg shadow">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Username</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Last Login</TableHead>
							<TableHead>Created At</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{admins.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="text-center py-8 text-gray-500">
									No admin users found
								</TableCell>
							</TableRow>
						) : (
							admins.map((admin) => (
								<TableRow key={admin.id}>
									<TableCell className="font-medium">{admin.username}</TableCell>
									<TableCell>
										<span
											className={`px-2 py-1 rounded text-sm ${
												admin.role === AdminRole.SUPER_ADMIN
													? "bg-purple-100 text-purple-800"
													: admin.role === AdminRole.DEVELOPER
														? "bg-blue-100 text-blue-800"
														: "bg-gray-100 text-gray-800"
											}`}
										>
											{roleLabels[admin.role]}
										</span>
									</TableCell>
									<TableCell>
										{admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : "Never"}
									</TableCell>
									<TableCell>
										{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "-"}
									</TableCell>
									<TableCell>
										{admin.role !== AdminRole.SUPER_ADMIN && (
											<Button variant="outline" size="sm" onClick={() => openEditDialog(admin)}>
												Edit Role
											</Button>
										)}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
