import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMetadataDisplayRows } from "@/lib/items/formatMetadata";
import { prisma } from "@/lib/prisma";

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pipelineId: string }> },
) {
  const { pipelineId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pipeline = await prisma.pipeline.findFirst({
    where: { id: pipelineId, userId: session.user.id },
    include: {
      items: {
        include: { currentStage: true },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!pipeline) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const headers = [
    "Title",
    "Subtitle",
    "Stage",
    "Started",
    "Updated",
    "External URL",
    "Notes",
    "Metadata",
  ];

  const rows = pipeline.items.map((item) => {
    const metadataRows = getMetadataDisplayRows(pipeline.template, item.metadata);
    const metadata = metadataRows.map((r) => `${r.label}: ${r.value}`).join("; ");
    return [
      item.title,
      item.subtitle ?? "",
      item.currentStage.name,
      item.startedAt.toISOString().slice(0, 10),
      item.updatedAt.toISOString().slice(0, 10),
      item.externalUrl ?? "",
      item.notes ?? "",
      metadata,
    ]
      .map(escapeCsv)
      .join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const filename = `${pipeline.name.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase()}-export.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
