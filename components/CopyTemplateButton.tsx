"use client";

import { useTransition } from "react";
import { copyMarketplaceTemplate } from "@/actions/marketplace";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

type CopyTemplateButtonProps = {
  templateId: string;
  isOwner: boolean;
};

export function CopyTemplateButton({ templateId, isOwner }: CopyTemplateButtonProps) {
  const [pending, startTransition] = useTransition();

  if (isOwner) return null;

  return (
    <Button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await copyMarketplaceTemplate(templateId);
        });
      }}
    >
      <Copy className="mr-1.5 size-4" />
      {pending ? "Copying…" : "Copy to my templates"}
    </Button>
  );
}
