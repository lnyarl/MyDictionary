import { Book, Heart, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { GoogleLoginButton } from "../components/auth/GoogleLoginButton";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function HomePage() {
	const { t } = useTranslation();
	const { isAuthenticated, isLoading } = useAuth();
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/feed");
		}
	}, [isAuthenticated, navigate]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchTerm.trim()) {
			navigate(`/search?term=${encodeURIComponent(searchTerm.trim())}`);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
			<div className="container px-4 py-16">
				<div className="max-w-4xl mx-auto text-center">
					<div className="flex justify-center mb-8">
						<div className="rounded-full bg-primary/10 p-6">
							<Book className="h-16 w-16 text-primary" />
						</div>
					</div>

					<h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
						{t("home.title")}
					</h1>

					<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
						{t("home.subtitle")}
					</p>

					<div className="flex flex-col items-center gap-4 mb-16">
						<form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
							<Input
								type="text"
								placeholder={t("home.search_placeholder")}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="flex-1"
							/>
							<Button type="submit" variant="outline">
								<Search className="mr-2 h-4 w-4" />
								{t("common.search")}
							</Button>
						</form>
						<div className="text-muted-foreground text-sm">{t("home.or")}</div>
						<GoogleLoginButton />
					</div>

					<div className="grid md:grid-cols-3 gap-8 mt-16">
						<div className="p-6 rounded-lg border bg-card">
							<div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto mb-4">
								<Search className="h-6 w-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">{t("home.feature1_title")}</h3>
							<p className="text-sm text-muted-foreground">{t("home.feature1_desc")}</p>
						</div>

						<div className="p-6 rounded-lg border bg-card">
							<div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto mb-4">
								<Book className="h-6 w-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">{t("home.feature2_title")}</h3>
							<p className="text-sm text-muted-foreground">{t("home.feature2_desc")}</p>
						</div>

						<div className="p-6 rounded-lg border bg-card">
							<div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto mb-4">
								<Heart className="h-6 w-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">{t("home.feature3_title")}</h3>
							<p className="text-sm text-muted-foreground">{t("home.feature3_desc")}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
