import { CurrencySelect } from "@/components/CurrencySelect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SalaryFieldsProps = {
  defaultCurrency: string;
  prefix?: string;
  minLabel?: string;
  maxLabel?: string;
  currencyName?: string;
  salaryMin?: number | string;
  salaryMax?: number | string;
  salaryCurrency?: string;
};

export function SalaryFields({
  defaultCurrency,
  prefix = "metadata",
  minLabel = "Salary from",
  maxLabel = "Salary to",
  currencyName = "salaryCurrency",
  salaryMin,
  salaryMax,
  salaryCurrency,
}: SalaryFieldsProps) {
  return (
    <fieldset className="space-y-4 rounded-lg border bg-muted/20 p-4">
      <legend className="px-1 text-sm font-medium">Compensation</legend>
      <p className="text-xs text-muted-foreground">
        Optional — leave blank if unknown. Uses your default currency unless you change it.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${prefix}.salaryMin`}>{minLabel}</Label>
          <Input
            id={`${prefix}.salaryMin`}
            name={`${prefix}.salaryMin`}
            type="number"
            min={0}
            step={1000}
            placeholder="120000"
            defaultValue={salaryMin ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}.salaryMax`}>{maxLabel}</Label>
          <Input
            id={`${prefix}.salaryMax`}
            name={`${prefix}.salaryMax`}
            type="number"
            min={0}
            step={1000}
            placeholder="150000"
            defaultValue={salaryMax ?? ""}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}.${currencyName}`}>Currency</Label>
        <CurrencySelect
          id={`${prefix}.${currencyName}`}
          name={`${prefix}.${currencyName}`}
          defaultValue={salaryCurrency ?? defaultCurrency}
        />
      </div>
    </fieldset>
  );
}
