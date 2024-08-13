// Components
import { Skeleton } from "~/components/ui/skeleton";

export default function AuctionPlaceholderGrid() {
  return (
    <div
      className="mt-6 grid auto-rows-auto grid-cols-1 gap-4 min-[500px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
        xl:grid-cols-5"
    >
      <div className="flex w-full flex-col space-y-3 rounded-2xl bg-dark-blue p-2">
        <Skeleton className="aspect-square h-auto w-full rounded-xl bg-slate-900" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full bg-slate-900" />
          <div className="flex gap-2">
            <Skeleton className="h-20 w-full flex-1 bg-slate-900" />
            <Skeleton className="h-20 w-full flex-1 bg-slate-900" />
            <Skeleton className="h-20 w-full flex-1 bg-slate-900" />
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col space-y-3 rounded-2xl bg-dark-blue p-2">
        <Skeleton className="aspect-square h-auto w-full rounded-xl bg-slate-900" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full bg-slate-900" />
          <div className="flex gap-2">
            <Skeleton className="h-20 w-full flex-1 bg-slate-900" />
            <Skeleton className="h-20 w-full flex-1 bg-slate-900" />
            <Skeleton className="h-20 w-full flex-1 bg-slate-900" />
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col space-y-3 rounded-2xl bg-dark-blue p-2">
        <Skeleton className="aspect-square h-auto w-full rounded-xl bg-slate-900" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full bg-slate-900" />
          <div className="flex gap-2">
            <Skeleton className="h-20 w-full flex-1 bg-slate-900" />
            <Skeleton className="h-20 w-full flex-1 bg-slate-900" />
            <Skeleton className="h-20 w-full flex-1 bg-slate-900" />
          </div>
        </div>
      </div>
    </div>
  );
}
