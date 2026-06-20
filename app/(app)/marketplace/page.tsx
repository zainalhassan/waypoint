import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getMarketplaceTemplates, parseMarketplaceSort } from "@/lib/marketplace/queries";
import { MarketplaceSearch } from "@/components/MarketplaceSearch";
import { MarketplaceSortTabs } from "@/components/MarketplaceSortTabs";
import { MarketplaceTemplateCard } from "@/components/MarketplaceTemplateCard";
import { EmptyState } from "@/components/transit/EmptyState";
import { PageHeader } from "@/components/transit/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; q?: string; minStages?: string }>;
}) {
  const params = await searchParams;
  const sort = parseMarketplaceSort(params.sort);
  const minStages = params.minStages ? Number(params.minStages) : undefined;
  const session = await auth();
  const templates = await getMarketplaceTemplates(sort, {
    q: params.q,
    minStages: minStages && !Number.isNaN(minStages) ? minStages : undefined,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Template marketplace"
        description="Browse community templates, copy them to your account, and share your own."
      >
        <Link href="/templates/new" className={cn(buttonVariants({ variant: "outline" }))}>
          Create & share
        </Link>
      </PageHeader>

      <Suspense fallback={null}>
        <MarketplaceSearch
          currentQ={params.q}
          currentMinStages={params.minStages}
        />
      </Suspense>

      <Suspense fallback={null}>
        <MarketplaceSortTabs current={sort} />
      </Suspense>

      {templates.length === 0 ? (
        <EmptyState
          title="No templates match your search"
          description={
            <>
              Try different keywords or{" "}
              <Link href="/marketplace" className="font-medium text-primary hover:underline">
                clear filters
              </Link>
              .
            </>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <MarketplaceTemplateCard key={template.id} {...template} />
          ))}
        </div>
      )}

      {session?.user && (
        <p className="text-sm text-muted-foreground">
          Signed in as {session.user.name ?? session.user.email}. Publish templates from{" "}
          <Link href="/templates" className="font-medium text-primary hover:underline">
            My templates
          </Link>
          .
        </p>
      )}
    </div>
  );
}
