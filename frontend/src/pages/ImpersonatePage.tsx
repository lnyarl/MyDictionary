import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "../lib/api/auth";

export default function ImpersonatePage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { refetchUser } = useAuth();

	useEffect(() => {
		const init = async () => {
			const token = searchParams.get("token");
			if (token) {
				try {
					await authApi.createSession(token);
					await refetchUser();
					navigate("/profile");
				} catch (error) {
					console.error("Failed to impersonate", error);
					navigate("/");
				}
			} else {
				navigate("/");
			}
		};

		init();
	}, [searchParams, navigate, refetchUser]);

	return (
		<div className="flex items-center justify-center min-h-[400px]">
			<div className="text-lg">Logging in as impersonated user...</div>
		</div>
	);
}
