import { TYPE_COLORS } from '@/constants/typeColors'

export function TypeBadge({ type, className = '' }: { type: string; className?: string }) {
  const color = TYPE_COLORS[type.toLowerCase()] || TYPE_COLORS.default
  
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm ${color.bg} ${color.text} border border-black/10 ${className}`}
    >
      {type}
    </span>
  )
}
