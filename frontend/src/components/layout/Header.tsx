import { Book } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { GoogleLoginButton } from "../auth/GoogleLoginButton";
import { UserMenu } from "../auth/UserMenu";

export function Header() {
	const { isAuthenticated, isLoading } = useAuth();

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex h-16 items-center justify-between px-4 md:px-8 lg:px-12">
				<Link to="/" className="flex items-center space-x-2">
					<Book className="h-6 w-6" />
					<span className="font-bold text-xl">MyDictionary</span>
				</Link>

				<nav className="flex items-center space-x-6">
					{!isLoading &&
						(isAuthenticated ? (
							<>
								<Link
									to="/feed"
									className="text-sm font-medium transition-colors hover:text-primary"
								>
									피드
								</Link>
								<Link
									to="/dashboard"
									className="text-sm font-medium transition-colors hover:text-primary"
								>
									내 사전
								</Link>
								<Link
									to="/search"
									className="text-sm font-medium transition-colors hover:text-primary"
								>
									검색
								</Link>
								<UserMenu />
							</>
						) : (
							<GoogleLoginButton />
						))}
				</nav>
			</div>
		</header>
	);
}
