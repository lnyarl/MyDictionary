import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logo from "../../assets/logo3.png";
import { cn } from "../../lib/utils";
import { GoogleLoginButton } from "../auth/GoogleLoginButton";
import { UserMenu } from "../auth/UserMenu";
import { NotificationDropdown } from "../notifications/NotificationDropdown";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { name: t("header.feed"), path: "/feed" },
    { name: t("header.my_stash"), path: "/profile" },
    { name: t("header.search"), path: "/search" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative h-16 w-16 overflow-hidden rounded-md bg-primary/10 transition-transform group-hover:scale-110 group-hover:rotate-3">
            <img src={logo} alt="Stashy Logo" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter text-primary">STASHY</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {!isLoading && (
            <>
              {isAuthenticated &&
                navItems.map((item) => (
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
              <div className="ml-2 flex items-center space-x-2">
                <LanguageSwitcher />
                {isAuthenticated ? (
                  <div className="ml-2 pl-4 border-l h-6 border-border flex items-center gap-2">
                    <NotificationDropdown />
                    <UserMenu />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <GoogleLoginButton />
                  </div>
                )}
              </div>
            </>
          )}
        </nav>

        <div className="md:hidden flex items-center space-x-2">
          <LanguageSwitcher />
          {!isLoading &&
            (isAuthenticated ? (
              <div className="flex items-center gap-2">
                <NotificationDropdown />
                <UserMenu />
              </div>
            ) : (
              <>
                <GoogleLoginButton />
              </>
            ))}
        </div>
      </div>
    </header>
  );
}
