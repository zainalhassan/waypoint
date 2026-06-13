import { prisma } from "@/lib/prisma";
import { toTemplateMetrics } from "@/lib/marketplace/metrics";

export type MarketplaceSort = "popular" | "rated" | "liked" | "newest";

const SORT_OPTIONS: MarketplaceSort[] = ["popular", "rated", "liked", "newest"];

export function parseMarketplaceSort(value: string | undefined): MarketplaceSort {
  if (value && SORT_OPTIONS.includes(value as MarketplaceSort)) {
    return value as MarketplaceSort;
  }
  return "popular";
}

function orderByForSort(sort: MarketplaceSort) {
  switch (sort) {
    case "rated":
      return [{ ratingCount: "desc" as const }, { ratingSum: "desc" as const }];
    case "liked":
      return [{ likeCount: "desc" as const }, { publishedAt: "desc" as const }];
    case "newest":
      return [{ publishedAt: "desc" as const }];
    case "popular":
    default:
      return [{ copyCount: "desc" as const }, { likeCount: "desc" as const }];
  }
}

export type MarketplaceFilters = {
  q?: string;
  minStages?: number;
};

function matchesSearch(
  template: {
    name: string;
    description: string | null;
    stages: { name: string }[];
  },
  q: string,
) {
  const query = q.toLowerCase();
  const haystack = [
    template.name,
    template.description ?? "",
    ...template.stages.map((s) => s.name),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export async function getMarketplaceTemplates(
  sort: MarketplaceSort,
  filters: MarketplaceFilters = {},
) {
  const templates = await prisma.userTemplate.findMany({
    where: { isPublic: true },
    include: {
      user: { select: { id: true, name: true } },
      stages: { orderBy: { sortOrder: "asc" } },
      _count: { select: { pipelines: true } },
    },
    orderBy: orderByForSort(sort),
    take: 100,
  });

  let filtered = templates;

  if (filters.q) {
    filtered = filtered.filter((t) => matchesSearch(t, filters.q!));
  }

  if (filters.minStages && filters.minStages > 0) {
    filtered = filtered.filter((t) => t.stages.length >= filters.minStages!);
  }

  return filtered.slice(0, 50).map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    authorName: template.user.name ?? "Anonymous",
    authorId: template.user.id,
    stageNames: template.stages.map((s) => s.name),
    stageCount: template.stages.length,
    publishedAt: template.publishedAt,
    metrics: toTemplateMetrics({
      likeCount: template.likeCount,
      copyCount: template.copyCount,
      commentCount: template.commentCount,
      ratingSum: template.ratingSum,
      ratingCount: template.ratingCount,
      pipelineCount: template._count.pipelines,
    }),
  }));
}

export async function getPublicTemplate(templateId: string, viewerId?: string) {
  const template = await prisma.userTemplate.findFirst({
    where: { id: templateId, isPublic: true },
    include: {
      user: { select: { id: true, name: true } },
      stages: { orderBy: { sortOrder: "asc" } },
      _count: { select: { pipelines: true } },
      comments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!template) return null;

  let viewerLiked = false;
  let viewerRating: number | null = null;

  if (viewerId) {
    const [like, rating] = await Promise.all([
      prisma.templateLike.findUnique({
        where: {
          userId_userTemplateId: { userId: viewerId, userTemplateId: templateId },
        },
      }),
      prisma.templateRating.findUnique({
        where: {
          userId_userTemplateId: { userId: viewerId, userTemplateId: templateId },
        },
      }),
    ]);
    viewerLiked = !!like;
    viewerRating = rating?.rating ?? null;
  }

  return {
    id: template.id,
    name: template.name,
    description: template.description,
    authorName: template.user.name ?? "Anonymous",
    authorId: template.user.id,
    isOwner: viewerId === template.userId,
    stages: template.stages,
    publishedAt: template.publishedAt,
    metrics: toTemplateMetrics({
      likeCount: template.likeCount,
      copyCount: template.copyCount,
      commentCount: template.commentCount,
      ratingSum: template.ratingSum,
      ratingCount: template.ratingCount,
      pipelineCount: template._count.pipelines,
    }),
    viewerLiked,
    viewerRating,
    comments: template.comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      userId: c.userId,
      authorName: c.user.name ?? "Anonymous",
    })),
  };
}
