import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import revealTextTree from './TextReveal';

export default function Footer() {
  return revealTextTree((
    <footer className="w-full border-t border-white/10 bg-black/80 backdrop-blur-md py-8 px-4 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        {/* Left: Logo & statement */}
        <div className="flex items-center gap-2">
          <Logo className="w-5 h-5 text-zinc-500" />
          <span className="text-sm text-zinc-300 font-medium">Unsent</span>
          <span className="text-zinc-400 text-xs">— say what you never sent.</span>
        </div>

        {/* Center / Helpline line */}
        <div className="text-xs text-zinc-300 flex flex-wrap items-center justify-center gap-1.5">
          <span>Struggling right now?</span>
          <a
            href="tel:14416"
            className="text-white hover:underline underline-offset-4 font-medium"
            title="Tele-MANAS Toll-Free National Mental Health Helpline"
          >
            Call Tele-MANAS 14416
          </a>
          <span className="text-zinc-400">(free, 24/7, India)</span>
        </div>

        {/* Right: Links */}
        <div className="flex items-center gap-4 text-xs text-zinc-300">
          <Link to="/guidelines" className="hover:text-white transition-colors">
            Community guidelines
          </Link>
          <Link to="/healing" className="hover:text-white transition-colors">
            Get help
          </Link>
          <span className="text-zinc-400">Anonymous & Unjudged</span>
        </div>
      </div>
    </footer>
  ));
}
