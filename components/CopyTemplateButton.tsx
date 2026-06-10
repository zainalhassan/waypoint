"use client";

import { useState, useTransition } from "react";
import { copyMarketplaceTemplate } from "@/actions/marketplace";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Link2, Unlink } from "lucide-react";
import { cn } from "@/lib/utils";

type CopyTemplateButtonProps = {
  templateId: string;
  isOwner: boolean;
};

type CopyMode = "linked" | "independent";

export function CopyTemplateButton({ templateId, isOwner }: CopyTemplateButtonProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CopyMode>("linked");
  const [pending, startTransition] = useTransition();

  if (isOwner) return null;

  function handleCopy() {
    startTransition(async () => {
      await copyMarketplaceTemplate(templateId, mode === "linked");
    });
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <Copy className="mr-1.5 size-4" />
        Copy to my templates
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>How do you want to copy this?</DialogTitle>
            <DialogDescription>
              Choose whether your copy stays in sync with the original author or becomes
              your own independent version.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode("linked")}
              className={cn(
                "rounded-lg border p-4 text-left transition-colors",
                mode === "linked"
                  ? "border-primary ring-2 ring-primary/20"
                  : "hover:bg-muted/50",
              )}
            >
              <div className="flex items-center gap-2 font-medium">
                <Link2 className="size-4" />
                Keep linked
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Stays synced when the author updates the template. You can unlink later to
                edit freely.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setMode("independent")}
              className={cn(
                "rounded-lg border p-4 text-left transition-colors",
                mode === "independent"
                  ? "border-primary ring-2 ring-primary/20"
                  : "hover:bg-muted/50",
              )}
            >
              <div className="flex items-center gap-2 font-medium">
                <Unlink className="size-4" />
                Copy independently
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                A one-time snapshot you can edit right away. Won&apos;t receive future
                updates from the author.
              </p>
            </button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={pending} onClick={handleCopy}>
              {pending ? "Copying…" : mode === "linked" ? "Copy (linked)" : "Copy (independent)"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
