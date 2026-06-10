"use client";

import { useActionState } from "react";
import { rateTemplate, type ActionState } from "@/actions/marketplace";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type TemplateRatingFormProps = {
  templateId: string;
  currentRating: number | null;
  isOwner: boolean;
};

const initialState: ActionState = {};

export function TemplateRatingForm({
  templateId,
  currentRating,
  isOwner,
}: TemplateRatingFormProps) {
  const [state, formAction, pending] = useActionState(rateTemplate, initialState);

  if (isOwner) {
    return (
      <p className="text-sm text-muted-foreground">
        Ratings from other users appear here once shared.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="templateId" value={templateId} />
      <p className="text-sm font-medium">Your rating</p>
      <div className="flex flex-wrap gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <Button
            key={value}
            type="submit"
            name="rating"
            value={value}
            variant="ghost"
            size="sm"
            disabled={pending}
            className={cn(
              "px-2",
              currentRating !== null && value <= currentRating && "text-amber-500",
            )}
            aria-label={`Rate ${value} stars`}
          >
            <Star
              className={cn(
                "size-5",
                currentRating !== null && value <= currentRating && "fill-current",
              )}
            />
          </Button>
        ))}
      </div>
      {currentRating && (
        <p className="text-xs text-muted-foreground">You rated this {currentRating}/5</p>
      )}
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
