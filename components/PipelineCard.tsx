import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PipelineTemplate } from "@prisma/client";
import { PIPELINE_TEMPLATES } from "@/lib/pipelines/templates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PipelineCardProps = {
  id: string;
  name: string;
  template: PipelineTemplate;
  itemCount: number;
  activeCount: number;
};

export function PipelineCard({
  id,
  name,
  template,
  itemCount,
  activeCount,
}: PipelineCardProps) {
  const definition = PIPELINE_TEMPLATES[template];

  return (
    <Link href={`/pipelines/${id}`}>
      <Card className="rounded-[var(--radius-card)] border-border/80 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{name}</CardTitle>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          </div>
          <Badge variant="outline">{definition.label}</Badge>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>{itemCount} items · {activeCount} active</p>
        </CardContent>
      </Card>
    </Link>
  );
}
