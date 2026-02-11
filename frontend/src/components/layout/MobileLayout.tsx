import { Bell, Home, Menu, Search, Settings, User, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/stores/useNotificationStore";
import logo from "../../assets/logo3.png";
import { MobileFooter } from "./MobileFooter";

type NavItem = {
  icon: React.ReactNode;
  path: string;
  label: string;
};

export function MobileLayout({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navItems: NavItem[] = [
    { icon: <Home className="h-5 w-5" />, path: "/feed", label: "Home" },
    { icon: <Search className="h-5 w-5" />, path: "/search", label: "Search" },
    { icon: <User className="h-5 w-5" />, path: "/profile", label: "Profile" },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  const navItemClass = (path: string) =>
    cn(
      "flex items-center gap-4 px-4 py-4 font-medium transition-colors hover:bg-primary/10",
      isActive(path)
        ? "bg-secondary/80 text-foreground"
        : "text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="mobile-layout md:hidden flex flex-col h-screen">
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Link to="/feed" className="flex items-center gap-2">
          <img src={logo} alt="Stashy Logo" className="h-8 w-8 object-contain" />
        </Link>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background" />
          )}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      <MobileFooter />

      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 h-full w-full cursor-default bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 z-50 h-full w-[80%] max-w-75 flex flex-col border-l bg-background shadow-xl animate-in slide-in-from-right duration-300">
            <div className="border-b">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-14 w-14 flex items-center justify-center opacity-70 hover:opacity-100 focus:outline-none cursor-pointer"
              >
                <X className="h-5 w-5 " />
                <span className="sr-only">Close</span>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 space-y-2">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} className={navItemClass(item.path)}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}

              <Link to="/notifications" className={navItemClass("/notifications")}>
                <div className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                  )}
                </div>
                <span className="flex-1">Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-auto text-xs font-medium text-muted-foreground">
                    {unreadCount} new
                  </span>
                )}
              </Link>
            </nav>

            <div className="border-t p-4">
              <Link to="/settings" className={navItemClass("/settings")}>
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
