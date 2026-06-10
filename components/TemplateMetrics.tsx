import { Copy, Heart, MessageCircle, Star } from "lucide-react";
import type { TemplateMetrics as Metrics } from "@/lib/marketplace/metrics";

type TemplateMetricsProps = {
  metrics: Metrics;
  compact?: boolean;
};

export function TemplateMetrics({ metrics, compact }: TemplateMetricsProps) {
  const items = [
    {
      icon: Star,
      label: metrics.averageRating !== null ? metrics.averageRating.toFixed(1) : "—",
      hint: metrics.ratingCount > 0 ? `${metrics.ratingCount} ratings` : "No ratings",
    },
    {
      icon: Heart,
      label: String(metrics.likeCount),
      hint: "Likes",
    },
    {
      icon: Copy,
      label: String(metrics.copyCount),
      hint: "Copies",
    },
    {
      icon: MessageCircle,
      label: String(metrics.commentCount),
      hint: "Comments",
    },
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {items.map(({ icon: Icon, label, hint }) => (
          <span key={hint} className="inline-flex items-center gap-1" title={hint}>
            <Icon className="size-3.5" />
            {label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ icon: Icon, label, hint }) => (
        <div key={hint} className="rounded-lg border bg-muted/20 px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className="size-3.5" />
            {hint}
          </div>
          <p className="mt-1 text-lg font-semibold">{label}</p>
        </div>
      ))}
    </div>
  );
}
