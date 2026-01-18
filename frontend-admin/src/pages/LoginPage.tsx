import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAdminAuth } from "../contexts/AdminAuthContext";

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { login } = useAdminAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const result = await login(username, password);

			if (result.mustChangePassword) {
				navigate("/change-password");
			} else {
				navigate("/users");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
				<div>
					<h2 className="text-3xl font-bold text-center">Admin Login</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Sign in to access the admin panel
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="username">Username</Label>
						<Input
							id="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							autoComplete="username"
							disabled={isLoading}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							autoComplete="current-password"
							disabled={isLoading}
						/>
					</div>

					{error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}

					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? "Logging in..." : "Login"}
					</Button>
				</form>
			</div>
		</div>
	);
}
