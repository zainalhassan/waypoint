"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, useMemo } from "react";
import {
  sanitizeSankeyForECharts,
  type SankeyData,
} from "@/lib/sankey/buildSankeyData";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type SankeyChartProps = {
  data: SankeyData;
};

class SankeyErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-80 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
          Unable to render the flow diagram. Stage history may include conflicting
          paths — try moving items forward only.
        </div>
      );
    }
    return this.props.children;
  }
}

function sankeyDataKey(data: SankeyData) {
  return data.links
    .map((l) => `${l.source}>${l.target}:${l.value}`)
    .sort()
    .join("|");
}

export function SankeyChart({ data }: SankeyChartProps) {
  const safeData = useMemo(() => sanitizeSankeyForECharts(data), [data]);
  const chartKey = useMemo(() => sankeyDataKey(safeData), [safeData]);

  const option = useMemo(
    () => ({
      tooltip: { trigger: "item", triggerOn: "mousemove" },
      series: [
        {
          type: "sankey",
          emphasis: { focus: "adjacency" },
          layoutIterations: 32,
          data: safeData.nodes,
          links: safeData.links,
          lineStyle: { color: "gradient", curveness: 0.5 },
          label: { fontSize: 12 },
        },
      ],
    }),
    [safeData],
  );

  if (safeData.links.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        Add items and move them through stages to see the flow diagram.
      </div>
    );
  }

  return (
    <SankeyErrorBoundary key={chartKey}>
      <ReactECharts
        key={chartKey}
        style={{ height: 400, width: "100%" }}
        option={option}
        notMerge
        opts={{ renderer: "canvas" }}
      />
    </SankeyErrorBoundary>
  );
}
