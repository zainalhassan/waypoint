import Link from "next/link";
import type { Item, PipelineTemplate, Stage } from "@prisma/client";
import { getInvestmentDisplay, getSalaryDisplay } from "@/lib/items/formatMetadata";
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

export function ItemTable({ pipelineId, template, items }: ItemTableProps) {
  const showSalary = template === "JOB_SEARCH";
  const showValue = template === "INVESTMENTS";
  const valueLabel = showValue ? "Value" : "Salary";

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
          {(showSalary || showValue) && <TableHead>{valueLabel}</TableHead>}
          <TableHead>Stage</TableHead>
          <TableHead>Started</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const value = showSalary
            ? getSalaryDisplay(item.metadata)
            : showValue
              ? getInvestmentDisplay(item.metadata)
              : null;
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
              {(showSalary || showValue) && (
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
