import React, { useState, useEffect } from 'react';
import PageBackground from '../components/PageBackground';
import ReportModal from '../components/ReportModal';
import CrisisModal from '../components/CrisisModal';
import revealTextTree from '../components/TextReveal';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageCircle, Flag, Eye, EyeOff, Trash2, Send, ShieldAlert } from 'lucide-react';

export default function Stories({ mode = 'night' }) {
  const isDay = mode === 'day';
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'felt'

  // Revealed content warnings map
  const [revealedWarnings, setRevealedWarnings] = useState({});

  // Active comment trays
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLists, setCommentLists] = useState({});
  const [loadingComments, setLoadingComments] = useState({});

  // Report modal state
  const [reportState, setReportState] = useState({ isOpen: false, type: 'post', id: null });

  // Crisis modal for comments
  const [crisisState, setCrisisState] = useState({ isOpen: false, postId: null, pendingBody: '' });

  const topics = [
    'All',
    'Breakup',
    'Unrequited love',
    'Crush',
    'Trauma',
    'Deep thought',
    'Opinion',
    'Occult',
    'Other',
  ];

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const topicParam = activeTopic !== 'All' ? `&topic=${encodeURIComponent(activeTopic)}` : '';
      const res = await fetch(`/api/posts?sort=${sortBy}${topicParam}`);
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
    fetchPosts();
  }, [activeTopic, sortBy]);

  // Reaction handler: "I feel this"
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
              const countChange = data.reacted ? 1 : -1;
              return {
                ...p,
                userFelt: data.reacted,
                feel_count: Math.max(0, (p.feel_count || 0) + countChange),
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

  // Toggle comments
  const toggleComments = async (postId) => {
    const isExpanded = !!expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: !isExpanded }));

    if (!isExpanded && !commentLists[postId]) {
      setLoadingComments((prev) => ({ ...prev, [postId]: true }));
      try {
        const res = await fetch(`/api/posts/${postId}/comments`);
        if (res.ok) {
          const data = await res.json();
          setCommentLists((prev) => ({ ...prev, [postId]: data.comments || [] }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingComments((prev) => ({ ...prev, [postId]: false }));
      }
    }
  };

  // Submit comment
  const handleCommentSubmit = async (postId, confirmedCrisis = false) => {
    const body = commentInputs[postId] || '';
    if (!body.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, confirmedCrisis }),
      });

      const data = await res.json();
      if (data.needsCrisisConfirmation) {
        setCrisisState({ isOpen: true, postId, pendingBody: body });
        return;
      }

      if (res.ok && data.comment) {
        setCommentLists((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.comment],
        }));
        setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete own post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to permanently remove this from the sanctuary?')) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return revealTextTree((
    <div className={`feed-page relative min-h-screen bg-transparent pt-32 pb-24 px-4 flex flex-col items-center ${isDay ? 'day-feed' : ''}`}>
      {!isDay && <PageBackground image="/images/img-03.jpg" />}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportState.isOpen}
        targetType={reportState.type}
        targetId={reportState.id}
        onClose={() => setReportState({ isOpen: false, type: 'post', id: null })}
      />

      {/* Crisis Intervention Modal for Comments */}
      <CrisisModal
        isOpen={crisisState.isOpen}
        onClose={() => setCrisisState({ isOpen: false, postId: null, pendingBody: '' })}
        onConfirm={() => {
          const { postId } = crisisState;
          setCrisisState({ isOpen: false, postId: null, pendingBody: '' });
          handleCommentSubmit(postId, true);
        }}
      />

      <div className="relative z-10 w-full max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl sm:text-6xl text-white text-aura mb-2">
            The Feed
          </h1>
          <p className="text-zinc-200 text-sm sm:text-base max-w-lg mx-auto">
            {isDay
              ? 'Stories and thoughts shared openly under the light.'
              : 'Words that were held back, released quietly into the dark.'}
          </p>
        </div>

        {/* Controls: Filter chips & Sort pills */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Topic chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTopic(t)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  activeTopic === t
                    ? 'bg-white text-black font-semibold'
                    : 'liquid-glass text-zinc-300 hover:text-white border border-white/10'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Sort controls */}
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Showing {posts.length} confessions</span>
            <div className="liquid-glass rounded-full p-1 flex border border-white/10">
              <button
                onClick={() => setSortBy('newest')}
                className={`px-3 py-1 rounded-full transition-all ${
                  sortBy === 'newest' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setSortBy('felt')}
                className={`px-3 py-1 rounded-full transition-all ${
                  sortBy === 'felt' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Most felt
              </button>
            </div>
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="py-20 text-center text-zinc-400 text-sm">
            Listening for unsent words...
          </div>
        ) : posts.length === 0 ? (
          <div className="liquid-glass rounded-3xl p-12 text-center text-zinc-400 text-sm border border-white/10">
            No unsent stories here yet. Be the first to speak.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {posts.map((post) => {
              const isWarningHidden = post.content_warning && !revealedWarnings[post.id];
              const isOwnerOrAdmin = post.isOwner || (user && user.role === 'admin');

              return (
                <article
                  key={post.id}
                  className="liquid-glass rounded-3xl p-6 sm:p-7 border border-white/15 text-left transition-all duration-200 hover:border-white/25 relative"
                >
                  {/* Top row: Handle, Topic, Time & Actions */}
                  <div className="flex items-center justify-between gap-2 mb-4 text-xs text-zinc-400">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white">{post.author_handle}</span>
                      <span className="text-zinc-400">•</span>
                      <span className="px-2.5 py-0.5 rounded-full liquid-glass border border-white/10 text-zinc-300">
                        {post.topic || 'Story'}
                      </span>
                      {post.how_long_ago && (
                        <>
                          <span className="text-zinc-400">•</span>
                          <span className="text-zinc-400">{post.how_long_ago}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isOwnerOrAdmin && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-white/10 transition-colors"
                          title="Permanently delete post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setReportState({ isOpen: true, type: 'post', id: post.id })}
                        className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Report this post"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title (if present) */}
                  {post.title && (
                    <h2 className="font-serif text-2xl text-white text-aura mb-2.5">
                      {post.title}
                    </h2>
                  )}

                  {/* Body with Content Warning Blur-to-reveal */}
                  <div className="relative mb-5">
                    {isWarningHidden ? (
                      <div className="relative rounded-2xl overflow-hidden py-10 px-6 border border-white/10 text-center flex flex-col items-center justify-center gap-3">
                        <div className="filter blur-md select-none opacity-40 line-clamp-3">
                          {post.body}
                        </div>
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2.5 p-4 z-10">
                          <div className="flex items-center gap-2 text-xs text-zinc-300">
                            <ShieldAlert className="w-4 h-4 text-zinc-400" />
                            <span>This post includes sensitive experiences.</span>
                          </div>
                          <button
                            onClick={() =>
                              setRevealedWarnings((prev) => ({ ...prev, [post.id]: true }))
                            }
                            className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-all flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Read anyway</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-zinc-100 text-base leading-relaxed whitespace-pre-line font-normal">
                          {post.body}
                        </p>
                        {post.content_warning ? (
                          <button
                            onClick={() =>
                              setRevealedWarnings((prev) => ({ ...prev, [post.id]: false }))
                            }
                            className="mt-2 text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                          >
                            <EyeOff className="w-3 h-3" />
                            <span>Re-hide content</span>
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Action Bar: "I feel this" + Comments button */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-zinc-300">
                    <button
                      onClick={() => handleFeel(post.id)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                        post.userFelt
                          ? 'bg-white text-black font-semibold shadow'
                          : 'liquid-glass hover:bg-white/10 text-zinc-200'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${post.userFelt ? 'fill-black stroke-black' : 'stroke-current'}`}
                      />
                      <span>I feel this</span>
                      <span className="opacity-80">({post.feel_count || 0})</span>
                    </button>

                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 text-zinc-300 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Replies ({post.comment_count || 0})</span>
                    </button>
                  </div>

                  {/* Comments Tray */}
                  {expandedComments[post.id] && (
                    <div className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-3">
                      {loadingComments[post.id] ? (
                        <p className="text-xs text-zinc-400 py-2">Loading quiet replies...</p>
                      ) : (
                        <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
                          {(commentLists[post.id] || []).length === 0 ? (
                            <p className="text-xs text-zinc-400 py-1 italic">
                              No replies yet. Leave a gentle word.
                            </p>
                          ) : (
                            commentLists[post.id].map((c) => (
                              <div
                                key={c.id}
                                className="liquid-glass rounded-2xl p-3 text-xs border border-white/10 flex flex-col gap-1"
                              >
                                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                                  <span className="font-medium text-white">{c.author_handle}</span>
                                  <button
                                    onClick={() =>
                                      setReportState({ isOpen: true, type: 'comment', id: c.id })
                                    }
                                    className="hover:text-zinc-200"
                                    title="Report comment"
                                  >
                                    <Flag className="w-3 h-3" />
                                  </button>
                                </div>
                                <p className="text-zinc-200 text-sm whitespace-pre-wrap">{c.body}</p>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* Add comment input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCommentSubmit(post.id);
                          }}
                          placeholder="Reply anonymously..."
                          className="flex-1 liquid-glass rounded-full px-4 py-2 text-xs text-white placeholder:text-zinc-500 outline-none border border-white/15 focus:border-white/40"
                        />
                        <button
                          onClick={() => handleCommentSubmit(post.id)}
                          className="p-2 rounded-full bg-white text-black hover:bg-zinc-200 active:scale-95 transition-all"
                          title="Post reply"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  ));
}
