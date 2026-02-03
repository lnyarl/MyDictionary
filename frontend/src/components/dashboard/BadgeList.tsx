import type { BadgeWithProgress } from "@stashy/shared";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface BadgeListProps {
  badges: BadgeWithProgress[];
  isLoading?: boolean;
}

export function BadgeList({ badges, isLoading }: BadgeListProps) {
  if (isLoading) {
    return (
      <div className="flex gap-2 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-8 h-8 rounded-full bg-gray-200" />
        ))}
      </div>
    );
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {badges.map((badge) => (
        <HoverCard key={badge.id}>
          <HoverCardTrigger asChild>
            <div
              className={`
                flex items-center justify-center w-8 h-8 rounded-full 
                border cursor-help transition-all duration-200
                ${
                  badge.is_earned
                    ? "bg-amber-100 border-amber-200 text-amber-700 shadow-sm"
                    : "bg-gray-50 border-gray-100 text-gray-300 opacity-50 grayscale"
                }
              `}
              title={!badge.is_earned ? `${badge.name} (Not Earned)` : badge.name}
            >
              <span className="text-lg leading-none select-none">{badge.icon || "🏅"}</span>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex justify-between space-x-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  {badge.icon && <span>{badge.icon}</span>}
                  {badge.name}
                </h4>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
                <div className="flex items-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    {badge.is_earned
                      ? `Earned: ${new Date(badge.earned_at!).toLocaleDateString()}`
                      : `Progress: ${badge.current_count} / ${badge.threshold}`}
                  </span>
                </div>
                {!badge.is_earned && (
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (badge.current_count / badge.threshold) * 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  );
}
