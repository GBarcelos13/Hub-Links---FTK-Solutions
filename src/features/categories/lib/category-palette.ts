export const CATEGORY_COLORS = [
  'slate', 'rose', 'orange', 'amber',
  'emerald', 'sky', 'violet', 'pink',
] as const;

export type CategoryColor = typeof CATEGORY_COLORS[number];

export function isCategoryColor(v: string | null | undefined): v is CategoryColor {
  return !!v && (CATEGORY_COLORS as readonly string[]).includes(v);
}

export function normalizeColor(v: string | null | undefined): CategoryColor {
  return isCategoryColor(v) ? v : 'slate';
}

// Classes Tailwind pré-compiladas (Tailwind só bundla o que vê no source).
// Mantemos todas as combinações explícitas para o JIT incluir.
export const COLOR_CLASSES: Record<CategoryColor, {
  dot: string;
  bg: string;
  text: string;
  ring: string;
  solid: string;
}> = {
  slate:   { dot: 'bg-slate-500',   bg: 'bg-slate-100',   text: 'text-slate-700',   ring: 'ring-slate-500',   solid: 'bg-slate-500' },
  rose:    { dot: 'bg-rose-500',    bg: 'bg-rose-100',    text: 'text-rose-700',    ring: 'ring-rose-500',    solid: 'bg-rose-500' },
  orange:  { dot: 'bg-orange-500',  bg: 'bg-orange-100',  text: 'text-orange-700',  ring: 'ring-orange-500',  solid: 'bg-orange-500' },
  amber:   { dot: 'bg-amber-500',   bg: 'bg-amber-100',   text: 'text-amber-700',   ring: 'ring-amber-500',   solid: 'bg-amber-500' },
  emerald: { dot: 'bg-emerald-500', bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-500', solid: 'bg-emerald-500' },
  sky:     { dot: 'bg-sky-500',     bg: 'bg-sky-100',     text: 'text-sky-700',     ring: 'ring-sky-500',     solid: 'bg-sky-500' },
  violet:  { dot: 'bg-violet-500',  bg: 'bg-violet-100',  text: 'text-violet-700',  ring: 'ring-violet-500',  solid: 'bg-violet-500' },
  pink:    { dot: 'bg-pink-500',    bg: 'bg-pink-100',    text: 'text-pink-700',    ring: 'ring-pink-500',    solid: 'bg-pink-500' },
};

export const SUGGESTED_EMOJIS = [
  '📁', '🤖', '📊', '🎨', '💻', '📝', '🔎', '🎯',
  '⚡', '🚀', '📚', '🛠️', '🎵', '📸', '💡', '🌐',
];
