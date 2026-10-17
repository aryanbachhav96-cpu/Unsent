import React, { useState, useEffect } from 'react';
import PageBackground from '../components/PageBackground';
import ReportModal from '../components/ReportModal';
import CrisisModal from '../components/CrisisModal';
import revealTextTree from '../components/TextReveal';
import FuzzyText from '../components/FuzzyText';
import { useAuth } from '../context/AuthContext';
import { Eye, ShieldAlert, Heart, Plus, Send, X, AlertTriangle, Moon, CheckCircle2 } from 'lucide-react';

export default function Occult() {
  const { user } = useAuth();
  // Check if user has already accepted interstitial in this session
  const [hasAcceptedInterstitial, setHasAcceptedInterstitial] = useState(() => {
    return sessionStorage.getItem('unsent_occult_ack') === 'true';
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('All');
  const [composerOpen, setComposerOpen] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [occultTag, setOccultTag] = useState('Cult experience');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  // Modals
  const [reportState, setReportState] = useState({ isOpen: false, type: 'post', id: null });
  const [crisisOpen, setCrisisOpen] = useState(false);

  const tags = ['All', 'Cult experience', 'Paranormal', 'Occult beliefs', 'Dreams'];

  const handleAccept = () => {
    sessionStorage.setItem('unsent_occult_ack', 'true');
    setHasAcceptedInterstitial(true);
  };

  const fetchOccultPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts?type=occult');
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
    if (hasAcceptedInterstitial) {
      fetchOccultPosts();
    }
  }, [hasAcceptedInterstitial]);

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
    setNotice('');

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'occult',
          topic: occultTag,
          title,
          body,
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
        if (data.warningNotice) {
          setNotice(data.warningNotice);
        }
        fetchOccultPosts();
      } else {
        setNotice(data.error || 'Could not post.');
      }
    } catch {
      setNotice('Unable to connect.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPosts = selectedTag === 'All'
    ? posts
    : posts.filter((p) => p.topic === selectedTag);

  return revealTextTree((
    <div className="relative min-h-screen bg-transparent pt-32 pb-24 px-4 flex flex-col items-center">
      <PageBackground image="/images/img-05.jpg" />

      {/* Interstitial Gate Modal */}
      {!hasAcceptedInterstitial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="relative w-full max-w-lg liquid-glass rounded-3xl p-7 sm:p-9 border border-white/20 text-left shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Moon className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-serif text-3xl text-white text-aura">The Dark Corner</h2>
            </div>

            <p className="text-zinc-200 text-sm sm:text-base leading-relaxed mb-6 font-normal">
              This section covers cults, the occult and unsettling experiences. It is for sharing experiences and discussion only.
            </p>

            <div className="liquid-glass rounded-2xl p-4 mb-6 border border-white/15 text-xs text-zinc-300 flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold text-white">
                <AlertTriangle className="w-4 h-4 text-zinc-400" />
                <span>Strict Boundary Rules:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-zinc-300">
                <li>No ritual instructions or spell-casting guides.</li>
                <li>No recruiting or membership links for groups.</li>
                <li>Argue with ideas and share lived experiences only.</li>
              </ul>
            </div>

            <button
              onClick={handleAccept}
              className="w-full py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I understand & wish to enter</span>
            </button>
          </div>
        </div>
      )}

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
          <h1
            aria-label="The Dark Corner"
            className="font-serif text-white text-aura mb-2 flex justify-center"
          >
            <FuzzyText
              data-skip-text-reveal
              decorative
              fontSize="clamp(1.75rem, 7.5vw, 3.75rem)"
              fontFamily="Georgia, serif"
              baseIntensity={0.12}
              hoverIntensity={0.45}
              fuzzRange={22}
              transitionDuration={180}
              direction="both"
              className="max-w-full"
            >
              The Dark Corner
            </FuzzyText>
          </h1>
          <p className="text-zinc-200 text-sm sm:text-base max-w-lg mx-auto mb-6">
            Lived accounts of high-control groups, the unexplainable, and dreams that lingered.
          </p>

          <button
            onClick={() => setComposerOpen(true)}
            className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 active:scale-95 transition-all inline-flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Share an Experience</span>
          </button>
        </div>

        {notice && (
          <div className="liquid-glass border border-white/20 p-3 rounded-2xl mb-6 text-xs text-zinc-200 text-center">
            {notice}
          </div>
        )}

        {/* Tag Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none justify-center">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? 'bg-white text-black font-semibold'
                  : 'liquid-glass text-zinc-300 hover:text-white border border-white/10'
              }`}
            >
              {tag}
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

              <h2 className="font-serif text-2xl text-white mb-1">Share an Experience</h2>
              <p className="text-xs text-zinc-400 mb-5">
                Personal testimony only. No ritual steps or recruitment.
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
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">Topic Tag</label>
                  <select
                    value={occultTag}
                    onChange={(e) => setOccultTag(e.target.value)}
                    className="liquid-glass text-white text-xs rounded-full px-3.5 py-2 outline-none border border-white/15"
                  >
                    {tags.filter(t => t !== 'All').map((t) => (
                      <option key={t} value={t} className="bg-zinc-900 text-white">{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <textarea
                    required
                    rows={6}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Describe what happened, what you observed, or how you survived..."
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
                    {submitting ? 'Sharing...' : 'Share experience'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Posts List */}
        {loading ? (
          <div className="py-20 text-center text-zinc-400 text-sm">Approaching the dark...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="liquid-glass rounded-3xl p-12 text-center text-zinc-400 text-sm border border-white/10">
            No experiences shared under {selectedTag} yet.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="liquid-glass rounded-3xl p-6 sm:p-7 border border-white/15 text-left transition-all hover:border-white/25"
              >
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-3 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{post.author_handle}</span>
                    <span className="text-zinc-400">•</span>
                    <span className="px-2 py-0.5 rounded-full liquid-glass border border-white/10 text-zinc-300">
                      {post.topic}
                    </span>
                  </div>

                  <button
                    onClick={() => setReportState({ isOpen: true, type: 'post', id: post.id })}
                    className="p-1 rounded-full text-zinc-400 hover:text-white"
                    title="Report"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
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

                  <span className="text-zinc-400 text-xs">Strictly moderated</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  ));
}
