import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageBackground from '../components/PageBackground';
import CrisisModal from '../components/CrisisModal';
import revealTextTree from '../components/TextReveal';
import { useAuth } from '../context/AuthContext';
import { Clock, AlertTriangle, ShieldCheck, Sparkles, Send } from 'lucide-react';

export default function Write() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [topic, setTopic] = useState('Breakup');
  const [contentWarning, setContentWarning] = useState(false);
  const [autoDeleteHours, setAutoDeleteHours] = useState(0); // 0 = Never, 24 = 24h, 168 = 7d

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warningNotice, setWarningNotice] = useState('');

  // Crisis modal state
  const [crisisModalOpen, setCrisisModalOpen] = useState(false);

  const topics = [
    'Breakup',
    'Unrequited love',
    'Crush',
    'Trauma',
    'Deep thought',
    'Opinion',
    'Occult',
    'Other',
  ];

  const handleSubmit = async (confirmedCrisis = false) => {
    if (!body.trim()) {
      setError('Please write what you never sent.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          topic,
          type: topic === 'Occult' ? 'occult' : topic === 'Trauma' ? 'healing' : 'story',
          content_warning: contentWarning ? 1 : (topic === 'Trauma' ? 1 : 0),
          auto_delete_hours: autoDeleteHours,
          confirmedCrisis,
        }),
      });

      const data = await res.json();

      if (data.needsCrisisConfirmation) {
        setCrisisModalOpen(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Could not send this into the world.');
        setLoading(false);
        return;
      }

      if (data.warningNotice) {
        setWarningNotice(data.warningNotice);
        setTimeout(() => {
          navigate('/stories');
        }, 2500);
      } else {
        navigate('/stories');
      }
    } catch {
      setError('Unable to reach sanctuary. Please try again.');
      setLoading(false);
    }
  };

  return revealTextTree((
    <div className="relative min-h-screen bg-transparent pt-32 pb-24 px-4 flex flex-col items-center">
      <PageBackground image="/images/img-10.jpg" />

      {/* Crisis Intervention Modal */}
      <CrisisModal
        isOpen={crisisModalOpen}
        onClose={() => setCrisisModalOpen(false)}
        onConfirm={() => {
          setCrisisModalOpen(false);
          handleSubmit(true);
        }}
      />

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl sm:text-5xl text-white text-aura mb-2">
            The Writing Room
          </h1>
          <p className="text-zinc-200 text-sm sm:text-base max-w-lg mx-auto">
            Say what you never said. No algorithms, no names, no judgment.
          </p>
        </div>

        {warningNotice && (
          <div className="liquid-glass border border-white/20 p-4 rounded-2xl mb-6 text-sm text-zinc-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-white shrink-0 mt-0.5" />
            <p>{warningNotice}</p>
          </div>
        )}

        {error && (
          <div className="liquid-glass bg-red-950/20 border border-red-500/30 p-3 rounded-2xl mb-6 text-xs text-zinc-200 text-center">
            {error}
          </div>
        )}

        {/* Editor Glass Surface */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl">
          {/* Handle indicator */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              <span>Publishing as:</span>
              <strong className="text-white font-medium">
                {user ? user.handle : 'Anonymous Guest (transient handle)'}
              </strong>
            </div>
            <span className="text-zinc-400">Untracked</span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(false);
            }}
            className="flex flex-col gap-5 text-left"
          >
            {/* Optional Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title or subject (optional)"
                maxLength={120}
                className="w-full bg-transparent border-b border-white/15 pb-2 text-lg sm:text-xl font-medium text-white placeholder:text-zinc-500 outline-none focus:border-white/50"
              />
            </div>

            {/* Main Body */}
            <div>
              <textarea
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={9}
                placeholder="What have you kept inside? Speak as freely and quietly as you wish..."
                className="w-full liquid-glass rounded-2xl p-4 text-white text-base placeholder:text-zinc-500 outline-none border border-white/15 focus:border-white/50 resize-y leading-relaxed"
              />
            </div>

            {/* Topic selector */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2 font-medium">
                Choose a Topic
              </label>
              <div className="flex flex-wrap gap-2">
                {topics.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTopic(t);
                      if (t === 'Trauma') setContentWarning(true);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                      topic === t
                        ? 'bg-white text-black font-semibold'
                        : 'liquid-glass text-zinc-300 hover:text-white border border-white/10'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Options Row: Content Warning & Auto-Delete */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Content warning toggle */}
              <label className="liquid-glass rounded-2xl p-3.5 flex items-center justify-between cursor-pointer border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs text-zinc-200">Content warning overlay</span>
                </div>
                <input
                  type="checkbox"
                  checked={contentWarning}
                  onChange={(e) => setContentWarning(e.target.checked)}
                  className="rounded-full w-4 h-4 accent-white cursor-pointer"
                />
              </label>

              {/* Auto-delete selector */}
              <div className="liquid-glass rounded-2xl p-3.5 flex items-center justify-between border border-white/10">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs text-zinc-200">Auto-delete</span>
                </div>
                <select
                  value={autoDeleteHours}
                  onChange={(e) => setAutoDeleteHours(Number(e.target.value))}
                  className="bg-transparent text-xs text-white outline-none cursor-pointer"
                >
                  <option value={0} className="bg-zinc-900 text-white">Never</option>
                  <option value={24} className="bg-zinc-900 text-white">After 24 hours</option>
                  <option value={168} className="bg-zinc-900 text-white">After 7 days</option>
                </select>
              </div>
            </div>

            {/* Privacy note */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 py-1">
              <ShieldCheck className="w-4 h-4 shrink-0 text-zinc-400" />
              <span>
                Your IP is never logged or shown. You can permanently delete this post anytime from your dashboard.
              </span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Releasing to sanctuary...' : 'Release anonymously'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  ));
}
