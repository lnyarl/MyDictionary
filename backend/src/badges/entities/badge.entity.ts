export class BadgeEntity {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string;
  event_type: string;
  threshold: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class UserBadgeEntity {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: Date;
}

export class UserBadgeProgressEntity {
  id: string;
  user_id: string;
  event_type: string;
  count: number;
  last_updated: Date;
  created_at: Date;
}

export interface BadgeWithProgress extends BadgeEntity {
  earned_at?: Date;
  current_count: number;
  is_earned: boolean;
}
