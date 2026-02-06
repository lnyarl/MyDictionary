import { Bell, Home, Search, Settings, User } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/stores/useNotificationStore";

type NavItem = {
  icon: React.ReactNode;
  path: string;
  label: string;
};

export function Sidebar() {
  const location = useLocation();
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const navItems: NavItem[] = [
    { icon: <Home className="h-6 w-6" />, path: "/feed", label: "Home" },
    { icon: <Search className="h-6 w-6" />, path: "/search", label: "Search" },
    { icon: <User className="h-6 w-6" />, path: "/profile", label: "Profile" },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);
  const defaultClassName =
    "flex h-12 w-12 items-center justify-center rounded-xl transition-all relative hover:bg-primary/10 text-primary";

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[72px] flex-col items-center border-r bg-background py-4">
      <nav className="flex flex-1 flex-col items-center gap-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={item.label}
            className={cn(
              defaultClassName,
              isActive(item.path)
                ? "bg-secondary/80"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.icon}
          </Link>
        ))}

        <Link
          to="/notifications"
          title={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
          className={cn(
            defaultClassName,
            isActive("/notifications")
              ? "bg-secondary/80"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
          )}
        </Link>
      </nav>

      <div className="pb-4">
        <Link
          to="/settings"
          title="Settings"
          className={cn(
            defaultClassName,
            isActive("/settings")
              ? "bg-secondary/80"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Settings className="h-6 w-6" />
        </Link>
      </div>
    </aside>
  );
}
