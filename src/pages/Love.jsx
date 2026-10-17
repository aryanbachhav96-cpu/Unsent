import React, { useState, useEffect } from 'react';
import PageBackground from '../components/PageBackground';
import ReportModal from '../components/ReportModal';
import CrisisModal from '../components/CrisisModal';
import revealTextTree from '../components/TextReveal';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageCircle, Flag, Clock, Plus, Send, X } from 'lucide-react';

export default function Love() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Breakup'); // 'Breakup' | 'Unrequited love' | 'Crush'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Composer modal
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [howLongAgo, setHowLongAgo] = useState('6 months ago');
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [reportState, setReportState] = useState({ isOpen: false, type: 'post', id: null });
  const [crisisOpen, setCrisisOpen] = useState(false);

  const tabs = [
    { id: 'Breakup', label: 'Breakups' },
    { id: 'Unrequited love', label: 'Unrequited Love' },
    { id: 'Crush', label: 'Crushes' },
  ];

  const fetchLovePosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?topic=${encodeURIComponent(activeTab)}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLovePosts();
  }, [activeTab]);

  const handleFeel = async (postId) => {
    try {
      const res = await fetch(`/api/posts/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction_type: 'feel' }),
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
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

  const handleSubmit = async (confirmedCrisis = false) => {
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeTab,
          type: 'story',
          title,
          body,
          how_long_ago: howLongAgo,
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
        setTitle('');
        setBody('');
        setComposerOpen(false);
        fetchLovePosts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return revealTextTree((
    <div className="relative min-h-screen bg-transparent pt-32 pb-24 px-4 flex flex-col items-center">
      <PageBackground image="/images/img-13.jpg" />

      {/* Modals */}
      <CrisisModal
        isOpen={crisisOpen}
        onClose={() => setCrisisOpen(false)}
        onConfirm={() => {
          setCrisisOpen(false);
          handleSubmit(true);
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
            Heart Corner
          </h1>
          <p className="text-zinc-200 text-sm sm:text-base max-w-lg mx-auto mb-6">
            The wounds that never fully closed, the unspoken glances, and the ones who slipped away.
          </p>

          <button
            onClick={() => setComposerOpen(true)}
            className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 active:scale-95 transition-all inline-flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Share a heartbreak or crush</span>
          </button>
        </div>

        {/* Tab Pills */}
        <div className="liquid-glass rounded-full p-1.5 flex max-w-md mx-auto mb-8 border border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-white text-black font-semibold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
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
                Release to {activeTab}
              </h2>
              <p className="text-xs text-zinc-400 mb-5">
                Anonymous confession as {user ? user.handle : 'Anonymous'}
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(false);
                }}
                className="flex flex-col gap-4"
              >
                <div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Subject or memory (optional)"
                    className="w-full bg-transparent border-b border-white/20 pb-2 text-white font-medium outline-none focus:border-white/50 text-sm placeholder:text-zinc-500"
                  />
                </div>

                <div>
                  <textarea
                    required
                    rows={6}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Tell the story of what happened..."
                    className="w-full liquid-glass rounded-2xl p-4 text-white text-sm outline-none border border-white/15 focus:border-white/40 resize-none leading-relaxed placeholder:text-zinc-500"
                  />
                </div>

                {/* How long ago field */}
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs text-zinc-400">How long ago:</span>
                  <input
                    type="text"
                    value={howLongAgo}
                    onChange={(e) => setHowLongAgo(e.target.value)}
                    placeholder="e.g. 3 years ago, last month, this morning"
                    className="flex-1 liquid-glass rounded-full px-3 py-1.5 text-xs text-white outline-none border border-white/15 focus:border-white/40"
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
                    {submitting ? 'Sharing...' : 'Share anonymously'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Posts List */}
        {loading ? (
          <div className="py-20 text-center text-zinc-400 text-sm">Remembering...</div>
        ) : posts.length === 0 ? (
          <div className="liquid-glass rounded-3xl p-12 text-center text-zinc-400 text-sm border border-white/10">
            No memories posted under {activeTab} yet.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="liquid-glass rounded-3xl p-6 sm:p-7 border border-white/15 text-left transition-all duration-200 hover:border-white/25"
              >
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-3 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{post.author_handle}</span>
                    {post.how_long_ago && (
                      <>
                        <span className="text-zinc-400">•</span>
                        <span className="text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{post.how_long_ago}</span>
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setReportState({ isOpen: true, type: 'post', id: post.id })}
                    className="p-1 rounded-full text-zinc-400 hover:text-white"
                    title="Report"
                  >
                    <Flag className="w-3 h-3" />
                  </button>
                </div>

                {post.title && (
                  <h2 className="font-serif text-2xl text-white text-aura mb-2">{post.title}</h2>
                )}

                <p className="text-zinc-100 text-base leading-relaxed whitespace-pre-line mb-5 font-normal">
                  {post.body}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                  <button
                    onClick={() => handleFeel(post.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
                      post.userFelt
                        ? 'bg-white text-black font-semibold'
                        : 'liquid-glass hover:bg-white/10 text-zinc-300'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${post.userFelt ? 'fill-black' : ''}`} />
                    <span>I feel this ({post.feel_count || 0})</span>
                  </button>

                  <span className="text-zinc-400 text-xs">
                    {post.comment_count || 0} reflections
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  ));
}
