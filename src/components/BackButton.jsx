import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function getFallbackPath(pathname) {
  if (/^\/(?:day\/)?r\/[^/]+\/?$/.test(pathname)) return '/day/rooms';
  if (pathname === '/day/feed' || pathname === '/day/profile') return '/';
  if (pathname === '/rooms' || pathname === '/day/rooms') return '/';
  if (pathname === '/' || pathname === '/day' || pathname === '/day/') return '/night';
  if (pathname === '/night') return '/';
  return '/night';
}

export default function BackButton({ mode = 'night' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isDay = mode === 'day';

  const handleBack = () => {
    const historyIndex = window.history.state?.idx;
    if (typeof historyIndex === 'number' && historyIndex > 0) {
      navigate(-1);
      return;
    }
    navigate(getFallbackPath(location.pathname), { replace: true });
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Go back"
      title="Go back"
      className={`back-button inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        isDay
          ? 'border-slate-900/15 bg-white/60 text-slate-900 hover:bg-white hover:shadow-md focus-visible:outline-slate-900'
          : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/15 hover:text-white focus-visible:outline-white'
      }`}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
