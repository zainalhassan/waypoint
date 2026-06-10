import type { Stage, StageEvent } from "@prisma/client";
import { StageBadge } from "@/components/StageBadge";

type StageTimelineProps = {
  events: (StageEvent & {
    fromStage?: Stage | null;
    toStage: Stage;
  })[];
};

export function StageTimeline({ events }: StageTimelineProps) {
  const sorted = [...events].sort(
    (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime(),
  );

  if (sorted.length === 0) {
    return <p className="text-sm text-muted-foreground">No stage history yet.</p>;
  }

  return (
    <ol className="space-y-4">
      {sorted.map((event) => (
        <li key={event.id} className="flex items-start gap-3 text-sm">
          <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {event.fromStage ? (
                <>
                  <StageBadge
                    name={event.fromStage.name}
                    color={event.fromStage.color}
                  />
                  <span className="text-muted-foreground">→</span>
                </>
              ) : (
                <span className="text-muted-foreground">Started →</span>
              )}
              <StageBadge name={event.toStage.name} color={event.toStage.color} />
            </div>
            <p className="text-muted-foreground">
              {event.occurredAt.toLocaleString()}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
