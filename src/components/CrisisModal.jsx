import React from 'react';
import { HeartHandshake, PhoneCall, Globe, X } from 'lucide-react';
import H3Heading from './H3Heading';
import revealTextTree from './TextReveal';

export default function CrisisModal({ isOpen, onClose, onConfirm, variant = 'night' }) {
  if (!isOpen) return null;
  const isDay = variant === 'day';

  return revealTextTree((
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDay ? 'bg-slate-900/35' : 'bg-black/75 backdrop-blur-md'} animate-fade-in`}>
      <div className={`responsive-modal-panel relative w-full max-w-lg rounded-3xl p-5 sm:p-8 shadow-2xl text-left ${isDay ? 'day-glass text-slate-900' : 'liquid-glass border border-white/20'}`}>
        {/* Close icon */}
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 p-1 rounded-full transition-colors ${isDay ? 'text-slate-500 hover:text-slate-900 hover:bg-black/5' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDay ? 'bg-slate-900/5 text-slate-900' : 'bg-white/10 text-white'}`}>
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <H3Heading className={`font-serif ${isDay ? 'text-slate-900' : 'text-white text-aura'}`}>You are not alone</H3Heading>
            <p className={`text-xs ${isDay ? 'text-slate-600' : 'text-zinc-400'}`}>Quiet support is available right now</p>
          </div>
        </div>

        <p className={`text-sm sm:text-base leading-relaxed mb-6 ${isDay ? 'text-slate-700' : 'text-zinc-200'}`}>
          It sounds like you may be going through something deeply painful. Unsent is a quiet place to share, but please remember your life and well-being matter. If you need someone who will listen without judgment:
        </p>

        {/* Resources card */}
        <div className={`rounded-2xl p-4 mb-6 border flex flex-col gap-3 ${isDay ? 'bg-white/45 border-black/10' : 'liquid-glass border-white/15'}`}>
          <div className="flex items-start gap-3">
            <PhoneCall className={`w-4 h-4 mt-1 shrink-0 ${isDay ? 'text-slate-700' : 'text-white'}`} />
            <div>
              <p className={`text-xs uppercase tracking-wider ${isDay ? 'text-slate-500' : 'text-zinc-400'}`}>India — Toll-Free (24/7)</p>
              <a
                href="tel:14416"
                className={`text-base font-semibold hover:underline ${isDay ? 'text-slate-900' : 'text-white'}`}
              >
                Tele-MANAS: 14416 / 1800 891 4416
              </a>
            </div>
          </div>

          <div className={`flex items-start gap-3 pt-2 border-t ${isDay ? 'border-black/10' : 'border-white/10'}`}>
            <Globe className={`w-4 h-4 mt-1 shrink-0 ${isDay ? 'text-slate-700' : 'text-white'}`} />
            <div>
              <p className={`text-xs uppercase tracking-wider ${isDay ? 'text-slate-500' : 'text-zinc-400'}`}>Worldwide Support</p>
              <p className={`text-sm ${isDay ? 'text-slate-700' : 'text-zinc-300'}`}>
                Please contact your local emergency services or visit{' '}
                <a
                  href="https://findahelpline.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`underline underline-offset-4 font-medium ${isDay ? 'text-slate-900' : 'text-white'}`}
                >
                  findahelpline.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={onClose}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-full border text-sm font-medium transition-colors ${isDay ? 'border-black/10 text-slate-600 hover:text-slate-900 hover:bg-black/5' : 'border-white/20 text-zinc-300 hover:text-white hover:bg-white/10'}`}
          >
            I need a moment
          </button>
          <button
            onClick={onConfirm}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-full font-semibold text-sm active:scale-95 transition-all duration-150 ${isDay ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-black hover:bg-zinc-200'}`}
          >
            I still want to share this
          </button>
        </div>
      </div>
    </div>
  ));
}
