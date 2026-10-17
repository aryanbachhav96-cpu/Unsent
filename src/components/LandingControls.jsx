import React from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

export default function LandingControls({ mode = 'night' }) {
  const isDay = mode === 'day';
  const authTheme = isDay ? '&theme=day' : '';
  const controlClass = isDay
    ? 'border-slate-900/20 bg-white/65 text-slate-900 hover:bg-white/90'
    : 'border-white/20 bg-black/20 text-white hover:bg-white/15';

  return (
    <nav
      aria-label="Landing page actions"
      className="fixed right-4 top-4 z-[55] flex max-w-[calc(100vw-5rem)] flex-wrap items-center justify-end gap-1.5 rounded-2xl border border-white/10 bg-black/10 p-1.5 shadow-lg backdrop-blur-md sm:gap-2 sm:rounded-full sm:px-2"
    >
      <Link
        to={`/auth?mode=login${authTheme}`}
        className={`rounded-full border px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm ${controlClass}`}
      >
        Log in
      </Link>
      <Link
        to={`/auth?mode=signup${authTheme}`}
        className={`rounded-full border px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm ${controlClass}`}
      >
        Sign up
      </Link>
      <span
        aria-hidden="true"
        className={`mx-0.5 h-5 w-px ${isDay ? 'bg-slate-900/20' : 'bg-white/25'}`}
      />
      <Link
        to={isDay ? '/night' : '/'}
        aria-label={isDay ? 'Switch to Night mode' : 'Switch to Day mode'}
        title={isDay ? 'Switch to Night mode' : 'Switch to Day mode'}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm ${controlClass}`}
      >
        {isDay
          ? <Moon className="h-3.5 w-3.5" aria-hidden="true" />
          : <Sun className="h-3.5 w-3.5 text-amber-200" aria-hidden="true" />}
        <span>{isDay ? 'Night' : 'Day'}</span>
      </Link>
    </nav>
  );
}
