import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PipelineTemplate } from "@prisma/client";
import { PIPELINE_TEMPLATES } from "@/lib/pipelines/templates";
import { HeroCard } from "@/components/transit/HeroCard";

type PipelineCardProps = {
  id: string;
  name: string;
  template: PipelineTemplate;
  itemCount: number;
  activeCount: number;
};

const TEMPLATE_HEADER_COLORS: Partial<Record<PipelineTemplate, string>> = {
  JOB_SEARCH: "var(--color-route-blue)",
  GRAD_SCHOOL: "var(--color-route-purple)",
  SALES: "var(--color-route-orange)",
  INVESTMENTS: "var(--color-route-teal)",
  CUSTOM: "var(--color-route-gray)",
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
    <Link href={`/pipelines/${id}`} className="block transition-transform active:scale-[0.99]">
      <HeroCard
        headerLabel={definition.label}
        headerColor={TEMPLATE_HEADER_COLORS[template]}
        heroLabel="Active"
        heroValue={String(activeCount)}
        meta={[`${itemCount} total items`, name]}
      >
        <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Open pipeline
          <ArrowRight className="size-4" />
        </span>
      </HeroCard>
    </Link>
  );
}
