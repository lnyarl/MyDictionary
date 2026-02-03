import { Award, Bell, Heart, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notificationsApi } from "@/lib/api/notifications";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notification.types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

function formatRelativeTime(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) return "방금 전";
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
	if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
	return date.toLocaleDateString("ko-KR");
}

function NotificationIcon({ type }: { type: Notification["type"] }) {
	if (type === "follow") {
		return <UserPlus className="h-4 w-4 text-blue-500" />;
	}
	if (type === "badge") {
		return <Award className="h-4 w-4 text-yellow-500" />;
	}
	return <Heart className="h-4 w-4 text-red-500" />;
}

export function NotificationDropdown() {
	const navigate = useNavigate();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	const fetchUnreadCount = useCallback(async () => {
		try {
			const response = await notificationsApi.getUnreadCount();
			setUnreadCount(response.count);
		} catch { }
	}, []);

	const fetchNotifications = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await notificationsApi.getNotifications(1, 5);
			setNotifications(response.data);
		} catch {
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchUnreadCount();
		const interval = setInterval(fetchUnreadCount, 30000);
		return () => clearInterval(interval);
	}, [fetchUnreadCount]);

	useEffect(() => {
		if (isOpen) {
			fetchNotifications();
		}
	}, [isOpen, fetchNotifications]);

	const handleNotificationClick = async (notification: Notification) => {
		if (!notification.isRead) {
			try {
				await notificationsApi.markAsRead(notification.id);
				setNotifications((prev) =>
					prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
				);
				setUnreadCount((prev) => Math.max(0, prev - 1));
			} catch { }
		}

		if (notification.targetUrl) {
			navigate(notification.targetUrl);
			setIsOpen(false);
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			await notificationsApi.markAllAsRead();
			setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
			setUnreadCount(0);
		} catch { }
	};

	const handleViewAll = () => {
		navigate("/notifications");
		setIsOpen(false);
	};

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger className="relative focus:outline-none p-2 rounded-full hover:bg-secondary/80 transition-colors">
				<Bell className="h-5 w-5 text-muted-foreground" />
				{unreadCount > 0 && (
					<span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
						{unreadCount > 99 ? "99+" : unreadCount}
					</span>
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80">
				<DropdownMenuLabel className="flex items-center justify-between">
					<span>알림</span>
					{unreadCount > 0 && (
						<button
							type="button"
							onClick={handleMarkAllAsRead}
							className="text-xs text-primary hover:underline font-normal cursor-pointer"
						>
							모두 읽음
						</button>
					)}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />

				{isLoading ? (
					<div className="py-8 text-center text-sm text-muted-foreground">로딩 중...</div>
				) : notifications.length === 0 ? (
					<div className="py-8 text-center text-sm text-muted-foreground">알림이 없습니다</div>
				) : (
					notifications.map((notification) => (
						<DropdownMenuItem
							key={notification.id}
							onClick={() => handleNotificationClick(notification)}
							className={cn("flex items-start gap-3 p-3", !notification.isRead && "bg-primary/5")}
						>
							<div className="relative shrink-0">
								<Avatar className="h-9 w-9">
									<AvatarImage
										src={notification.actor?.profilePicture || undefined}
										alt={notification.actor?.nickname || "User"}
									/>
									<AvatarFallback className="text-xs">
										{notification.actor?.nickname?.charAt(0).toUpperCase() || "?"}
									</AvatarFallback>
								</Avatar>
								<div className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5">
									<NotificationIcon type={notification.type} />
								</div>
							</div>
							<div className="flex-1 min-w-0">
								<p className={cn("text-sm leading-tight", !notification.isRead && "font-medium")}>
									{notification.title}
								</p>
								<p className="text-xs text-muted-foreground mt-0.5">
									{formatRelativeTime(notification.createdAt)}
								</p>
							</div>
							{!notification.isRead && (
								<div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
							)}
						</DropdownMenuItem>
					))
				)}

				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleViewAll} className="justify-center text-primary">
					모든 알림 보기
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
