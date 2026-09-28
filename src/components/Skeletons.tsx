export function PokemonCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-md dark:bg-slate-800">
      <div className="p-4">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-200 animate-pulse dark:bg-slate-700"></div>
        <div className="mt-4 flex flex-col gap-2">
          <div className="h-6 w-3/4 rounded bg-slate-200 animate-pulse dark:bg-slate-700"></div>
          <div className="flex gap-2">
            <div className="h-6 w-16 rounded-full bg-slate-200 animate-pulse dark:bg-slate-700"></div>
            <div className="h-6 w-16 rounded-full bg-slate-200 animate-pulse dark:bg-slate-700"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 20 }).map((_, i) => (
        <PokemonCardSkeleton key={i} />
      ))}
    </div>
  )
}
