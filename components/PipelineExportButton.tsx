import Link from "next/link";
import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PipelineExportButtonProps = {
  pipelineId: string;
};

export function PipelineExportButton({ pipelineId }: PipelineExportButtonProps) {
  return (
    <Link
      href={`/api/pipelines/${pipelineId}/export`}
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
    >
      <Download className="size-4" />
      Export CSV
    </Link>
  );
}
