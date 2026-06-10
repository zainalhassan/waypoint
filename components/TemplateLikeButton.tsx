"use client";

import { useTransition } from "react";
import { toggleTemplateLike } from "@/actions/marketplace";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type TemplateLikeButtonProps = {
  templateId: string;
  liked: boolean;
  likeCount: number;
  isOwner: boolean;
};

export function TemplateLikeButton({
  templateId,
  liked,
  likeCount,
  isOwner,
}: TemplateLikeButtonProps) {
  const [pending, startTransition] = useTransition();

  if (isOwner) {
    return (
      <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <Heart className="size-4" />
        {likeCount}
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await toggleTemplateLike(templateId);
        });
      }}
      className={cn(liked && "border-red-300 text-red-600")}
    >
      <Heart className={cn("mr-1.5 size-4", liked && "fill-current")} />
      {liked ? "Liked" : "Like"} · {likeCount}
    </Button>
  );
}
