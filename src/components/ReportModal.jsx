import React, { useState } from 'react';
import { Flag, X, Check } from 'lucide-react';
import H3Heading from './H3Heading';
import revealTextTree from './TextReveal';

export default function ReportModal({ isOpen, onClose, targetType, targetId, variant = 'night' }) {
  const [reason, setReason] = useState('Harassment or hate');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const isDay = variant === 'day';

  if (!isOpen) return null;

  const reasons = [
    'Harassment or hate',
    'Personal identifying info (doxxing)',
    'Graphic harm details or encouragement of self-harm',
    'Ritual instructions or recruitment',
    'Medical advice from non-professional',
    'Spam or commercial content',
    'Other concern',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/posts/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          reason,
          details,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setDetails('');
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return revealTextTree((
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDay ? 'bg-slate-900/35' : 'bg-black/80 backdrop-blur-md'}`}>
      <div className={`responsive-modal-panel relative w-full max-w-md rounded-3xl p-5 sm:p-7 text-left ${isDay ? 'day-glass text-slate-900' : 'liquid-glass border border-white/20'}`}>
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 p-1 rounded-full ${isDay ? 'text-slate-500 hover:text-slate-900 hover:bg-black/5' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
          aria-label="Close report dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-3">
          <Flag className={`w-4 h-4 ${isDay ? 'text-slate-500' : 'text-zinc-400'}`} />
          <H3Heading className={`font-serif ${isDay ? 'text-slate-900' : 'text-white'}`}>Report to moderation</H3Heading>
        </div>

        {submitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
              <Check className="w-5 h-5" />
            </div>
            <p className={`text-sm ${isDay ? 'text-slate-700' : 'text-zinc-200'}`}>Thank you for quietly keeping this sanctuary safe.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className={`text-xs ${isDay ? 'text-slate-700' : 'text-zinc-300'}`}>
              Help us understand why this content violates community guidelines.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-medium ${isDay ? 'text-slate-600' : 'text-zinc-400'}`}>Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`text-sm rounded-2xl px-3.5 py-2.5 outline-none border ${isDay ? 'bg-white/70 text-slate-900 border-black/10 focus:border-black/30' : 'liquid-glass text-white border-white/15 focus:border-white/40'}`}
              >
                {reasons.map((r) => (
                  <option key={r} value={r} className={isDay ? 'bg-white text-slate-900' : 'bg-zinc-900 text-white'}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-medium ${isDay ? 'text-slate-600' : 'text-zinc-400'}`}>Additional context (optional)</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Briefly describe what feels harmful..."
                className={`text-sm rounded-2xl p-3 outline-none border resize-none ${isDay ? 'bg-white/70 text-slate-900 border-black/10 focus:border-black/30 placeholder:text-slate-400' : 'liquid-glass text-white border-white/15 focus:border-white/40 placeholder:text-zinc-500'}`}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-full border text-xs ${isDay ? 'border-black/10 text-slate-600 hover:text-slate-900' : 'border-white/15 text-zinc-400 hover:text-white'}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-5 py-2 rounded-full text-xs font-semibold disabled:opacity-50 ${isDay ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-black hover:bg-zinc-200'}`}
              >
                {loading ? 'Submitting...' : 'Send report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  ));
}
