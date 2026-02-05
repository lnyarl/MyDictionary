import {
  Award,
  Book,
  Crown,
  Feather,
  FileText,
  Flame,
  Heart,
  Loader2,
  Lock,
  Pencil,
  Star,
  ThumbsUp,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import type { BadgeWithProgress } from "@/lib/api/badges";
import { cn } from "../../lib/utils";
import { Card, CardContent } from "../ui/card";

type BadgeListProps = {
  badges: BadgeWithProgress[];
  loading: boolean;
};

const iconMap: Record<string, any> = {
  pencil: Pencil,
  book: Book,
  crown: Crown,
  trophy: Trophy,
  "file-text": FileText,
  feather: Feather,
  award: Award,
  "user-plus": UserPlus,
  users: Users,
  star: Star,
  heart: Heart,
  "thumbs-up": ThumbsUp,
  flame: Flame,
};

export function BadgeList({ badges, loading }: BadgeListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">표시할 뱃지가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
      {badges.map((badge) => {
        const Icon = iconMap[badge.icon || ""] || Lock;
        const progressPercent = Math.min(100, (badge.current_count / badge.threshold) * 100);

        return (
          <Card
            key={badge.id}
            className={cn(
              "relative overflow-hidden transition-all hover:shadow-md",
              !badge.is_earned && "opacity-60 grayscale bg-muted/50",
            )}
            title={
              !badge.is_earned
                ? `진행도: ${badge.current_count} / ${badge.threshold}`
                : `획득일: ${new Date(badge.earned_at!).toLocaleDateString()}`
            }
          >
            <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div
                className={cn(
                  "p-3 rounded-full bg-primary/10",
                  badge.is_earned ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-semibold text-sm">{badge.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {badge.description}
                </p>
              </div>

              {!badge.is_earned && (
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-primary/50 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
