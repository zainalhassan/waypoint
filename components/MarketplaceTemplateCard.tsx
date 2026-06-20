import Link from "next/link";
import { TemplateMetrics } from "@/components/TemplateMetrics";
import { HeroCard } from "@/components/transit/HeroCard";

type MarketplaceTemplateCardProps = {
  id: string;
  name: string;
  description: string | null;
  authorName: string;
  stageNames: string[];
  metrics: import("@/lib/marketplace/metrics").TemplateMetrics;
};

export function MarketplaceTemplateCard({
  id,
  name,
  description,
  authorName,
  stageNames,
  metrics,
}: MarketplaceTemplateCardProps) {
  const rating =
    metrics.averageRating !== null ? metrics.averageRating.toFixed(1) : "—";

  return (
    <Link href={`/marketplace/${id}`} className="block transition-transform active:scale-[0.99]">
      <HeroCard
        headerLabel={authorName}
        headerColor="var(--color-route-purple)"
        heroLabel="Rating"
        heroValue={rating}
        meta={[
          name,
          ...(description ? [description] : []),
          `${stageNames.length} stages · ${metrics.copyCount} copies`,
        ]}
      >
        <TemplateMetrics metrics={metrics} compact />
      </HeroCard>
    </Link>
  );
}
