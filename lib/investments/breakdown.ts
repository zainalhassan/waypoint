import type { Item, Stage } from "@prisma/client";
import { formatMoney } from "@/lib/currencies";

export const ASSET_TYPES = [
  { value: "stock", label: "Stock" },
  { value: "etf", label: "ETF" },
  { value: "crypto", label: "Crypto" },
  { value: "fund", label: "Fund" },
  { value: "property", label: "Property" },
  { value: "other", label: "Other" },
] as const;

export type AssetType = (typeof ASSET_TYPES)[number]["value"];

export type InvestmentMetadata = {
  assetType?: AssetType;
  ticker?: string;
  amountInvested?: number;
  currentValue?: number;
  currency?: string;
};

type ItemWithStage = Item & { currentStage: Stage };

export type AssetBreakdownRow = {
  assetType: string;
  label: string;
  count: number;
  invested: number;
  current: number;
  gainLoss: number;
  gainLossPct: number | null;
  allocationPct: number;
};

export type InvestmentBreakdown = {
  rows: AssetBreakdownRow[];
  totals: {
    count: number;
    invested: number;
    current: number;
    gainLoss: number;
    gainLossPct: number | null;
  };
  currency: string;
};

const COUNTED_SLUGS = new Set(["bought", "holding", "sold"]);

function parseMetadata(metadata: unknown): InvestmentMetadata {
  if (!metadata || typeof metadata !== "object") return {};
  return metadata as InvestmentMetadata;
}

function assetLabel(assetType?: string): string {
  return ASSET_TYPES.find((t) => t.value === assetType)?.label ?? "Other";
}

export function computeInvestmentBreakdown(
  items: ItemWithStage[],
  defaultCurrency = "USD",
): InvestmentBreakdown {
  const counted = items.filter((item) => COUNTED_SLUGS.has(item.currentStage.slug));

  const byType = new Map<string, { count: number; invested: number; current: number }>();

  for (const item of counted) {
    const meta = parseMetadata(item.metadata);
    const type = meta.assetType ?? "other";
    const invested = meta.amountInvested ?? 0;
    const current = meta.currentValue ?? invested;

    const existing = byType.get(type) ?? { count: 0, invested: 0, current: 0 };
    existing.count += 1;
    existing.invested += invested;
    existing.current += current;
    byType.set(type, existing);
  }

  const totals = { count: 0, invested: 0, current: 0, gainLoss: 0, gainLossPct: null as number | null };
  for (const row of byType.values()) {
    totals.count += row.count;
    totals.invested += row.invested;
    totals.current += row.current;
  }
  totals.gainLoss = totals.current - totals.invested;
  totals.gainLossPct =
    totals.invested > 0 ? Math.round((totals.gainLoss / totals.invested) * 1000) / 10 : null;

  const rows: AssetBreakdownRow[] = Array.from(byType.entries())
    .map(([assetType, data]) => {
      const gainLoss = data.current - data.invested;
      return {
        assetType,
        label: assetLabel(assetType),
        count: data.count,
        invested: data.invested,
        current: data.current,
        gainLoss,
        gainLossPct:
          data.invested > 0 ? Math.round((gainLoss / data.invested) * 1000) / 10 : null,
        allocationPct:
          totals.current > 0 ? Math.round((data.current / totals.current) * 1000) / 10 : 0,
      };
    })
    .sort((a, b) => b.current - a.current);

  const currency =
    counted
      .map((item) => parseMetadata(item.metadata).currency)
      .find((c) => c) ?? defaultCurrency;

  return { rows, totals, currency };
}

export function formatInvestmentValue(amount: number, currency: string): string {
  return formatMoney(amount, currency);
}
