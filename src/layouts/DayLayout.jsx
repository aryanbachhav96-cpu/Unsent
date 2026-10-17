import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import LoopingVideo from '../components/LoopingVideo';
import Logo from '../components/Logo';
import revealTextTree from '../components/TextReveal';
import { Moon, Compass, UserRound, Newspaper, Menu, X } from 'lucide-react';

export default function DayLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLanding = location.pathname === '/' || location.pathname === '/day' || location.pathname === '/day/';
  const isAuthPage = location.pathname === '/auth';
  const isRoomDetail = /\/r\/[^/]+$/.test(location.pathname);
  const isRoomsView = location.pathname.endsWith('/rooms') || /\/r\/[^/]+$/.test(location.pathname);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navigationLinks = [
    {
      to: '/day/feed',
      label: 'Feed',
      icon: Newspaper,
      active: location.pathname.endsWith('/feed'),
    },
    {
      to: '/day/profile',
      label: 'Profile',
      icon: UserRound,
      active: location.pathname.endsWith('/profile'),
    },
    {
      to: '/day/rooms',
      label: 'Rooms',
      icon: Compass,
      active: isRoomsView,
    },
    {
      to: '/night',
      label: 'Night',
      icon: Moon,
      active: false,
    },
  ];

  return revealTextTree((
    <div className="day-experience relative min-h-screen w-full flex flex-col justify-between bg-transparent text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* Fixed Layout-Level Background: day-hero.mp4 mounted once so it never reloads */}
      {!isRoomDetail && (
        <div className="day-background-media fixed inset-0 w-full h-full pointer-events-none overflow-hidden -z-20" aria-hidden="true">
          <LoopingVideo
            src="/video/day-hero.mp4"
            playbackRate={0.6}
            fallbackImage="/images/day/day-01.jpg"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Light scrim keeps Day-mode text readable over moving imagery. */}
      <div
        className="day-global-scrim fixed inset-0 w-full h-full pointer-events-none -z-10 transition-colors duration-500"
        style={{
          backgroundColor: isLanding ? 'rgba(255, 255, 255, 0.12)' : isAuthPage ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.28)',
          backdropFilter: isLanding ? 'none' : isAuthPage ? 'blur(1px)' : 'blur(2px)',
          WebkitBackdropFilter: isLanding ? 'none' : isAuthPage ? 'blur(1px)' : 'blur(2px)',
        }}
        aria-hidden="true"
      />

      {/* Day Mode Top Navigation */}
      {!isLanding && (
        <header className="site-header fixed top-4 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
          <nav
            aria-label="Day mode navigation"
            className="pointer-events-auto w-full max-w-5xl day-glass rounded-full px-4 sm:px-5 py-2.5 pl-12 sm:pl-14 flex items-center justify-between shadow-sm"
          >
            <div className="flex shrink-0 items-center gap-2.5">
              <Link to="/" className="flex shrink-0 items-center gap-2.5 whitespace-nowrap group">
                <Logo className="w-6 h-6 text-slate-900 transition-transform group-hover:scale-105 duration-200" />
                <span className="day-nav-brand font-semibold text-slate-900 tracking-tight text-lg">Unsent <span className="text-sm font-medium text-slate-700">Day</span></span>
              </Link>
            </div>

            <div className="hidden sm:flex items-center gap-1 sm:gap-2">
              {navigationLinks.map(({ to, label, icon: Icon, active }) => (
                <Link
                  key={to}
                  to={to}
                  aria-current={active ? 'page' : undefined}
                  title={label === 'Night' ? 'Switch to Night Mode' : undefined}
                  className={`text-sm font-semibold text-slate-800 hover:text-black px-2 sm:px-3 py-2 rounded-full hover:bg-black/5 transition-colors flex items-center gap-1.5 ${
                    active ? 'bg-black/5 text-slate-900' : ''
                  } ${label === 'Night' ? 'border border-black/15' : ''}`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className="flex sm:hidden h-10 w-10 items-center justify-center rounded-full text-slate-900 hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {mobileOpen && (
              <div className="day-mobile-menu day-glass absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 flex max-h-[min(75dvh,32rem)] flex-col gap-1 overflow-y-auto overscroll-contain rounded-3xl p-3 shadow-xl sm:hidden">
                {navigationLinks.map(({ to, label, icon: Icon, active }) => (
                  <Link
                    key={to}
                    to={to}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-black/5 ${
                      active ? 'bg-black/5 text-slate-950' : ''
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{label === 'Night' ? 'Switch to Night mode' : label}</span>
                  </Link>
                ))}
              </div>
            )}
          </nav>
        </header>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${isLanding ? '' : 'pt-24 pb-12'}`}>
        <Outlet />
      </div>

      {/* Day Mode Minimal Footer */}
      <footer className="relative z-10 w-full border-t border-black/10 bg-white/75 backdrop-blur-md py-6 px-4 mt-auto text-center text-sm font-medium text-slate-800">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Unsent Day — Open thoughts under light.</span>
          <div className="flex items-center gap-3">
            <Link to="/guidelines" className="hover:underline">Guidelines</Link>
            <span>•</span>
            <Link to="/night" className="hover:underline flex items-center gap-1"><Moon className="w-3 h-3" /><span>Night Mode</span></Link>
          </div>
        </div>
      </footer>
    </div>
  ));
}
