"use client";

import { useTransition } from "react";
import { deleteUserTemplate } from "@/actions/templates";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type DeleteTemplateButtonProps = {
  templateId: string;
};

export function DeleteTemplateButton({ templateId }: DeleteTemplateButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={pending}
      aria-label="Delete template"
      onClick={() => {
        if (!confirm("Delete this template? Existing pipelines are not affected.")) return;
        startTransition(async () => {
          await deleteUserTemplate(templateId);
        });
      }}
    >
      <Trash2 className="size-4 text-muted-foreground" />
    </Button>
  );
}
