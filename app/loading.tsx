import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-neutral-50 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="pb-4 border-b border-neutral-200">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <Skeleton className="h-9 w-full sm:w-72" />
          <Skeleton className="h-9 w-60" />
        </div>
        <div className="bg-white rounded-md border border-neutral-200 p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </main>
  );
}

