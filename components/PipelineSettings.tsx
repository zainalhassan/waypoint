"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  archivePipeline,
  deletePipeline,
  updatePipeline,
  type ActionState,
} from "@/actions/pipelines";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PipelineSettingsProps = {
  pipelineId: string;
  name: string;
};

const initialState: ActionState = {};

export function PipelineSettings({ pipelineId, name }: PipelineSettingsProps) {
  const [open, setOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const boundUpdate = updatePipeline.bind(null, pipelineId);
  const [state, formAction, pending] = useActionState(boundUpdate, initialState);
  const [actionPending, startTransition] = useTransition();

  useEffect(() => {
    if (state.success) {
      toast.success("Pipeline renamed");
      setOpen(false);
    }
  }, [state.success]);

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Settings
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pipeline settings</DialogTitle>
            <DialogDescription>Rename, archive, or permanently delete this pipeline.</DialogDescription>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pipeline-name">Name</Label>
              <Input id="pipeline-name" name="name" defaultValue={name} required />
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <DialogFooter className="sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setArchiveOpen(true);
                  }}
                >
                  Archive
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    setOpen(false);
                    setDeleteOpen(true);
                  }}
                >
                  Delete
                </Button>
              </div>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save name"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive pipeline?</DialogTitle>
            <DialogDescription>
              &ldquo;{name}&rdquo; will be hidden from your home page. Items and history are kept.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={actionPending}
              onClick={() => {
                startTransition(async () => {
                  await archivePipeline(pipelineId);
                });
              }}
            >
              {actionPending ? "Archiving…" : "Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete pipeline?</DialogTitle>
            <DialogDescription>
              This permanently deletes &ldquo;{name}&rdquo;, all items, and stage history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={actionPending}
              onClick={() => {
                startTransition(async () => {
                  await deletePipeline(pipelineId);
                });
              }}
            >
              {actionPending ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
