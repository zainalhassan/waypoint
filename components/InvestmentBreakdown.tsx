import type { Item, Stage } from "@prisma/client";
import {
  computeInvestmentBreakdown,
  formatInvestmentValue,
} from "@/lib/investments/breakdown";
import { InvestmentBreakdownChart } from "@/components/InvestmentBreakdownChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total invested
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatInvestmentValue(breakdown.totals.invested, breakdown.currency)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current value
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatInvestmentValue(breakdown.totals.current, breakdown.currency)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gain / loss
            </CardTitle>
          </CardHeader>
          <CardContent
            className={`text-2xl font-semibold ${
              breakdown.totals.gainLoss > 0
                ? "text-green-600"
                : breakdown.totals.gainLoss < 0
                  ? "text-destructive"
                  : ""
            }`}
          >
            {formatGainLoss(breakdown.totals.gainLoss, breakdown.currency)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Return
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatPct(breakdown.totals.gainLossPct)}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Allocation by asset type</CardTitle>
          </CardHeader>
          <CardContent>
            <InvestmentBreakdownChart rows={breakdown.rows} currency={breakdown.currency} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Holdings breakdown</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
