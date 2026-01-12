import { Book, Heart, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLoginButton } from "../components/auth/GoogleLoginButton";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
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
						나만의 단어 사전을 만드세요
					</h1>

					<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
						단어에 나만의 의미를 부여하고, 다른 사람들과 공유하세요. 당신만의
						언어 세계를 만들어보세요.
					</p>

					<div className="flex flex-col items-center gap-4 mb-16">
						<form
							onSubmit={handleSearch}
							className="flex gap-2 w-full max-w-md"
						>
							<Input
								type="text"
								placeholder="단어를 검색하세요..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="flex-1"
							/>
							<Button type="submit" variant="outline">
								<Search className="mr-2 h-4 w-4" />
								검색
							</Button>
						</form>
						<div className="text-muted-foreground text-sm">또는</div>
						<GoogleLoginButton />
					</div>

					<div className="grid md:grid-cols-3 gap-8 mt-16">
						<div className="p-6 rounded-lg border bg-card">
							<div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto mb-4">
								<Search className="h-6 w-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">검색하고 발견하기</h3>
							<p className="text-sm text-muted-foreground">
								다른 사람들이 정의한 단어를 검색하고 새로운 관점을 발견하세요
							</p>
						</div>

						<div className="p-6 rounded-lg border bg-card">
							<div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto mb-4">
								<Book className="h-6 w-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">나만의 정의 만들기</h3>
							<p className="text-sm text-muted-foreground">
								단어에 당신만의 의미를 부여하고 개인적인 사전을 만드세요
							</p>
						</div>

						<div className="p-6 rounded-lg border bg-card">
							<div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto mb-4">
								<Heart className="h-6 w-6 text-primary" />
							</div>
							<h3 className="font-semibold mb-2">공유하고 소통하기</h3>
							<p className="text-sm text-muted-foreground">
								마음에 드는 정의에 좋아요를 누르고 의미를 공유하세요
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
