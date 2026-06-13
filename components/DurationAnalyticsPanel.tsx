import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. time to terminal stage
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {analytics.avgTimeToTerminalDays} days
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Average time in stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.stageDurations
              .filter((s) => s.sampleCount > 0)
              .map((stage) => (
                <div
                  key={stage.stageId}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{stage.stageName}</span>
                  <span className="text-muted-foreground">
                    {stage.avgDays} days ({stage.sampleCount} items)
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {analytics.funnelDropOffs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Stage transitions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.funnelDropOffs.map((row) => (
                <div
                  key={`${row.fromStage}-${row.toStage}`}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {row.fromStage} → {row.toStage}
                  </span>
                  <span className="text-muted-foreground">{row.count} moves</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
