"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteItem } from "@/actions/items";
import type { Item, PipelineTemplate } from "@prisma/client";
import { ItemForm } from "@/components/ItemForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ItemActionsProps = {
  pipelineId: string;
  template: PipelineTemplate;
  defaultCurrency: string;
  item: Item;
};

export function ItemActions({
  pipelineId,
  template,
  defaultCurrency,
  item,
}: ItemActionsProps) {
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditing((v) => !v)}
        >
          <Pencil className="size-4" />
          {editing ? "Cancel edit" : "Edit"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>

      {editing && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Edit item</h2>
          <ItemForm
            pipelineId={pipelineId}
            template={template}
            defaultCurrency={defaultCurrency}
            mode="edit"
            itemId={item.id}
            initial={item}
            onEditSuccess={() => setEditing(false)}
          />
        </div>
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete item?</DialogTitle>
            <DialogDescription>
              This removes &ldquo;{item.title}&rdquo; and its full stage timeline. This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  const result = await deleteItem(pipelineId, item.id);
                  if (result.error) {
                    toast.error(result.error);
                  }
                });
              }}
            >
              {pending ? "Deleting…" : "Delete item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
