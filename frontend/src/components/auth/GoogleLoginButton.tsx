import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

declare global {
	interface Window {
		google?: {
			accounts: {
				id: {
					initialize: (config: any) => void;
					renderButton: (parent: HTMLElement, options: any) => void;
					prompt: () => void;
				};
			};
		};
	}
}

export function GoogleLoginButton() {
	const { handleGoogleLogin } = useAuth();
	const buttonRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const initializeGoogleSignIn = () => {
			if (!window.google || !buttonRef.current) {
				return;
			}

			const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

			if (!clientId) {
				console.error("VITE_GOOGLE_CLIENT_ID is not defined");
				return;
			}

			window.google.accounts.id.initialize({
				client_id: clientId,
				callback: handleGoogleLogin,
			});

			window.google.accounts.id.renderButton(buttonRef.current, {
				theme: "outline",
				size: "large",
				text: "continue_with",
				width: 280,
			});
		};

		// Wait for Google Script to load
		if (window.google) {
			initializeGoogleSignIn();
		} else {
			const intervalId = setInterval(() => {
				if (window.google) {
					initializeGoogleSignIn();
					clearInterval(intervalId);
				}
			}, 100);

			return () => clearInterval(intervalId);
		}
	}, [handleGoogleLogin]);

	return <div ref={buttonRef} />;
}
