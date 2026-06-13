"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { moveItemToStage } from "@/actions/items";
import type { Item, Stage } from "@prisma/client";
import { StageBadge } from "@/components/StageBadge";
import { cn } from "@/lib/utils";

type ItemBoardProps = {
  pipelineId: string;
  stages: Stage[];
  items: (Item & { currentStage: Stage })[];
};

export function ItemBoard({ pipelineId, stages, items }: ItemBoardProps) {
  const [pending, startTransition] = useTransition();
  const activeStages = stages.filter((s) => !s.isArchived);

  function handleDrop(itemId: string, stageId: string, currentStageId: string) {
    if (stageId === currentStageId) return;
    startTransition(async () => {
      const result = await moveItemToStage(pipelineId, itemId, stageId);
      if (result.error) toast.error(result.error);
      else toast.success("Stage updated");
    });
  }

  return (
    <div
      className={cn(
        "flex gap-4 overflow-x-auto pb-2",
        pending && "pointer-events-none opacity-70",
      )}
    >
      {activeStages.map((stage) => {
        const columnItems = items.filter((item) => item.currentStageId === stage.id);
        return (
          <div
            key={stage.id}
            className="flex w-72 shrink-0 flex-col rounded-lg border bg-muted/20"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const itemId = e.dataTransfer.getData("text/item-id");
              const fromStageId = e.dataTransfer.getData("text/from-stage-id");
              if (itemId) handleDrop(itemId, stage.id, fromStageId);
            }}
          >
            <div className="flex items-center justify-between border-b px-3 py-2">
              <StageBadge name={stage.name} color={stage.color} />
              <span className="text-xs text-muted-foreground">{columnItems.length}</span>
            </div>
            <div className="flex min-h-[120px] flex-col gap-2 p-2">
              {columnItems.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/item-id", item.id);
                    e.dataTransfer.setData("text/from-stage-id", item.currentStageId);
                  }}
                  className="cursor-grab rounded-md border bg-card p-3 shadow-sm active:cursor-grabbing"
                >
                  <Link
                    href={`/pipelines/${pipelineId}/items/${item.id}`}
                    className="font-medium hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.title}
                  </Link>
                  {item.subtitle && (
                    <p className="mt-1 text-xs text-muted-foreground">{item.subtitle}</p>
                  )}
                </div>
              ))}
              {columnItems.length === 0 && (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  Drop items here
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
