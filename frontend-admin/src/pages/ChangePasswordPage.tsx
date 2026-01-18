import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { adminAuthApi } from "../lib/auth";

export default function ChangePasswordPage() {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { refetchAdmin, admin } = useAdminAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (newPassword !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (newPassword.length < 8) {
			setError("Password must be at least 8 characters long");
			return;
		}

		if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
			setError(
				"Password must contain at least one uppercase letter, one lowercase letter, and one number",
			);
			return;
		}

		setIsLoading(true);

		try {
			await adminAuthApi.changePassword(currentPassword, newPassword);
			await refetchAdmin();
			navigate("/users");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Password change failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto p-8">
			<div className="mb-6">
				<h2 className="text-2xl font-bold">Change Password</h2>
				{admin?.mustChangePassword && (
					<p className="mt-2 text-sm text-amber-600 bg-amber-50 p-3 rounded">
						You must change your password before continuing.
					</p>
				)}
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="currentPassword">Current Password</Label>
					<Input
						id="currentPassword"
						type="password"
						value={currentPassword}
						onChange={(e) => setCurrentPassword(e.target.value)}
						required
						disabled={isLoading}
						autoComplete="current-password"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="newPassword">New Password</Label>
					<Input
						id="newPassword"
						type="password"
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						required
						minLength={8}
						disabled={isLoading}
						autoComplete="new-password"
					/>
					<p className="text-sm text-gray-500">
						Must be at least 8 characters with uppercase, lowercase, and number
					</p>
				</div>

				<div className="space-y-2">
					<Label htmlFor="confirmPassword">Confirm Password</Label>
					<Input
						id="confirmPassword"
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
						disabled={isLoading}
						autoComplete="new-password"
					/>
				</div>

				{error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? "Changing Password..." : "Change Password"}
				</Button>
			</form>
		</div>
	);
}
