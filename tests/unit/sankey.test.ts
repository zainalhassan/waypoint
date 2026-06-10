import { describe, expect, it } from "vitest";
import { buildSankeyData } from "@/lib/sankey/buildSankeyData";
import { stage } from "../helpers/factories";

describe("buildSankeyData", () => {
  const applied = stage({ id: "s1", name: "Applied", slug: "applied", isEntry: true });
  const interview = stage({ id: "s2", name: "Interview", slug: "interview" });

  it("builds nodes and links from stage events", () => {
    const data = buildSankeyData([applied, interview], [
      {
        id: "e1",
        itemId: "i1",
        fromStageId: null,
        toStageId: applied.id,
        occurredAt: new Date(),
        toStage: applied,
        fromStage: null,
      },
      {
        id: "e2",
        itemId: "i1",
        fromStageId: applied.id,
        toStageId: interview.id,
        occurredAt: new Date(),
        fromStage: applied,
        toStage: interview,
      },
    ]);

    expect(data.nodes.some((n) => n.name === "Started")).toBe(true);
    expect(data.nodes.some((n) => n.name === "Applied")).toBe(true);
    expect(data.links).toContainEqual({ source: "Started", target: "Applied", value: 1 });
    expect(data.links).toContainEqual({ source: "Applied", target: "Interview", value: 1 });
  });

  it("handles stage names containing arrow-like characters", () => {
    const weird = stage({ id: "s3", name: "Go → Live", slug: "go-live" });
    const data = buildSankeyData([applied, weird], [
      {
        id: "e3",
        itemId: "i2",
        fromStageId: applied.id,
        toStageId: weird.id,
        occurredAt: new Date(),
        fromStage: applied,
        toStage: weird,
      },
    ]);

    expect(data.links).toContainEqual({ source: "Applied", target: "Go → Live", value: 1 });
  });
});
