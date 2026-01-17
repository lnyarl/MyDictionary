import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo2.png";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../lib/utils";
import { GoogleLoginButton } from "../auth/GoogleLoginButton";
import { UserMenu } from "../auth/UserMenu";

export function Header() {
	const { isAuthenticated, isLoading } = useAuth();
	const location = useLocation();

	const navItems = [
		{ name: "피드", path: "/feed" },
		{ name: "내 사전", path: "/dashboard" },
		{ name: "검색", path: "/search" },
	];

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
			<div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
				<Link to="/" className="flex items-center space-x-3 group">
					<div className="relative h-16 w-16 overflow-hidden rounded-xl bg-primary/10 transition-transform group-hover:scale-110 group-hover:rotate-3">
						<img src={logo} alt="Stashy Logo" className="h-full w-full object-contain" />
					</div>
					<div className="flex flex-col">
						<span className="font-black text-2xl tracking-tighter text-primary">STASHY</span>
						<span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground leading-none">
							Stash your gems
						</span>
					</div>
				</Link>

				<nav className="hidden md:flex items-center space-x-1">
					{!isLoading && isAuthenticated && (
						<>
							{navItems.map((item) => (
								<Link
									key={item.path}
									to={item.path}
									className={cn(
										"px-4 py-2 text-sm font-semibold rounded-full transition-all hover:bg-secondary/80",
										location.pathname === item.path
											? "text-primary bg-primary/10"
											: "text-muted-foreground hover:text-foreground",
									)}
								>
									{item.name}
								</Link>
							))}
							<div className="ml-4 pl-4 border-l h-6 border-border flex items-center">
								<UserMenu />
							</div>
						</>
					)}
					{!isLoading && !isAuthenticated && (
						<div className="flex items-center space-x-4">
							<GoogleLoginButton />
						</div>
					)}
				</nav>

				<div className="md:hidden flex items-center space-x-4">
					{!isLoading && isAuthenticated ? <UserMenu /> : <GoogleLoginButton />}
				</div>
			</div>
		</header>
	);
}
