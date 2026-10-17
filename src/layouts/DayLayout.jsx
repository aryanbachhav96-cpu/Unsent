import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import LoopingVideo from '../components/LoopingVideo';
import Logo from '../components/Logo';
import revealTextTree from '../components/TextReveal';
import { Moon, Compass, UserRound, Newspaper } from 'lucide-react';

export default function DayLayout() {
  const location = useLocation();
  const isLanding = location.pathname === '/' || location.pathname === '/day' || location.pathname === '/day/';
  const isAuthPage = location.pathname === '/auth';
  const isRoomDetail = /\/r\/[^/]+$/.test(location.pathname);
  const isRoomsView = location.pathname.endsWith('/rooms') || /\/r\/[^/]+$/.test(location.pathname);

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
        className="fixed inset-0 w-full h-full pointer-events-none -z-10 transition-colors duration-500"
        style={{
          backgroundColor: isLanding ? 'rgba(255, 255, 255, 0.12)' : isAuthPage ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.28)',
          backdropFilter: isLanding ? 'none' : isAuthPage ? 'blur(1px)' : 'blur(2px)',
          WebkitBackdropFilter: isLanding ? 'none' : isAuthPage ? 'blur(1px)' : 'blur(2px)',
        }}
        aria-hidden="true"
      />

      {/* Day Mode Top Navigation */}
      {!isLanding && (
        <header className="fixed top-4 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
          <nav
            aria-label="Day mode navigation"
            className="pointer-events-auto w-full max-w-5xl day-glass rounded-full px-5 py-3 pl-14 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <Link to="/" className="flex items-center gap-2.5 group">
                <Logo className="w-6 h-6 text-slate-900 transition-transform group-hover:scale-105 duration-200" />
                <span className="font-semibold text-slate-900 tracking-tight text-lg">Unsent <span className="text-sm font-medium text-slate-700">Day</span></span>
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                to="/day/feed"
                aria-current={location.pathname.endsWith('/feed') ? 'page' : undefined}
                className="text-sm font-semibold text-slate-800 hover:text-black px-3 py-2 rounded-full hover:bg-black/5 transition-colors flex items-center gap-1.5"
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>Feed</span>
              </Link>
              <Link
                to="/day/profile"
                aria-current={location.pathname.endsWith('/profile') ? 'page' : undefined}
                className="text-sm font-semibold text-slate-800 hover:text-black px-3 py-2 rounded-full hover:bg-black/5 transition-colors flex items-center gap-1.5"
              >
                <UserRound className="w-3.5 h-3.5" />
                <span>Profile</span>
              </Link>
              <Link
                to="/day/rooms"
                aria-current={isRoomsView ? 'page' : undefined}
                className={`text-sm font-semibold text-slate-800 hover:text-black px-3 py-2 rounded-full hover:bg-black/5 transition-colors flex items-center gap-1.5 ${
                  isRoomsView ? 'bg-black/5 text-slate-900' : ''
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Rooms</span>
              </Link>

              <Link
                to="/night"
                className="text-sm font-semibold text-slate-800 hover:text-black px-3 py-2 rounded-full border border-black/15 hover:bg-black/5 transition-colors flex items-center gap-1.5"
                title="Switch to Night Mode"
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Night</span>
              </Link>
            </div>
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
