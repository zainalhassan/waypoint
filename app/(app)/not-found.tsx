import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AppNotFound() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-lg font-semibold">Page not found</h2>
      <p className="text-sm text-muted-foreground">
        This pipeline or item may have been removed.
      </p>
      <Link href="/" className={cn(buttonVariants())}>
        Back to home
      </Link>
    </div>
  );
}
