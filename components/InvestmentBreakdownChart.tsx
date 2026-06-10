"use client";

import dynamic from "next/dynamic";
import type { AssetBreakdownRow } from "@/lib/investments/breakdown";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type InvestmentBreakdownChartProps = {
  rows: AssetBreakdownRow[];
  currency: string;
};

export function InvestmentBreakdownChart({ rows, currency }: InvestmentBreakdownChartProps) {
  if (rows.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        Add investments in Bought, Holding, or Sold stages to see your breakdown.
      </div>
    );
  }

  const data = rows.map((row) => ({
    name: row.label,
    value: row.current,
  }));

  return (
    <ReactECharts
      style={{ height: 360, width: "100%" }}
      option={{
        tooltip: {
          trigger: "item",
          formatter: (params: { name: string; value: number; percent: number }) =>
            `${params.name}<br/>${new Intl.NumberFormat(undefined, {
              style: "currency",
              currency,
            }).format(params.value)} (${params.percent}%)`,
        },
        legend: { bottom: 0, type: "scroll" },
        series: [
          {
            type: "pie",
            radius: ["42%", "70%"],
            avoidLabelOverlap: true,
            itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
            label: { show: false },
            emphasis: {
              label: { show: true, fontSize: 14, fontWeight: "bold" },
            },
            data,
          },
        ],
      }}
    />
  );
}
