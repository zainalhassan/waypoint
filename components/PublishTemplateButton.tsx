"use client";

import { useTransition } from "react";
import { publishTemplate, unpublishTemplate } from "@/actions/marketplace";
import { Button } from "@/components/ui/button";
import { Globe, GlobeLock } from "lucide-react";

type PublishTemplateButtonProps = {
  templateId: string;
  isPublic: boolean;
};

export function PublishTemplateButton({ templateId, isPublic }: PublishTemplateButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          if (isPublic) {
            await unpublishTemplate(templateId);
          } else {
            await publishTemplate(templateId);
          }
        });
      }}
    >
      {isPublic ? (
        <>
          <GlobeLock className="mr-1.5 size-4" />
          Unpublish
        </>
      ) : (
        <>
          <Globe className="mr-1.5 size-4" />
          Share to marketplace
        </>
      )}
    </Button>
  );
}
