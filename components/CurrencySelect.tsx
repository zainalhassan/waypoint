import { CURRENCIES } from "@/lib/currencies";
import { cn } from "@/lib/utils";

type CurrencySelectProps = {
  name: string;
  id?: string;
  defaultValue?: string;
  className?: string;
};

export function CurrencySelect({
  name,
  id,
  defaultValue = "USD",
  className,
}: CurrencySelectProps) {
  return (
    <select
      id={id ?? name}
      name={name}
      defaultValue={defaultValue}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none",
        className,
      )}
    >
      {CURRENCIES.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {currency.code} — {currency.label}
        </option>
      ))}
    </select>
  );
}
