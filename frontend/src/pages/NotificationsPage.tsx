import { Bell, Heart, Loader2, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Page } from "@/components/layout/Page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { notificationsApi } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import type { Notification, NotificationsResponse } from "@/types/notification.types";

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
		return <UserPlus className="h-5 w-5 text-blue-500" />;
	}
	return <Heart className="h-5 w-5 text-red-500" />;
}

export default function NotificationsPage() {
	const navigate = useNavigate();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [cursor, setCursor] = useState<string | undefined>(undefined);
	const [hasMore, setHasMore] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const { t } = useTranslation();

	const fetchNotifications = useCallback(async (pageNum: number, nextCursor?: string, append = false) => {
		if (append) {
			setLoadingMore(true);
		} else {
			setIsLoading(true);
		}

		try {
			const response: NotificationsResponse = await notificationsApi.getNotifications(pageNum, 10, nextCursor);
			if (append) {
				setNotifications((prev) => {
					const newItems = response.data.filter(
						(newItem) => !prev.some((existingItem) => existingItem.id === newItem.id)
					);
					return [...prev, ...newItems];
				});
			} else {
				setNotifications(response.data);
			}
			setHasMore(!!response.meta.nextCursor);
			setPage(pageNum);
			setCursor(response.meta.nextCursor);
		} catch {
		} finally {
			setIsLoading(false);
			setLoadingMore(false);
		}
	}, []);

	useEffect(() => {
		fetchNotifications(1);
	}, [fetchNotifications]);

	const handleLoadMore = useCallback(() => {
		fetchNotifications(page + 1, cursor, true);
	}, [page, cursor, fetchNotifications]);

	const { sentinelRef } = useInfiniteScroll({
		onLoadMore: handleLoadMore,
		hasMore,
		isLoading: loadingMore,
	});

	const handleNotificationClick = async (notification: Notification) => {
		if (!notification.isRead) {
			try {
				await notificationsApi.markAsRead(notification.id);
				setNotifications((prev) =>
					prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
				);
			} catch { }
		}

		if (notification.targetUrl) {
			navigate(notification.targetUrl);
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			await notificationsApi.markAllAsRead();
			setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
		} catch { }
	};

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	return (
		<Page>
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-3">
						<Bell className="h-8 w-8" />
						알림
					</h1>
					<p className="text-muted-foreground mt-2">최근 알림을 확인하세요</p>
				</div>
				{unreadCount > 0 && (
					<Button variant="outline" onClick={handleMarkAllAsRead}>
						모두 읽음으로 표시
					</Button>
				)}
			</div>

			{isLoading && notifications.length === 0 ? (
				<div className="rounded-lg border bg-muted/50 p-12 text-center">
					<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
					<p className="text-muted-foreground">로딩 중...</p>
				</div>
			) : notifications.length === 0 ? (
				<div className="rounded-lg border border-dashed p-12 text-center">
					<Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
					<p className="text-muted-foreground">알림이 없습니다</p>
				</div>
			) : (
				<>
					<div className="space-y-2">
						{notifications.map((notification) => (
							<button
								type="button"
								key={notification.id}
								onClick={() => handleNotificationClick(notification)}
								className={cn(
									"w-full text-left flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
									!notification.isRead && "bg-primary/5 border-primary/20",
								)}
							>
								<div className="relative flex-shrink-0">
									<Avatar className="h-12 w-12">
										<AvatarImage
											src={notification.actor?.profilePicture || undefined}
											alt={notification.actor?.nickname || "User"}
										/>
										<AvatarFallback>
											{notification.actor?.nickname?.charAt(0).toUpperCase() || "?"}
										</AvatarFallback>
									</Avatar>
									<div className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5 border">
										<NotificationIcon type={notification.type} />
									</div>
								</div>
								<div className="flex-1 min-w-0">
									<p
										className={cn("text-sm leading-relaxed", !notification.isRead && "font-medium")}
									>
										{notification.title}
									</p>
									{notification.message && (
										<p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
									)}
									<p className="text-xs text-muted-foreground mt-2">
										{formatRelativeTime(notification.createdAt)}
									</p>
								</div>
								{!notification.isRead && (
									<div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-2" />
								)}
							</button>
						))}
					</div>

					<div ref={sentinelRef} className="py-4 flex justify-center">
						{(loadingMore && hasMore) ? (
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						) : (
							notifications.length > 0 && (
								<p className="text-sm text-muted-foreground italic">{t("common.end_of_list")}</p>
							)
						)}
					</div>
				</>
			)}
		</Page>
	);
}
