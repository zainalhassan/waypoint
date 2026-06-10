"use client";

import Link from "next/link";
import { useTransition } from "react";
import { syncLinkedTemplate, unlinkTemplate } from "@/actions/templates";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, Link2, RefreshCw, Unlink } from "lucide-react";

type TemplateLinkActionsProps = {
  templateId: string;
  isLinkedToSource: boolean;
  forkedFromId: string | null;
  pendingSourceSync?: boolean;
  sourceName?: string | null;
};

export function TemplateLinkActions({
  templateId,
  isLinkedToSource,
  forkedFromId,
  pendingSourceSync = false,
  sourceName,
}: TemplateLinkActionsProps) {
  const [pending, startTransition] = useTransition();

  if (!forkedFromId) {
    return (
      <Link
        href={`/templates/${templateId}/edit`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        Edit
      </Link>
    );
  }

  if (isLinkedToSource) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Link2 className="size-3.5" />
          Linked{sourceName ? ` to ${sourceName}` : ""}
        </span>
        {pendingSourceSync ? (
          <Link
            href={`/templates/${templateId}/sync`}
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "gap-1.5",
            )}
          >
            <AlertTriangle className="size-3.5" />
            Review sync
          </Link>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                await syncLinkedTemplate(templateId);
              });
            }}
          >
            <RefreshCw className="mr-1 size-3.5" />
            Sync now
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => {
            if (
              !confirm(
                "Unlink this template? You can edit it freely but won't get updates from the source.",
              )
            ) {
              return;
            }
            startTransition(async () => {
              await unlinkTemplate(templateId);
            });
          }}
        >
          <Unlink className="mr-1 size-3.5" />
          Unlink
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/templates/${templateId}/edit`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        Edit
      </Link>
      {forkedFromId && (
        <Link
          href={`/marketplace/${forkedFromId}`}
          className="text-sm text-primary hover:underline"
        >
          View source
        </Link>
      )}
    </div>
  );
}
