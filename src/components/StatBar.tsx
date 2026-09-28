interface StatBarProps {
  name: string
  value: number
}

export function StatBar({ name, value }: StatBarProps) {
  let gradientClass = 'from-red-500 to-rose-400'
  if (value >= 50 && value < 90) gradientClass = 'from-amber-500 to-yellow-400'
  else if (value >= 90 && value < 120) gradientClass = 'from-emerald-500 to-green-400'
  else if (value >= 120) gradientClass = 'from-cyan-400 to-indigo-500'

  const formattedName = name.replace('-', ' ')

  return (
    <div className="flex items-center gap-4">
      <span className="w-32 text-sm font-medium capitalize text-slate-600 dark:text-slate-400">
        {formattedName}
      </span>
      <div className="flex-1">
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 shadow-inner">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-1000 ease-out`}
            style={{
              width: `${Math.min((value / 255) * 100, 100)}%`,
            }}
          />
        </div>
      </div>
      <span className="w-10 text-right text-sm font-bold text-slate-900 dark:text-white">
        {value}
      </span>
    </div>
  )
}
