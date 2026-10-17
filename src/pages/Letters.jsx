import React, { useState, useEffect } from 'react';
import PageBackground from '../components/PageBackground';
import ReportModal from '../components/ReportModal';
import CrisisModal from '../components/CrisisModal';
import revealTextTree from '../components/TextReveal';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageCircle, Flag, Flame, Lock, Send, Sparkles, Feather } from 'lucide-react';

export default function Letters() {
  const { user } = useAuth();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);

  // Form fields
  const [addressee, setAddressee] = useState('');
  const [body, setBody] = useState('');
  const [signOff, setSignOff] = useState('Always,');
  const [submitting, setSubmitting] = useState(false);
  const [burnedNotice, setBurnedNotice] = useState(false);
  const [notice, setNotice] = useState('');

  // Modals
  const [reportState, setReportState] = useState({ isOpen: false, type: 'post', id: null });
  const [crisisModalOpen, setCrisisModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'share' | 'vault'

  const fetchLetters = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts?type=letter');
      if (res.ok) {
        const data = await res.json();
        setLetters(data.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  const handleAction = async (actionType, confirmedCrisis = false) => {
    if (!addressee.trim() || !body.trim()) {
      setNotice('Please provide who the letter is for and your message.');
      return;
    }

    // 1. If action is "Release" (Burn)
    if (actionType === 'release') {
      const confirmRelease = window.confirm(
        'Releasing this letter will burn it into the dark forever without saving it anywhere. It will never be read by anyone. Ready to let it go?'
      );
      if (!confirmRelease) return;

      // Simulate burning into the dark
      setBurnedNotice(true);
      setAddressee('');
      setBody('');
      setTimeout(() => {
        setBurnedNotice(false);
        setShowComposer(false);
      }, 3000);
      return;
    }

    // 2. If action is "Keep private" (Vault) and user not logged in
    if (actionType === 'vault' && !user) {
      setNotice('Please log in first to store letters in your private encrypted vault.');
      return;
    }

    setSubmitting(true);
    setNotice('');

    try {
      const visibility = actionType === 'vault' ? 'vault' : 'public';

      // Anonymize addressee if sharing publicly (show initial or first name)
      const cleanAddressee = addressee.trim();
      const publicAddressee = cleanAddressee.split(' ')[0]; // only first name or initial

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'letter',
          topic: 'Letter',
          addressee: publicAddressee,
          body,
          sign_off: signOff,
          visibility,
          confirmedCrisis,
        }),
      });

      const data = await res.json();

      if (data.needsCrisisConfirmation) {
        setPendingAction(actionType);
        setCrisisModalOpen(true);
        setSubmitting(false);
        return;
      }

      if (res.ok) {
        setAddressee('');
        setBody('');
        setShowComposer(false);
        if (actionType === 'vault') {
          setNotice('Letter sealed safely in your private vault.');
        } else {
          fetchLetters();
        }
      } else {
        setNotice(data.error || 'Could not save letter.');
      }
    } catch {
      setNotice('Unable to connect to sanctuary.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeel = async (postId) => {
    try {
      const res = await fetch(`/api/posts/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction_type: 'feel' }),
      });
      if (res.ok) {
        const data = await res.json();
        setLetters((prev) =>
          prev.map((p) => {
            if (p.id === postId) {
              const delta = data.reacted ? 1 : -1;
              return {
                ...p,
                userFelt: data.reacted,
                feel_count: Math.max(0, (p.feel_count || 0) + delta),
              };
            }
            return p;
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return revealTextTree((
    <div className="relative min-h-screen bg-transparent pt-32 pb-24 px-4 flex flex-col items-center">
      <PageBackground image="/images/img-04.jpg" />

      {/* Crisis Modal */}
      <CrisisModal
        isOpen={crisisModalOpen}
        onClose={() => setCrisisModalOpen(false)}
        onConfirm={() => {
          setCrisisModalOpen(false);
          if (pendingAction) handleAction(pendingAction, true);
        }}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportState.isOpen}
        targetType={reportState.type}
        targetId={reportState.id}
        onClose={() => setReportState({ isOpen: false, type: 'post', id: null })}
      />

      <div className="relative z-10 w-full max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl sm:text-6xl text-white text-aura mb-2">
            Unsent Letters
          </h1>
          <p className="text-zinc-200 text-sm sm:text-base max-w-lg mx-auto mb-6">
            Words intended for someone who will never receive them. Kept private, shared anonymously, or released into the dark.
          </p>

          <button
            onClick={() => setShowComposer(!showComposer)}
            className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 active:scale-95 transition-all inline-flex items-center gap-2 shadow-lg"
          >
            <Feather className="w-4 h-4" />
            <span>{showComposer ? 'Close Letter Desk' : 'Write an Unsent Letter'}</span>
          </button>
        </div>

        {notice && (
          <div className="liquid-glass border border-white/20 p-3 rounded-2xl mb-6 text-xs text-zinc-200 text-center">
            {notice}
          </div>
        )}

        {/* Burned Letter Animation Card */}
        {burnedNotice && (
          <div className="liquid-glass border border-white/30 p-8 rounded-3xl mb-8 text-center flex flex-col items-center gap-3 animate-pulse">
            <Flame className="w-8 h-8 text-white" />
            <h3 className="font-serif text-2xl text-white">The letter has turned to ash.</h3>
            <p className="text-xs text-zinc-300 max-w-md">
              It was never recorded, never sent, and never saved. You are free of it now.
            </p>
          </div>
        )}

        {/* Letter Composer */}
        {showComposer && !burnedNotice && (
          <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl mb-12 text-left">
            <div className="mb-4 pb-3 border-b border-white/10 flex items-center justify-between text-xs text-zinc-400">
              <span className="font-serif text-lg text-white">Stationery</span>
              <span>Anonymous Letter</span>
            </div>

            <div className="flex flex-col gap-4">
              {/* Dear _____ */}
              <div className="flex items-center gap-2 text-base sm:text-lg">
                <span className="font-serif text-zinc-300">Dear</span>
                <input
                  type="text"
                  value={addressee}
                  onChange={(e) => setAddressee(e.target.value)}
                  placeholder="name or initial (e.g. Maya, S., Dad)"
                  maxLength={40}
                  className="flex-1 bg-transparent border-b border-white/20 pb-1 text-white font-medium outline-none focus:border-white/60 placeholder:text-zinc-500"
                />
                <span className="font-serif text-zinc-300">,</span>
              </div>

              {/* Letter Body */}
              <div>
                <textarea
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write everything you couldn't bring yourself to say aloud..."
                  className="w-full liquid-glass rounded-2xl p-4 text-white text-base leading-relaxed placeholder:text-zinc-500 outline-none border border-white/15 focus:border-white/50 resize-y"
                />
              </div>

              {/* Sign-off */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400">Sign-off:</span>
                <select
                  value={signOff}
                  onChange={(e) => setSignOff(e.target.value)}
                  className="liquid-glass text-white text-xs rounded-full px-3 py-1.5 outline-none border border-white/15"
                >
                  <option value="Always," className="bg-zinc-900 text-white">Always,</option>
                  <option value="Yours," className="bg-zinc-900 text-white">Yours,</option>
                  <option value="Forever unseen," className="bg-zinc-900 text-white">Forever unseen,</option>
                  <option value="With quiet love," className="bg-zinc-900 text-white">With quiet love,</option>
                  <option value="Forgiving you," className="bg-zinc-900 text-white">Forgiving you,</option>
                  <option value="Someone who remembered," className="bg-zinc-900 text-white">Someone who remembered,</option>
                </select>
                <span className="text-xs text-zinc-400 italic">— {user ? user.handle : 'Anonymous'}</span>
              </div>

              {/* 3 Choices: Keep private (Vault), Share anonymously (Wall), Release (Burn) */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleAction('release')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-full border border-red-500/30 text-xs text-zinc-300 hover:text-white hover:bg-red-950/20 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Flame className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Release (Burn forever)</span>
                </button>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleAction('vault')}
                    disabled={submitting}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full liquid-glass border border-white/20 text-xs text-zinc-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Keep private (Vault)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAction('share')}
                    disabled={submitting}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 active:scale-95 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Share on Wall</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wall of Letters */}
        <div className="text-left mb-6">
          <h2 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-1">
            Wall of Unsent Letters
          </h2>
          <p className="text-xs text-zinc-400">Anonymous letters released to the world.</p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-zinc-400 text-sm">Gathering letters...</div>
        ) : letters.length === 0 ? (
          <div className="liquid-glass rounded-3xl p-12 text-center text-zinc-400 text-sm border border-white/10">
            No letters pinned to the wall yet. Write the first one.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {letters.map((letter) => (
              <article
                key={letter.id}
                className="liquid-glass rounded-3xl p-7 border border-white/15 text-left transition-all duration-200 hover:border-white/25"
              >
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-4 pb-2 border-b border-white/10">
                  <span className="font-serif text-lg text-white">
                    Dear {letter.addressee || 'You'},
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-400">to {letter.addressee || 'unnamed'}</span>
                    <button
                      onClick={() => setReportState({ isOpen: true, type: 'post', id: letter.id })}
                      className="p-1 rounded-full text-zinc-500 hover:text-white"
                      title="Report letter"
                    >
                      <Flag className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <p className="text-zinc-100 text-base leading-relaxed whitespace-pre-line mb-6 font-normal">
                  {letter.body}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                  <div className="text-zinc-300">
                    <span className="italic">{letter.sign_off || 'Always,'}</span>{' '}
                    <span className="text-zinc-400">— {letter.author_handle}</span>
                  </div>

                  <button
                    onClick={() => handleFeel(letter.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
                      letter.userFelt
                        ? 'bg-white text-black font-medium'
                        : 'liquid-glass hover:bg-white/10 text-zinc-300'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${letter.userFelt ? 'fill-black' : ''}`} />
                    <span>I feel this ({letter.feel_count || 0})</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  ));
}
