export interface TypeColorConfig {
  neon: string;        // vivid neon hex for glow/shadow
  glow: string;        // CSS drop-shadow value
  border: string;      // border color class
  bg: string;          // card bg gradient
  badge: string;       // badge class
  badgeText: string;
  cardGradient: string;
  textGradient: string;
  hoverGlow: string;
  rgb: string;         // raw rgb for inline styles
  // Backward compatibility fields
  text: string;
  hoverShadow: string;
  gradient: string;
}

export const TYPE_COLORS: Record<string, TypeColorConfig> = {
  fire: {
    neon: '#FF4500', glow: '0 0 40px rgba(255,69,0,0.7)', border: 'border-orange-500',
    bg: 'from-orange-950 via-red-900 to-zinc-950', badge: 'bg-orange-500/20 border border-orange-500/40',
    badgeText: 'text-orange-300', cardGradient: 'from-orange-500/20 to-red-500/5',
    textGradient: 'from-orange-400 to-red-400', hoverGlow: 'hover:shadow-[0_0_40px_rgba(255,69,0,0.5)]',
    rgb: '255,69,0',
    text: 'text-orange-300', hoverShadow: 'hover:shadow-[0_0_40px_rgba(255,69,0,0.5)]', gradient: 'from-orange-500/20 to-red-500/5',
  },
  water: {
    neon: '#00BFFF', glow: '0 0 40px rgba(0,191,255,0.7)', border: 'border-cyan-500',
    bg: 'from-cyan-950 via-blue-900 to-zinc-950', badge: 'bg-cyan-500/20 border border-cyan-500/40',
    badgeText: 'text-cyan-300', cardGradient: 'from-cyan-500/20 to-blue-500/5',
    textGradient: 'from-cyan-400 to-blue-400', hoverGlow: 'hover:shadow-[0_0_40px_rgba(0,191,255,0.5)]',
    rgb: '0,191,255',
    text: 'text-cyan-300', hoverShadow: 'hover:shadow-[0_0_40px_rgba(0,191,255,0.5)]', gradient: 'from-cyan-500/20 to-blue-500/5',
  },
  grass: {
    neon: '#39FF14', glow: '0 0 40px rgba(57,255,20,0.6)', border: 'border-emerald-500',
    bg: 'from-emerald-950 via-green-900 to-zinc-950', badge: 'bg-emerald-500/20 border border-emerald-500/40',
    badgeText: 'text-emerald-300', cardGradient: 'from-emerald-500/20 to-green-500/5',
    textGradient: 'from-emerald-400 to-green-400', hoverGlow: 'hover:shadow-[0_0_40px_rgba(57,255,20,0.4)]',
    rgb: '57,255,20',
    text: 'text-emerald-300', hoverShadow: 'hover:shadow-[0_0_40px_rgba(57,255,20,0.4)]', gradient: 'from-emerald-500/20 to-green-500/5',
  },
  electric: {
    neon: '#FFD700', glow: '0 0 40px rgba(255,215,0,0.8)', border: 'border-yellow-400',
    bg: 'from-yellow-950 via-amber-900 to-zinc-950', badge: 'bg-yellow-400/20 border border-yellow-400/40',
    badgeText: 'text-yellow-300', cardGradient: 'from-yellow-400/20 to-amber-400/5',
    textGradient: 'from-yellow-300 to-amber-300', hoverGlow: 'hover:shadow-[0_0_40px_rgba(255,215,0,0.6)]',
    rgb: '255,215,0',
    text: 'text-yellow-300', hoverShadow: 'hover:shadow-[0_0_40px_rgba(255,215,0,0.6)]', gradient: 'from-yellow-400/20 to-amber-400/5',
  },
  psychic: {
    neon: '#FF69B4', glow: '0 0 40px rgba(255,105,180,0.7)', border: 'border-pink-500',
    bg: 'from-pink-950 via-rose-900 to-zinc-950', badge: 'bg-pink-500/20 border border-pink-500/40',
    badgeText: 'text-pink-300', cardGradient: 'from-pink-500/20 to-rose-500/5',
    textGradient: 'from-pink-400 to-rose-400', hoverGlow: 'hover:shadow-[0_0_40px_rgba(255,105,180,0.5)]',
    rgb: '255,105,180',
    text: 'text-pink-300', hoverShadow: 'hover:shadow-[0_0_40px_rgba(255,105,180,0.5)]', gradient: 'from-pink-500/20 to-rose-500/5',
  },
  dragon: {
    neon: '#7B68EE', glow: '0 0 40px rgba(123,104,238,0.7)', border: 'border-indigo-500',
    bg: 'from-indigo-950 via-violet-900 to-zinc-950', badge: 'bg-indigo-500/20 border border-indigo-500/40',
    badgeText: 'text-indigo-300', cardGradient: 'from-indigo-500/20 to-violet-500/5',
    textGradient: 'from-indigo-400 to-violet-400', hoverGlow: 'hover:shadow-[0_0_40px_rgba(123,104,238,0.5)]',
    rgb: '123,104,238',
    text: 'text-indigo-300', hoverShadow: 'hover:shadow-[0_0_40px_rgba(123,104,238,0.5)]', gradient: 'from-indigo-500/20 to-violet-500/5',
  },
  ghost: {
    neon: '#9400D3', glow: '0 0 40px rgba(148,0,211,0.7)', border: 'border-purple-600',
    bg: 'from-purple-950 via-violet-900 to-zinc-950', badge: 'bg-purple-600/20 border border-purple-600/40',
    badgeText: 'text-purple-300', cardGradient: 'from-purple-600/20 to-violet-600/5',
    textGradient: 'from-purple-400 to-violet-400', hoverGlow: 'hover:shadow-[0_0_40px_rgba(148,0,211,0.5)]',
    rgb: '148,0,211',
    text: 'text-purple-300', hoverShadow: 'hover:shadow-[0_0_40px_rgba(148,0,211,0.5)]', gradient: 'from-purple-600/20 to-violet-600/5',
  },
  dark: {
    neon: '#666680', glow: '0 0 40px rgba(100,100,130,0.6)', border: 'border-slate-500',
    bg: 'from-slate-900 via-gray-900 to-zinc-950', badge: 'bg-slate-500/20 border border-slate-500/40',
    badgeText: 'text-slate-300', cardGradient: 'from-slate-500/10 to-gray-500/5',
    textGradient: 'from-slate-300 to-gray-400', hoverGlow: 'hover:shadow-[0_0_30px_rgba(100,100,130,0.4)]',
    rgb: '100,100,130',
    text: 'text-slate-300', hoverShadow: 'hover:shadow-[0_0_30px_rgba(100,100,130,0.4)]', gradient: 'from-slate-500/10 to-gray-500/5',
  },
  steel: {
    neon: '#B0C4DE', glow: '0 0 40px rgba(176,196,222,0.6)', border: 'border-slate-400',
    bg: 'from-slate-800 via-gray-800 to-zinc-950', badge: 'bg-slate-400/20 border border-slate-400/40',
    badgeText: 'text-slate-200', cardGradient: 'from-slate-400/15 to-gray-400/5',
    textGradient: 'from-slate-200 to-gray-300', hoverGlow: 'hover:shadow-[0_0_30px_rgba(176,196,222,0.4)]',
    rgb: '176,196,222',
    text: 'text-slate-200', hoverShadow: 'hover:shadow-[0_0_30px_rgba(176,196,222,0.4)]', gradient: 'from-slate-400/15 to-gray-400/5',
  },
  ice: {
    neon: '#00F5FF', glow: '0 0 40px rgba(0,245,255,0.7)', border: 'border-cyan-300',
    bg: 'from-cyan-900 via-sky-900 to-zinc-950', badge: 'bg-cyan-300/20 border border-cyan-300/40',
    badgeText: 'text-cyan-200', cardGradient: 'from-cyan-300/20 to-sky-300/5',
    textGradient: 'from-cyan-200 to-sky-300', hoverGlow: 'hover:shadow-[0_0_40px_rgba(0,245,255,0.5)]',
    rgb: '0,245,255',
    text: 'text-cyan-200', hoverShadow: 'hover:shadow-[0_0_40px_rgba(0,245,255,0.5)]', gradient: 'from-cyan-300/20 to-sky-300/5',
  },
  fighting: {
    neon: '#FF3030', glow: '0 0 40px rgba(255,48,48,0.7)', border: 'border-red-600',
    bg: 'from-red-950 via-rose-900 to-zinc-950', badge: 'bg-red-600/20 border border-red-600/40',
    badgeText: 'text-red-300', cardGradient: 'from-red-600/20 to-rose-600/5',
    textGradient: 'from-red-400 to-rose-400', hoverGlow: 'hover:shadow-[0_0_40px_rgba(255,48,48,0.5)]',
    rgb: '255,48,48',
    text: 'text-red-300', hoverShadow: 'hover:shadow-[0_0_40px_rgba(255,48,48,0.5)]', gradient: 'from-red-600/20 to-rose-600/5',
  },
  poison: {
    neon: '#BF00FF', glow: '0 0 40px rgba(191,0,255,0.7)', border: 'border-fuchsia-500',
    bg: 'from-fuchsia-950 via-purple-900 to-zinc-950', badge: 'bg-fuchsia-500/20 border border-fuchsia-500/40',
    badgeText: 'text-fuchsia-300', cardGradient: 'from-fuchsia-500/20 to-purple-500/5',
    textGradient: 'from-fuchsia-400 to-purple-400', hoverGlow: 'hover:shadow-[0_0_40px_rgba(191,0,255,0.5)]',
    rgb: '191,0,255',
    text: 'text-fuchsia-300', hoverShadow: 'hover:shadow-[0_0_40px_rgba(191,0,255,0.5)]', gradient: 'from-fuchsia-500/20 to-purple-500/5',
  },
  ground: {
    neon: '#D2691E', glow: '0 0 40px rgba(210,105,30,0.6)', border: 'border-amber-700',
    bg: 'from-amber-950 via-yellow-900 to-zinc-950', badge: 'bg-amber-700/20 border border-amber-700/40',
    badgeText: 'text-amber-300', cardGradient: 'from-amber-700/20 to-yellow-700/5',
    textGradient: 'from-amber-400 to-yellow-500', hoverGlow: 'hover:shadow-[0_0_40px_rgba(210,105,30,0.5)]',
    rgb: '210,105,30',
    text: 'text-amber-300', hoverShadow: 'hover:shadow-[0_0_40px_rgba(210,105,30,0.5)]', gradient: 'from-amber-700/20 to-yellow-700/5',
  },
  rock: {
    neon: '#A0785A', glow: '0 0 30px rgba(160,120,90,0.5)', border: 'border-stone-500',
    bg: 'from-stone-900 via-neutral-900 to-zinc-950', badge: 'bg-stone-500/20 border border-stone-500/40',
    badgeText: 'text-stone-300', cardGradient: 'from-stone-500/15 to-neutral-500/5',
    textGradient: 'from-stone-300 to-neutral-400', hoverGlow: 'hover:shadow-[0_0_30px_rgba(160,120,90,0.4)]',
    rgb: '160,120,90',
    text: 'text-stone-300', hoverShadow: 'hover:shadow-[0_0_30px_rgba(160,120,90,0.4)]', gradient: 'from-stone-500/15 to-neutral-500/5',
  },
  bug: {
    neon: '#7FFF00', glow: '0 0 40px rgba(127,255,0,0.6)', border: 'border-lime-500',
    bg: 'from-lime-950 via-green-900 to-zinc-950', badge: 'bg-lime-500/20 border border-lime-500/40',
    badgeText: 'text-lime-300', cardGradient: 'from-lime-500/20 to-green-500/5',
    textGradient: 'from-lime-400 to-green-400', hoverGlow: 'hover:shadow-[0_0_40px_rgba(127,255,0,0.4)]',
    rgb: '127,255,0',
    text: 'text-lime-300', hoverShadow: 'hover:shadow-[0_0_40px_rgba(127,255,0,0.4)]', gradient: 'from-lime-500/20 to-green-500/5',
  },
  flying: {
    neon: '#87CEEB', glow: '0 0 40px rgba(135,206,235,0.6)', border: 'border-sky-400',
    bg: 'from-sky-950 via-blue-900 to-zinc-950', badge: 'bg-sky-400/20 border border-sky-400/40',
    badgeText: 'text-sky-300', cardGradient: 'from-sky-400/20 to-blue-400/5',
    textGradient: 'from-sky-300 to-blue-300', hoverGlow: 'hover:shadow-[0_0_40px_rgba(135,206,235,0.4)]',
    rgb: '135,206,235',
    text: 'text-sky-300', hoverShadow: 'hover:shadow-[0_0_40px_rgba(135,206,235,0.4)]', gradient: 'from-sky-400/20 to-blue-400/5',
  },
  fairy: {
    neon: '#FF85C2', glow: '0 0 40px rgba(255,133,194,0.7)', border: 'border-pink-400',
    bg: 'from-pink-950 via-fuchsia-900 to-zinc-950', badge: 'bg-pink-400/20 border border-pink-400/40',
    badgeText: 'text-pink-200', cardGradient: 'from-pink-400/20 to-fuchsia-400/5',
    textGradient: 'from-pink-300 to-fuchsia-300', hoverGlow: 'hover:shadow-[0_0_40px_rgba(255,133,194,0.5)]',
    rgb: '255,133,194',
    text: 'text-pink-200', hoverShadow: 'hover:shadow-[0_0_40px_rgba(255,133,194,0.5)]', gradient: 'from-pink-400/20 to-fuchsia-400/5',
  },
  normal: {
    neon: '#A8A8C0', glow: '0 0 30px rgba(168,168,192,0.4)', border: 'border-gray-400',
    bg: 'from-gray-900 via-neutral-800 to-zinc-950', badge: 'bg-gray-400/20 border border-gray-400/40',
    badgeText: 'text-gray-300', cardGradient: 'from-gray-400/10 to-neutral-400/5',
    textGradient: 'from-gray-300 to-neutral-400', hoverGlow: 'hover:shadow-[0_0_30px_rgba(168,168,192,0.3)]',
    rgb: '168,168,192',
    text: 'text-gray-300', hoverShadow: 'hover:shadow-[0_0_30px_rgba(168,168,192,0.3)]', gradient: 'from-gray-400/10 to-neutral-400/5',
  },
  default: {
    neon: '#6366F1', glow: '0 0 30px rgba(99,102,241,0.5)', border: 'border-indigo-400',
    bg: 'from-indigo-950 via-slate-900 to-zinc-950', badge: 'bg-indigo-400/20 border border-indigo-400/40',
    badgeText: 'text-indigo-300', cardGradient: 'from-indigo-400/15 to-slate-400/5',
    textGradient: 'from-indigo-300 to-slate-400', hoverGlow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]',
    rgb: '99,102,241',
    text: 'text-indigo-300', hoverShadow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]', gradient: 'from-indigo-400/15 to-slate-400/5',
  },
};
