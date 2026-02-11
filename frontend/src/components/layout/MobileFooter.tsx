import { Bell, Home, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/stores/useNotificationStore";

export function MobileFooter() {
  const location = useLocation();
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const navItems = [
    {
      icon: Home,
      path: "/feed",
      label: "Home",
    },
    {
      icon: Search,
      path: "/search",
      label: "Search",
    },
    {
      icon: Bell,
      path: "/notifications",
      label: "Notifications",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-16 items-center justify-around px-2 pb-safe">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          const isNotification = item.label === "Notifications";

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "group flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors hover:bg-accent/50 active:scale-95",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "h-6 w-6 transition-all duration-200 group-active:scale-90",
                    active && "fill-current",
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
                {isNotification && unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" />
                  </span>
                )}
              </div>
              <span className={cn("transition-all", active && "font-semibold")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
