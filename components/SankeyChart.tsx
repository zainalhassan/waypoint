"use client";

import dynamic from "next/dynamic";
import type { SankeyData } from "@/lib/sankey/buildSankeyData";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type SankeyChartProps = {
  data: SankeyData;
};

export function SankeyChart({ data }: SankeyChartProps) {
  if (data.links.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        Add items and move them through stages to see the flow diagram.
      </div>
    );
  }

  return (
    <ReactECharts
      style={{ height: 400, width: "100%" }}
      option={{
        tooltip: { trigger: "item", triggerOn: "mousemove" },
        series: [
          {
            type: "sankey",
            emphasis: { focus: "adjacency" },
            data: data.nodes,
            links: data.links,
            lineStyle: { color: "gradient", curveness: 0.5 },
            label: { fontSize: 12 },
          },
        ],
      }}
    />
  );
}
