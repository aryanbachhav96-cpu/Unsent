import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import revealTextTree from './TextReveal';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ChevronDown, HeartHandshake, Sun } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  // Close mobile menu and dropdowns on route change
  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  // Click outside listener for "More" dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Stories', path: '/stories' },
    { label: 'Love', path: '/love' },
    { label: 'Thoughts', path: '/thoughts' },
    { label: 'Music', path: '/music' },
    { label: 'Books', path: '/books' },
  ];

  const moreLinks = [
    { label: 'Explore Rooms', path: '/explore' },
    { label: 'Letters', path: '/letters' },
    { label: 'Occult', path: '/occult' },
    { label: 'Healing', path: '/healing' },
    { label: 'Day Mode', path: '/' },
    { label: 'Guidelines', path: '/guidelines' },
  ];

  return revealTextTree((
    <header className="site-header fixed top-4 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
      <nav
        className="pointer-events-auto w-full max-w-5xl liquid-glass rounded-full px-4 sm:px-5 py-2.5 pl-12 sm:pl-14 flex items-center justify-between transition-all duration-300"
        aria-label="Main Navigation"
      >
        {/* Left: Logo + Unsent */}
        <div className="flex shrink-0 items-center gap-2.5">
          <Link to="/night" className="flex shrink-0 items-center gap-2.5 whitespace-nowrap group">
            <Logo className="w-6 h-6 text-white transition-transform group-hover:scale-105 duration-200" />
            <span className="night-nav-brand font-semibold text-white tracking-tight text-lg">Unsent</span>
          </Link>
        </div>

        {/* Center: Desktop links */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'text-white bg-white/10'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* More dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="px-3 py-1.5 rounded-full text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 flex items-center gap-1 transition-colors duration-150"
              aria-expanded={moreOpen}
            >
              <span>More</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
            </button>

            {moreOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 liquid-glass rounded-2xl p-2 flex flex-col gap-1 border border-white/10 backdrop-blur-xl z-50">
                {moreLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMoreOpen(false)}
                    className="px-3 py-2 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMoreOpen(false)}
                    className="px-3 py-2 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-white/10 border-t border-white/5 mt-1 transition-colors"
                  >
                    Admin Console
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Auth / Write actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/healing"
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 px-2 py-1 rounded-full hover:bg-white/5 transition-colors"
            title="Helplines & Support"
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Get help</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/my"
                className="text-sm text-zinc-300 hover:text-white px-2.5 py-1 rounded-full hover:bg-white/5 transition-colors"
              >
                {user.handle}
              </Link>
              <button
                onClick={logout}
                className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="text-sm text-zinc-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors font-medium"
            >
              Log in
            </Link>
          )}

          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white px-3 py-1.5 rounded-full liquid-glass border border-white/10 hover:border-white/30 transition-all font-medium"
            title="Switch to Day Mode"
          >
            <Sun className="w-3.5 h-3.5 text-amber-200" />
            <span>Day</span>
          </Link>

          <Link
            to="/write"
            className="bg-white text-black text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-zinc-200 active:scale-95 transition-all duration-150 shadow-sm"
          >
            Write
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-1 text-xs text-zinc-300 px-2.5 py-1 rounded-full liquid-glass border border-white/10"
          >
            <Sun className="w-3 h-3 text-amber-200" />
            <span>Day</span>
          </Link>
          <Link
            to="/write"
            className="bg-white text-black text-xs font-semibold px-3 py-1 rounded-full hover:bg-zinc-200"
          >
            Write
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-full text-zinc-300 hover:text-white hover:bg-white/10"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Glass Sheet Menu */}
      {mobileOpen && (
        <div className="night-mobile-menu md:hidden pointer-events-auto fixed inset-x-4 top-20 liquid-glass rounded-3xl p-5 flex flex-col gap-3 border border-white/10 backdrop-blur-2xl z-50 max-h-[80vh] overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-1 pb-2 border-b border-white/10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-xl text-base font-medium ${
                  location.pathname === link.path ? 'text-white bg-white/10' : 'text-zinc-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-1 pb-2 border-b border-white/10">
            <span className="text-xs uppercase tracking-wider text-zinc-300 px-3 py-1 font-semibold">More Sections</span>
            {moreLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-1.5 rounded-xl text-sm text-zinc-300 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-1.5 rounded-xl text-sm text-zinc-400 hover:text-white"
              >
                Admin Console
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <Link
              to="/healing"
              onClick={() => setMobileOpen(false)}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 px-3 py-1"
            >
              <HeartHandshake className="w-4 h-4 text-zinc-400" />
              <span>Get help & crisis resources</span>
            </Link>

            {user ? (
              <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-2xl">
                <Link to="/my" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-white">
                  {user.handle}
                </Link>
                <button onClick={logout} className="text-xs text-zinc-400 hover:text-white">
                  Log out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 rounded-full border border-white/20 text-sm font-medium text-white hover:bg-white/10"
              >
                Log in / Sign up
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  ));
}
