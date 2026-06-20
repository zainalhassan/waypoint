import type { Item, Stage } from "@prisma/client";
import {
  computeInvestmentBreakdown,
  formatInvestmentValue,
} from "@/lib/investments/breakdown";
import { InvestmentBreakdownChart } from "@/components/InvestmentBreakdownChart";
import { SectionCard } from "@/components/transit/SectionCard";
import { StatCard } from "@/components/transit/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type InvestmentBreakdownProps = {
  items: (Item & { currentStage: Stage })[];
  defaultCurrency: string;
};

function formatGainLoss(value: number, currency: string): string {
  const formatted = formatInvestmentValue(Math.abs(value), currency);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

function formatPct(value: number | null): string {
  if (value === null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}%`;
}

export function InvestmentBreakdown({ items, defaultCurrency }: InvestmentBreakdownProps) {
  const breakdown = computeInvestmentBreakdown(items, defaultCurrency);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total invested"
          value={formatInvestmentValue(breakdown.totals.invested, breakdown.currency)}
          headerColor="var(--color-route-blue)"
        />
        <StatCard
          label="Current value"
          value={formatInvestmentValue(breakdown.totals.current, breakdown.currency)}
          headerColor="var(--color-route-teal)"
        />
        <StatCard
          label="Gain / loss"
          value={formatGainLoss(breakdown.totals.gainLoss, breakdown.currency)}
          headerColor="var(--color-route-yellow)"
        />
        <StatCard
          label="Return"
          value={formatPct(breakdown.totals.gainLossPct)}
          headerColor="var(--color-route-purple)"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Allocation by asset type" headerColor="var(--color-route-indigo)">
          <InvestmentBreakdownChart rows={breakdown.rows} currency={breakdown.currency} />
        </SectionCard>

        <SectionCard title="Holdings breakdown" headerColor="var(--color-route-pink)">
          {breakdown.rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No holdings in Bought, Holding, or Sold stages yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Invested</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">Alloc.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {breakdown.rows.map((row) => (
                  <TableRow key={row.assetType}>
                    <TableCell>
                      <span className="font-medium">{row.label}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({row.count})
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatInvestmentValue(row.invested, breakdown.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatInvestmentValue(row.current, breakdown.currency)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {row.allocationPct}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
