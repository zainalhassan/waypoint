import { Copy, Heart, LayoutGrid, MessageCircle, Star } from "lucide-react";
import type { TemplateMetrics as Metrics } from "@/lib/marketplace/metrics";
import { StatCard } from "@/components/transit/StatCard";

type TemplateMetricsProps = {
  metrics: Metrics;
  compact?: boolean;
};

const STAT_COLORS = [
  "var(--color-route-yellow)",
  "var(--color-route-pink)",
  "var(--color-route-blue)",
  "var(--color-route-teal)",
  "var(--color-route-indigo)",
];

export function TemplateMetrics({ metrics, compact }: TemplateMetricsProps) {
  const items = [
    {
      label: "Rating",
      value: metrics.averageRating !== null ? metrics.averageRating.toFixed(1) : "—",
      icon: Star,
      hint: metrics.ratingCount > 0 ? `${metrics.ratingCount} ratings` : "No ratings",
    },
    {
      label: "Likes",
      value: String(metrics.likeCount),
      icon: Heart,
      hint: "Likes",
    },
    {
      label: "Copies",
      value: String(metrics.copyCount),
      icon: Copy,
      hint: "Copies",
    },
    {
      label: "Pipelines",
      value: String(metrics.pipelineCount),
      icon: LayoutGrid,
      hint: "Pipelines using",
    },
    {
      label: "Comments",
      value: String(metrics.commentCount),
      icon: MessageCircle,
      hint: "Comments",
    },
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {items.map(({ icon: Icon, value, hint }) => (
          <span key={hint} className="inline-flex items-center gap-1" title={hint}>
            <Icon className="size-3.5" />
            {value}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map(({ label, value, hint }, index) => (
        <StatCard
          key={hint}
          label={label}
          value={value}
          headerColor={STAT_COLORS[index % STAT_COLORS.length]}
        />
      ))}
    </div>
  );
}
