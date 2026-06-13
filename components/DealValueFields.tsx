import { CurrencySelect } from "@/components/CurrencySelect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DealValueFieldsProps = {
  defaultCurrency: string;
  dealValue?: number | string;
  dealCurrency?: string;
};

export function DealValueFields({
  defaultCurrency,
  dealValue,
  dealCurrency,
}: DealValueFieldsProps) {
  return (
    <fieldset className="space-y-4 rounded-lg border bg-muted/20 p-4">
      <legend className="px-1 text-sm font-medium">Deal value</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="metadata.dealValue">Amount</Label>
          <Input
            id="metadata.dealValue"
            name="metadata.dealValue"
            type="number"
            min={0}
            step={100}
            placeholder="50000"
            defaultValue={dealValue ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="metadata.dealCurrency">Currency</Label>
          <CurrencySelect
            id="metadata.dealCurrency"
            name="metadata.dealCurrency"
            defaultValue={dealCurrency ?? defaultCurrency}
          />
        </div>
      </div>
    </fieldset>
  );
}
