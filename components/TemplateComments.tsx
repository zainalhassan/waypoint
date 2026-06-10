"use client";

import { useActionState, useTransition } from "react";
import { addTemplateComment, deleteTemplateComment, type ActionState } from "@/actions/marketplace";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  authorName: string;
};

type TemplateCommentsProps = {
  templateId: string;
  comments: Comment[];
  currentUserId: string;
};

const initialState: ActionState = {};

export function TemplateComments({
  templateId,
  comments,
  currentUserId,
}: TemplateCommentsProps) {
  const [state, formAction, pending] = useActionState(addTemplateComment, initialState);
  const [deleting, startDelete] = useTransition();

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="templateId" value={templateId} />
        <Textarea
          name="content"
          rows={3}
          placeholder="Share feedback or how you used this template…"
          required
          maxLength={1000}
        />
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Posting…" : "Post comment"}
        </Button>
      </form>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{comment.authorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {comment.createdAt.toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </p>
                </div>
                {comment.userId === currentUserId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={deleting}
                    aria-label="Delete comment"
                    onClick={() => {
                      startDelete(async () => {
                        await deleteTemplateComment(comment.id);
                      });
                    }}
                  >
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{comment.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
