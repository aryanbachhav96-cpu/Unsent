import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Flag,
  Heart,
  MessageCircle,
  Send,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import DayPageBackground from '../components/DayPageBackground';
import CrisisModal from '../components/CrisisModal';
import H3Heading from '../components/H3Heading';
import ReportModal from '../components/ReportModal';
import revealTextTree from '../components/TextReveal';
import { useAuth } from '../context/AuthContext';
import DAY_ROOMS from '../data/dayRooms';

export default function DayRoomDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const room = DAY_ROOMS.find((dayRoom) => dayRoom.slug === slug);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [roomError, setRoomError] = useState('');
  const [formError, setFormError] = useState('');
  const [actionError, setActionError] = useState('');
  const [submitNotice, setSubmitNotice] = useState('');
  const [newPostText, setNewPostText] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [contentWarning, setContentWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [revealedWarnings, setRevealedWarnings] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLists, setCommentLists] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [commentErrors, setCommentErrors] = useState({});
  const [commentSubmitting, setCommentSubmitting] = useState({});
  const [reportState, setReportState] = useState({ isOpen: false, type: 'post', id: null });
  const [crisisAction, setCrisisAction] = useState(null);

  const fetchRoomPosts = async () => {
    if (!room) return;
    setLoading(true);
    setRoomError('');
    try {
      const res = await fetch(`/api/posts?topic=${encodeURIComponent(room.topic)}&sort=${sortBy}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not load this room.');
      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
      setRoomError(err instanceof Error ? err.message : 'Could not load this room.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (room) fetchRoomPosts();
    else setLoading(false);
  }, [slug, sortBy]);

  const shareThought = async (confirmedCrisis = false) => {
    if (!newPostText.trim()) {
      setFormError('Write a thought before sharing it.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    setSubmitNotice('');
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPostTitle.trim() || null,
          body: newPostText.trim(),
          topic: room.topic,
          type: 'story',
          content_warning: contentWarning ? 1 : 0,
          confirmedCrisis,
        }),
      });
      const data = await res.json();

      if (data.needsCrisisConfirmation) {
        setCrisisAction({ type: 'post' });
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Could not share your thought.');

      setNewPostText('');
      setNewPostTitle('');
      setContentWarning(false);
      setSubmitNotice(data.warningNotice || '');
      await fetchRoomPosts();
    } catch (err) {
      console.error(err);
      setFormError(err instanceof Error ? err.message : 'Could not share your thought.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    shareThought();
  };

  const handleFeel = async (postId) => {
    setActionError('');
    try {
      const res = await fetch(`/api/posts/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction_type: 'feel' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not record your reaction.');

      setPosts((previous) =>
        previous.map((post) => {
          if (post.id !== postId) return post;
          return {
            ...post,
            userFelt: data.reacted,
            feel_count: Math.max(0, (post.feel_count || 0) + (data.reacted ? 1 : -1)),
          };
        })
      );
    } catch (err) {
      console.error(err);
      setActionError(err instanceof Error ? err.message : 'Could not record your reaction.');
    }
  };

  const toggleComments = async (postId) => {
    const isExpanded = Boolean(expandedComments[postId]);
    setExpandedComments((previous) => ({ ...previous, [postId]: !isExpanded }));
    if (isExpanded || commentLists[postId]) return;

    setLoadingComments((previous) => ({ ...previous, [postId]: true }));
    setCommentErrors((previous) => ({ ...previous, [postId]: '' }));
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not load replies.');
      setCommentLists((previous) => ({ ...previous, [postId]: data.comments || [] }));
    } catch (err) {
      console.error(err);
      setCommentErrors((previous) => ({
        ...previous,
        [postId]: err instanceof Error ? err.message : 'Could not load replies.',
      }));
    } finally {
      setLoadingComments((previous) => ({ ...previous, [postId]: false }));
    }
  };

  const submitComment = async (postId, confirmedCrisis = false) => {
    const body = commentInputs[postId] || '';
    if (!body.trim()) return;

    setCommentSubmitting((previous) => ({ ...previous, [postId]: true }));
    setCommentErrors((previous) => ({ ...previous, [postId]: '' }));
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim(), confirmedCrisis }),
      });
      const data = await res.json();
      if (data.needsCrisisConfirmation) {
        setCrisisAction({ type: 'comment', postId });
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Could not post your reply.');
      if (!data.comment) throw new Error('The reply was not returned by the server.');

      setCommentLists((previous) => ({
        ...previous,
        [postId]: [...(previous[postId] || []), data.comment],
      }));
      setCommentInputs((previous) => ({ ...previous, [postId]: '' }));
      setPosts((previous) =>
        previous.map((post) =>
          post.id === postId
            ? { ...post, comment_count: (post.comment_count || 0) + 1 }
            : post
        )
      );
    } catch (err) {
      console.error(err);
      setCommentErrors((previous) => ({
        ...previous,
        [postId]: err instanceof Error ? err.message : 'Could not post your reply.',
      }));
    } finally {
      setCommentSubmitting((previous) => ({ ...previous, [postId]: false }));
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to permanently remove this thought?')) return;
    setActionError('');
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not delete this thought.');
      setPosts((previous) => previous.filter((post) => post.id !== postId));
    } catch (err) {
      console.error(err);
      setActionError(err instanceof Error ? err.message : 'Could not delete this thought.');
    }
  };

  if (!room) return <Navigate to="/day/rooms" replace />;

  return revealTextTree((
    <div className="relative w-full max-w-4xl mx-auto px-4 text-left">
      <DayPageBackground image={room.img} />
      <ReportModal
        isOpen={reportState.isOpen}
        targetType={reportState.type}
        targetId={reportState.id}
        variant="day"
        onClose={() => setReportState({ isOpen: false, type: 'post', id: null })}
      />
      <CrisisModal
        isOpen={Boolean(crisisAction)}
        variant="day"
        onClose={() => setCrisisAction(null)}
        onConfirm={() => {
          const action = crisisAction;
          setCrisisAction(null);
          if (action?.type === 'post') shareThought(true);
          if (action?.type === 'comment') submitComment(action.postId, true);
        }}
      />

      <Link
        to="/day/rooms"
        className="relative z-10 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 hover:text-black mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>All Day Rooms</span>
      </Link>

      <div className="relative z-10 text-center mb-8">
        <h1 className="font-serif text-5xl sm:text-6xl font-medium text-slate-950 tracking-tight mb-4">
          {room.title}
        </h1>
        <p className="text-slate-950 text-base sm:text-lg font-medium max-w-2xl mx-auto">
          {room.desc}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 day-glass rounded-3xl p-6 mb-8 shadow-sm flex flex-col gap-3">
        <H3Heading className="font-serif text-slate-950">Post to this room</H3Heading>
        <input
          type="text"
          value={newPostTitle}
          onChange={(event) => setNewPostTitle(event.target.value)}
          maxLength={120}
          placeholder="Thought title or observation (optional)"
          aria-label="Thought title (optional)"
          className="w-full px-4 py-2.5 rounded-full bg-white/70 text-slate-900 text-sm outline-none border border-black/10 focus:border-black/30 placeholder:text-slate-400"
        />
        <textarea
          required
          rows={3}
          value={newPostText}
          onChange={(event) => setNewPostText(event.target.value)}
          placeholder="What do you observe or hypothesize?"
          aria-label="Your thought"
          className="w-full p-4 rounded-2xl bg-white/70 text-slate-900 text-sm outline-none border border-black/10 focus:border-black/30 placeholder:text-slate-400 resize-y"
        />
        <label className="flex items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={contentWarning}
            onChange={(event) => setContentWarning(event.target.checked)}
            className="accent-slate-900"
          />
          Mark this thought as sensitive
        </label>
        {formError && <p role="alert" className="text-sm text-red-700">{formError}</p>}
        {submitNotice && <p role="status" className="text-sm text-slate-700">{submitNotice}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-full bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Posting...' : 'Share thought'}</span>
          </button>
        </div>
      </form>

      {actionError && <p role="alert" className="mb-4 text-sm text-red-700">{actionError}</p>}

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>Showing {posts.length} perspectives</span>
          <div className="day-glass rounded-full p-1 flex">
            <button
              type="button"
              onClick={() => setSortBy('newest')}
              aria-pressed={sortBy === 'newest'}
              className={`px-3 py-1 rounded-full transition-all ${
                sortBy === 'newest' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Newest
            </button>
            <button
              type="button"
              onClick={() => setSortBy('felt')}
              aria-pressed={sortBy === 'felt'}
              className={`px-3 py-1 rounded-full transition-all ${
                sortBy === 'felt' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Most felt
            </button>
          </div>
        </div>
        {loading ? (
          <p className="py-12 text-center text-xs text-slate-500">Loading room perspectives...</p>
        ) : roomError ? (
          <p role="alert" className="day-glass rounded-3xl p-8 text-center text-sm text-red-700">
            {roomError}
          </p>
        ) : posts.length === 0 ? (
          <div className="day-glass rounded-3xl p-10 text-center text-slate-500 text-xs">
            No perspectives shared in this room yet. Be the first to share.
          </div>
        ) : (
          posts.map((post) => {
            const warningHidden = post.content_warning && !revealedWarnings[post.id];
            const canDelete = post.isOwner || user?.role === 'admin';

            return (
              <article key={post.id} className="day-glass rounded-3xl p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-800">{post.author_handle}</span>
                    <span aria-hidden="true">•</span>
                    <span>{post.topic}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => deletePost(post.id)}
                        className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-black/5 transition-colors"
                        title="Permanently delete thought"
                        aria-label="Permanently delete thought"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setReportState({ isOpen: true, type: 'post', id: post.id })}
                      className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-black/5 transition-colors"
                      title="Report this thought"
                      aria-label="Report this thought"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {post.title && (
                  <h2 className="font-serif text-xl text-slate-900 mb-2">{post.title}</h2>
                )}
                <div className="relative mb-4">
                  {warningHidden ? (
                    <div className="relative rounded-2xl overflow-hidden py-8 px-5 border border-black/10 text-center">
                      <p aria-hidden="true" className="blur-md select-none opacity-40 line-clamp-3 text-slate-700">
                        {post.body}
                      </p>
                      <div className="absolute inset-0 bg-white/75 flex flex-col items-center justify-center gap-2 p-4">
                        <div className="flex items-center gap-2 text-xs text-slate-700">
                          <ShieldAlert className="w-4 h-4" />
                          <span>This post includes sensitive experiences.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRevealedWarnings((previous) => ({ ...previous, [post.id]: true }))}
                          className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Read anyway</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                        {post.body}
                      </p>
                      {post.content_warning ? (
                        <button
                          type="button"
                          onClick={() => setRevealedWarnings((previous) => ({ ...previous, [post.id]: false }))}
                          className="mt-2 text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                        >
                          <EyeOff className="w-3 h-3" />
                          <span>Re-hide content</span>
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-black/10 text-xs text-slate-600">
                  <button
                    type="button"
                    onClick={() => handleFeel(post.id)}
                    aria-pressed={Boolean(post.userFelt)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                      post.userFelt
                        ? 'bg-slate-900 text-white font-semibold shadow'
                        : 'bg-white/40 hover:bg-white/70 text-slate-700'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.userFelt ? 'fill-white stroke-white' : 'stroke-current'}`} />
                    <span>I feel this</span>
                    <span className="opacity-80">({post.feel_count || 0})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleComments(post.id)}
                    aria-expanded={Boolean(expandedComments[post.id])}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-black/5 text-slate-600 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Replies ({post.comment_count || 0})</span>
                  </button>
                </div>

                {expandedComments[post.id] && (
                  <div className="mt-5 pt-4 border-t border-black/10 flex flex-col gap-3">
                    {loadingComments[post.id] ? (
                      <p className="text-xs text-slate-500 py-2">Loading replies...</p>
                    ) : commentErrors[post.id] && !commentLists[post.id] ? (
                      <p role="alert" className="text-xs text-red-700 py-2">{commentErrors[post.id]}</p>
                    ) : (
                      <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
                        {(commentLists[post.id] || []).length === 0 ? (
                          <p className="text-xs text-slate-500 py-1 italic">No replies yet. Leave a gentle word.</p>
                        ) : (
                          commentLists[post.id].map((comment) => (
                            <div key={comment.id} className="bg-white/40 rounded-2xl p-3 text-xs border border-black/5 flex flex-col gap-1">
                              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                                <span className="font-medium text-slate-800">{comment.author_handle}</span>
                                <button
                                  type="button"
                                  onClick={() => setReportState({ isOpen: true, type: 'comment', id: comment.id })}
                                  className="hover:text-slate-900"
                                  title="Report reply"
                                  aria-label="Report reply"
                                >
                                  <Flag className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-slate-700 text-sm whitespace-pre-wrap">{comment.body}</p>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {commentErrors[post.id] && commentLists[post.id] && (
                      <p role="alert" className="text-xs text-red-700">{commentErrors[post.id]}</p>
                    )}
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        submitComment(post.id);
                      }}
                      className="flex items-center gap-2 pt-1"
                    >
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(event) => setCommentInputs((previous) => ({ ...previous, [post.id]: event.target.value }))}
                        placeholder="Reply anonymously..."
                        aria-label={`Reply to ${post.author_handle}`}
                        className="flex-1 bg-white/60 rounded-full px-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none border border-black/10 focus:border-black/30"
                      />
                      <button
                        type="submit"
                        disabled={commentSubmitting[post.id]}
                        className="p-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 active:scale-95 transition-all"
                        title="Post reply"
                        aria-label="Post reply"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  ));
}
