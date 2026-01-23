export interface Badge {
	id: string;
	code: string;
	name: string;
	description: string | null;
	icon: string | null;
	category: string;
	event_type: string;
	threshold: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface UserBadge {
	id: string;
	user_id: string;
	badge_id: string;
	earned_at: string;
}

export interface BadgeWithProgress extends Badge {
	earned_at?: string;
	current_count: number;
	is_earned: boolean;
}
