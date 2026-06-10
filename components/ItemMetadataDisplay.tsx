import { PipelineTemplate } from "@prisma/client";
import { getMetadataDisplayRows } from "@/lib/items/formatMetadata";

type ItemMetadataDisplayProps = {
  template: PipelineTemplate;
  metadata: unknown;
};

export function ItemMetadataDisplay({ template, metadata }: ItemMetadataDisplayProps) {
  const rows = getMetadataDisplayRows(template, metadata);

  if (rows.length === 0) return null;

  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label} className="space-y-0.5">
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="font-medium">
            {row.href ? (
              <a href={row.href} className="text-primary hover:underline">
                {row.value}
              </a>
            ) : (
              row.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
