"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateUserSettings, type SettingsActionState } from "@/actions/settings";
import { CurrencySelect } from "@/components/CurrencySelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SettingsFormProps = {
  name: string;
  email: string;
  defaultCurrency: string;
};

const initialState: SettingsActionState = {};

export function SettingsForm({ name, email, defaultCurrency }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState(updateUserSettings, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Settings saved");
    }
  }, [state.success]);

  return (
    <form action={formAction} className="max-w-md space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Display name</Label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="defaultCurrency">Default currency</Label>
        <CurrencySelect
          id="defaultCurrency"
          name="defaultCurrency"
          defaultValue={defaultCurrency}
        />
        <p className="text-xs text-muted-foreground">
          Used when adding salary or deal values on new items. You can override per item.
        </p>
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
