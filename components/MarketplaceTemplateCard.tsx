import Link from "next/link";
import { TemplateMetrics } from "@/components/TemplateMetrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TemplateMetrics as Metrics } from "@/lib/marketplace/metrics";

type MarketplaceTemplateCardProps = {
  id: string;
  name: string;
  description: string | null;
  authorName: string;
  stageNames: string[];
  metrics: Metrics;
};

export function MarketplaceTemplateCard({
  id,
  name,
  description,
  authorName,
  stageNames,
  metrics,
}: MarketplaceTemplateCardProps) {
  return (
    <Link href={`/marketplace/${id}`}>
      <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{name}</CardTitle>
          <CardDescription>by {authorName}</CardDescription>
          {description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">{stageNames.join(" → ")}</p>
          <TemplateMetrics metrics={metrics} compact />
        </CardContent>
      </Card>
    </Link>
  );
}
