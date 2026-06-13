import Link from "next/link";
import type { Item, PipelineTemplate, Stage } from "@prisma/client";
import {
  getDeadlineDisplay,
  getDealValueDisplay,
  getInvestmentDisplay,
  getSalaryDisplay,
} from "@/lib/items/formatMetadata";
import { StageBadge } from "@/components/StageBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ItemTableProps = {
  pipelineId: string;
  template: PipelineTemplate;
  items: (Item & { currentStage: Stage })[];
};

function getValueColumn(template: PipelineTemplate) {
  switch (template) {
    case "JOB_SEARCH":
      return { show: true, label: "Salary" };
    case "INVESTMENTS":
      return { show: true, label: "Value" };
    case "SALES":
      return { show: true, label: "Deal value" };
    case "GRAD_SCHOOL":
      return { show: true, label: "Deadline" };
    default:
      return { show: false, label: "" };
  }
}

function getItemValue(
  template: PipelineTemplate,
  metadata: unknown,
): string | null {
  switch (template) {
    case "JOB_SEARCH":
      return getSalaryDisplay(metadata);
    case "INVESTMENTS":
      return getInvestmentDisplay(metadata);
    case "SALES":
      return getDealValueDisplay(metadata);
    case "GRAD_SCHOOL":
      return getDeadlineDisplay(metadata);
    default:
      return null;
  }
}

export function ItemTable({ pipelineId, template, items }: ItemTableProps) {
  const valueColumn = getValueColumn(template);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="font-medium">No items yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first application or opportunity to start tracking progress.
        </p>
        <Link
          href={`/pipelines/${pipelineId}/items/new`}
          className={cn(buttonVariants(), "mt-4 inline-flex")}
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
          {valueColumn.show && <TableHead>{valueColumn.label}</TableHead>}
          <TableHead>Stage</TableHead>
          <TableHead>Started</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const value = getItemValue(template, item.metadata);
          return (
            <TableRow key={item.id} className="hover:bg-muted/30">
              <TableCell>
                <Link
                  href={`/pipelines/${pipelineId}/items/${item.id}`}
                  className="font-medium hover:underline"
                >
                  {item.title}
                </Link>
                {item.subtitle && (
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                )}
              </TableCell>
              {valueColumn.show && (
                <TableCell className="text-muted-foreground">
                  {value ?? "—"}
                </TableCell>
              )}
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
          );
        })}
      </TableBody>
    </Table>
  );
}
