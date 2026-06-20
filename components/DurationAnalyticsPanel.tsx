import { SectionCard } from "@/components/transit/SectionCard";
import { StatCard } from "@/components/transit/StatCard";
import type { DurationAnalytics } from "@/lib/analytics/durations";

type DurationAnalyticsPanelProps = {
  analytics: DurationAnalytics;
};

export function DurationAnalyticsPanel({ analytics }: DurationAnalyticsPanelProps) {
  const hasData =
    analytics.stageDurations.some((s) => s.sampleCount > 0) ||
    analytics.funnelDropOffs.length > 0;

  if (!hasData) return null;

  return (
    <div className="space-y-4">
      {analytics.avgTimeToTerminalDays !== null && (
        <StatCard
          label="Avg. time to terminal"
          value={`${analytics.avgTimeToTerminalDays}d`}
          headerColor="var(--color-route-teal)"
        />
      )}

      <SectionCard
        title="Average time in stage"
        headerColor="var(--color-route-indigo)"
      >
        <div className="space-y-2">
          {analytics.stageDurations
            .filter((s) => s.sampleCount > 0)
            .map((stage) => (
              <div
                key={stage.stageId}
                className="flex items-center justify-between rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm"
              >
                <span className="font-medium">{stage.stageName}</span>
                <span className="text-muted-foreground">
                  {stage.avgDays} days ({stage.sampleCount} items)
                </span>
              </div>
            ))}
        </div>
      </SectionCard>

      {analytics.funnelDropOffs.length > 0 && (
        <SectionCard title="Stage transitions" headerColor="var(--color-route-purple)">
          <div className="space-y-2">
            {analytics.funnelDropOffs.map((row) => (
              <div
                key={`${row.fromStage}-${row.toStage}`}
                className="flex items-center justify-between rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm"
              >
                <span>
                  {row.fromStage} → {row.toStage}
                </span>
                <span className="text-muted-foreground">{row.count} moves</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
