import { MoonStar, SunMedium } from 'lucide-react';

export function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15 dark:text-slate-100"
    >
      {isDark ? <SunMedium size={16} /> : <MoonStar size={16} />}
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
