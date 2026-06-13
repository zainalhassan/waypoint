export type TemplateMetrics = {
  likeCount: number;
  copyCount: number;
  commentCount: number;
  ratingCount: number;
  averageRating: number | null;
  pipelineCount: number;
};

export function computeAverageRating(ratingSum: number, ratingCount: number): number | null {
  if (ratingCount === 0) return null;
  return Math.round((ratingSum / ratingCount) * 10) / 10;
}

export function toTemplateMetrics(data: {
  likeCount: number;
  copyCount: number;
  commentCount: number;
  ratingSum: number;
  ratingCount: number;
  pipelineCount?: number;
}): TemplateMetrics {
  return {
    likeCount: data.likeCount,
    copyCount: data.copyCount,
    commentCount: data.commentCount,
    ratingCount: data.ratingCount,
    averageRating: computeAverageRating(data.ratingSum, data.ratingCount),
    pipelineCount: data.pipelineCount ?? 0,
  };
}
