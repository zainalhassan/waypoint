import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StageBadgeProps = {
  name: string;
  color?: string | null;
  className?: string;
};

export function StageBadge({ name, color, className }: StageBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("font-medium", className)}
      style={
        color
          ? {
              backgroundColor: `${color}20`,
              color,
              borderColor: `${color}40`,
            }
          : undefined
      }
    >
      {name}
    </Badge>
  );
}
