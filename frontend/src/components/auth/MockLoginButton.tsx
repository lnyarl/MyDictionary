import { Button } from "../ui/button";

export function MockLoginButton() {
	const handleMockLogin = async () => {
		try {
			const response = await fetch("/api/auth/mock-login", {
				method: "POST",
			});
			if (response.ok) {
				window.location.reload();
			}
		} catch (error) {
			console.error("Mock login failed", error);
		}
	};

	if (import.meta.env.PROD) {
		return null;
	}

	return (
		<Button variant="outline" onClick={handleMockLogin} data-testid="mock-login-button">
			Mock Login
		</Button>
	);
}
