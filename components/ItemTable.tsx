import Link from "next/link";
import type { Item, Stage } from "@prisma/client";
import { StageBadge } from "@/components/StageBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ItemTableProps = {
  pipelineId: string;
  items: (Item & { currentStage: Stage })[];
};

export function ItemTable({ pipelineId, items }: ItemTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <p>No items yet.</p>
        <Link
          href={`/pipelines/${pipelineId}/items/new`}
          className="mt-2 inline-block text-sm text-primary hover:underline"
        >
          Add your first item
        </Link>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Subtitle</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Started</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <Link
                href={`/pipelines/${pipelineId}/items/${item.id}`}
                className="font-medium hover:underline"
              >
                {item.title}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {item.subtitle ?? "—"}
            </TableCell>
            <TableCell>
              <StageBadge
                name={item.currentStage.name}
                color={item.currentStage.color}
              />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {item.startedAt.toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
