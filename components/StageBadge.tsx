import { RouteChip } from "@/components/transit/RouteChip";
import { cn } from "@/lib/utils";

type StageBadgeProps = {
  name: string;
  color?: string | null;
  className?: string;
};

export function StageBadge({ name, color, className }: StageBadgeProps) {
  return (
    <RouteChip
      label={name}
      color={color}
      className={cn(!color && "bg-secondary text-secondary-foreground", className)}
    />
  );
}
