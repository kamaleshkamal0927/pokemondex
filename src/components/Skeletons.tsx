export function PokemonCardSkeleton() {
  return (
    <div className="relative h-[340px] overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10">
      <div className="p-4">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-white/[0.02] animate-pulse"></div>
        <div className="mt-4 flex flex-col gap-2">
          <div className="h-6 w-3/4 rounded bg-white/[0.02] animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-6 w-16 rounded-full bg-white/[0.02] animate-pulse"></div>
            <div className="h-6 w-16 rounded-full bg-white/[0.02] animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
