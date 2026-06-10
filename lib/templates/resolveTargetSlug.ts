import type { StageMappings } from "@/lib/templates/syncTypes";

export function resolveTargetSlug(
  removedSlug: string,
  mappings: StageMappings,
  sourceSlugs: Set<string>,
  fallbackSlug: string,
): string {
  const mapped = mappings[removedSlug];
  if (mapped && sourceSlugs.has(mapped)) return mapped;
  return fallbackSlug;
}
