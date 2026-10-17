import React, { useState, useEffect } from 'react';
import PageBackground from '../components/PageBackground';
import ReportModal from '../components/ReportModal';
import CrisisModal from '../components/CrisisModal';
import revealTextTree from '../components/TextReveal';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, Scale, MessageSquare, Flag, Plus, Send, X, ShieldAlert } from 'lucide-react';

export default function Thoughts() {
  const { user } = useAuth();
  const [thoughts, setThoughts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Composer
  const [composerOpen, setComposerOpen] = useState(false);
  const [claim, setClaim] = useState('');
  const [take, setTake] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Comments
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLists, setCommentLists] = useState({});

  // Modals
  const [reportState, setReportState] = useState({ isOpen: false, type: 'post', id: null });
  const [crisisOpen, setCrisisOpen] = useState(false);

  const fetchThoughts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts?type=thought');
      if (res.ok) {
        const data = await res.json();
        setThoughts(data.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThoughts();
  }, []);

  const handleReaction = async (postId, type) => {
    try {
      const res = await fetch(`/api/posts/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction_type: type }),
      });
      if (res.ok) {
        const data = await res.json();
        setThoughts((prev) =>
          prev.map((p) => {
            if (p.id === postId) {
              const delta = data.reacted ? 1 : -1;
              if (type === 'agree') {
                return {
                  ...p,
                  userAgreed: data.reacted,
                  agree_count: Math.max(0, (p.agree_count || 0) + delta),
                };
              } else {
                return {
                  ...p,
                  userDiffered: data.reacted,
                  different_count: Math.max(0, (p.different_count || 0) + delta),
                };
              }
            }
            return p;
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostSubmit = async (confirmedCrisis = false) => {
    if (!claim.trim() || !take.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'thought',
          topic: 'Deep thought',
          title: claim.trim(),
          body: take.trim(),
          confirmedCrisis,
        }),
      });
      const data = await res.json();
      if (data.needsCrisisConfirmation) {
        setCrisisOpen(true);
        setSubmitting(false);
        return;
      }
      if (res.ok) {
        setClaim('');
        setTake('');
        setComposerOpen(false);
        fetchThoughts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleComments = async (postId) => {
    const isExpanded = !!expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: !isExpanded }));
    if (!isExpanded && !commentLists[postId]) {
      try {
        const res = await fetch(`/api/posts/${postId}/comments`);
        if (res.ok) {
          const data = await res.json();
          setCommentLists((prev) => ({ ...prev, [postId]: data.comments || [] }));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddComment = async (postId) => {
    const body = commentInputs[postId] || '';
    if (!body.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (res.ok && data.comment) {
        setCommentLists((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.comment],
        }));
        setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return revealTextTree((
    <div className="relative min-h-screen bg-transparent pt-32 pb-24 px-4 flex flex-col items-center">
      <PageBackground image="/images/img-02.jpg" />

      {/* Modals */}
      <CrisisModal
        isOpen={crisisOpen}
        onClose={() => setCrisisOpen(false)}
        onConfirm={() => {
          setCrisisOpen(false);
          handlePostSubmit(true);
        }}
      />

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
            Perspectives
          </h1>
          <p className="text-zinc-200 text-sm sm:text-base max-w-lg mx-auto mb-6">
            Reflections on existence, society, and the human condition.
          </p>

          <button
            onClick={() => setComposerOpen(true)}
            className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 active:scale-95 transition-all inline-flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Offer a Perspective</span>
          </button>
        </div>

        {/* Civil Discourse Banner */}
        <div className="liquid-glass rounded-2xl p-4 mb-8 border border-white/10 flex items-center justify-center gap-2 text-xs text-zinc-300">
          <Scale className="w-4 h-4 text-white shrink-0" />
          <span>Sanctuary principle: <strong className="text-white">Argue with ideas, not people.</strong></span>
        </div>

        {/* Composer Modal */}
        {composerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-lg liquid-glass rounded-3xl p-6 sm:p-8 border border-white/20 text-left">
              <button
                onClick={() => setComposerOpen(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="font-serif text-2xl text-white mb-1">
                A New Perspective
              </h2>
              <p className="text-xs text-zinc-400 mb-5">
                Argue with ideas, not people.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePostSubmit(false);
                }}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1 font-medium">
                    The Claim
                  </label>
                  <input
                    type="text"
                    required
                    value={claim}
                    onChange={(e) => setClaim(e.target.value)}
                    placeholder="e.g. Modern loneliness is not a lack of people, but a lack of presence."
                    className="w-full liquid-glass rounded-xl p-3 text-sm text-white placeholder:text-zinc-500 outline-none border border-white/15 focus:border-white/50"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1 font-medium">
                    Your Take / Reasoning
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={take}
                    onChange={(e) => setTake(e.target.value)}
                    placeholder="Unpack your thought calmly and with care..."
                    className="w-full liquid-glass rounded-2xl p-4 text-white text-sm outline-none border border-white/15 focus:border-white/40 resize-none leading-relaxed placeholder:text-zinc-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setComposerOpen(false)}
                    className="px-4 py-2 rounded-full border border-white/15 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? 'Posting...' : 'Publish perspective'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Thoughts List */}
        {loading ? (
          <div className="py-20 text-center text-zinc-400 text-sm">Contemplating...</div>
        ) : thoughts.length === 0 ? (
          <div className="liquid-glass rounded-3xl p-12 text-center text-zinc-400 text-sm border border-white/10">
            No perspectives shared yet. Begin the conversation.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {thoughts.map((item) => (
              <article
                key={item.id}
                className="liquid-glass rounded-3xl p-6 sm:p-7 border border-white/15 text-left transition-all duration-200 hover:border-white/25"
              >
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-3 pb-2 border-b border-white/10">
                  <span className="font-medium text-white">{item.author_handle}</span>
                  <button
                    onClick={() => setReportState({ isOpen: true, type: 'post', id: item.id })}
                    className="p-1 rounded-full text-zinc-400 hover:text-white"
                    title="Report"
                  >
                    <Flag className="w-3 h-3" />
                  </button>
                </div>

                {/* Claim headline */}
                <h2 className="font-serif text-2xl sm:text-3xl text-white text-aura mb-3 leading-snug">
                  “{item.title}”
                </h2>

                <p className="text-zinc-100 text-base leading-relaxed whitespace-pre-line mb-6 font-normal">
                  {item.body}
                </p>

                {/* Reaction buttons: "I agree" and "I see it differently" */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReaction(item.id, 'agree')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                        item.userAgreed
                          ? 'bg-white text-black font-semibold'
                          : 'liquid-glass hover:bg-white/10 text-zinc-200'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>I agree ({item.agree_count || 0})</span>
                    </button>

                    <button
                      onClick={() => handleReaction(item.id, 'different')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                        item.userDiffered
                          ? 'bg-white text-black font-semibold'
                          : 'liquid-glass hover:bg-white/10 text-zinc-200'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>I see it differently ({item.different_count || 0})</span>
                    </button>
                  </div>

                  <button
                    onClick={() => toggleComments(item.id)}
                    className="flex items-center gap-1 text-zinc-300 hover:text-white transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Civil discourse ({item.comment_count || 0})</span>
                  </button>
                </div>

                {/* Comments */}
                {expandedComments[item.id] && (
                  <div className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-3">
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                      {(commentLists[item.id] || []).length === 0 ? (
                        <p className="text-xs text-zinc-400 italic">No responses yet. Add your take civilly.</p>
                      ) : (
                        commentLists[item.id].map((c) => (
                          <div
                            key={c.id}
                            className="liquid-glass rounded-2xl p-3 text-xs border border-white/10 flex flex-col gap-1"
                          >
                            <span className="font-medium text-white">{c.author_handle}</span>
                            <p className="text-zinc-200 text-sm whitespace-pre-wrap">{c.body}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={commentInputs[item.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(item.id);
                        }}
                        placeholder="Share your reasoning with care..."
                        className="flex-1 liquid-glass rounded-full px-4 py-2 text-xs text-white placeholder:text-zinc-500 outline-none border border-white/15 focus:border-white/40"
                      />
                      <button
                        onClick={() => handleAddComment(item.id)}
                        className="p-2 rounded-full bg-white text-black hover:bg-zinc-200"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  ));
}
