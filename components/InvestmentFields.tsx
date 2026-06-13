import { ASSET_TYPES } from "@/lib/investments/breakdown";
import { CurrencySelect } from "@/components/CurrencySelect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type InvestmentFieldsProps = {
  defaultCurrency: string;
  prefix?: string;
  assetType?: string;
  ticker?: string;
  amountInvested?: number | string;
  currentValue?: number | string;
  currency?: string;
};

export function InvestmentFields({
  defaultCurrency,
  prefix = "metadata",
  assetType,
  ticker,
  amountInvested,
  currentValue,
  currency,
}: InvestmentFieldsProps) {
  return (
    <fieldset className="space-y-4 rounded-lg border bg-muted/20 p-4">
      <legend className="px-1 text-sm font-medium">Investment details</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${prefix}.assetType`}>Asset type</Label>
          <select
            id={`${prefix}.assetType`}
            name={`${prefix}.assetType`}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            defaultValue={assetType ?? "stock"}
          >
            {ASSET_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}.ticker`}>Ticker / symbol</Label>
          <Input
            id={`${prefix}.ticker`}
            name={`${prefix}.ticker`}
            placeholder="AAPL, BTC, VTI"
            defaultValue={ticker ?? ""}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${prefix}.amountInvested`}>Amount invested</Label>
          <Input
            id={`${prefix}.amountInvested`}
            name={`${prefix}.amountInvested`}
            type="number"
            min={0}
            step={0.01}
            placeholder="10000"
            defaultValue={amountInvested ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}.currentValue`}>Current value</Label>
          <Input
            id={`${prefix}.currentValue`}
            name={`${prefix}.currentValue`}
            type="number"
            min={0}
            step={0.01}
            placeholder="12500"
            defaultValue={currentValue ?? ""}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}.currency`}>Currency</Label>
        <CurrencySelect
          id={`${prefix}.currency`}
          name={`${prefix}.currency`}
          defaultValue={currency ?? defaultCurrency}
        />
      </div>
    </fieldset>
  );
}
