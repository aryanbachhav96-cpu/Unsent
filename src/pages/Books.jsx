import React, { useState, useEffect } from 'react';
import PageBackground from '../components/PageBackground';
import ReportModal from '../components/ReportModal';
import revealTextTree from '../components/TextReveal';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Heart, Plus, X, Bookmark, ExternalLink } from 'lucide-react';

export default function Books() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('All');
  const [composerOpen, setComposerOpen] = useState(false);

  // Form fields
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [moodTag, setMoodTag] = useState('Heartbroken');
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Report Modal
  const [reportState, setReportState] = useState({ isOpen: false, type: 'post', id: null });

  // Fallback map for failed image loads
  const [coverErrors, setCoverErrors] = useState({});

  const tags = ['All', 'Heartbroken', 'Lost', 'Healing', 'Curious', 'Angry'];

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts?type=book');
      if (res.ok) {
        const data = await res.json();
        setBooks(data.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleFeel = async (postId) => {
    try {
      const res = await fetch(`/api/posts/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction_type: 'feel' }),
      });
      if (res.ok) {
        const data = await res.json();
        setBooks((prev) =>
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bookTitle.trim() || !bookAuthor.trim() || !review.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'book',
          topic: 'Book',
          book_title: bookTitle.trim(),
          book_author: bookAuthor.trim(),
          book_mood_tag: moodTag,
          body: review.trim(),
        }),
      });

      if (res.ok) {
        setBookTitle('');
        setBookAuthor('');
        setReview('');
        setComposerOpen(false);
        fetchBooks();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBooks = selectedTag === 'All'
    ? books
    : books.filter((b) => b.book_mood_tag === selectedTag);

  return revealTextTree((
    <div className="relative min-h-screen bg-transparent pt-32 pb-24 px-4 flex flex-col items-center">
      <PageBackground image="/images/img-06.jpg" />

      <ReportModal
        isOpen={reportState.isOpen}
        targetType={reportState.type}
        targetId={reportState.id}
        onClose={() => setReportState({ isOpen: false, type: 'post', id: null })}
      />

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl sm:text-6xl text-white text-aura mb-2">
            The Shelf
          </h1>
          <p className="text-zinc-200 text-sm sm:text-base max-w-lg mx-auto mb-6">
            Books to hold when the silence feels too heavy. Read it when you need to be found.
          </p>

          <button
            onClick={() => setComposerOpen(true)}
            className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 active:scale-95 transition-all inline-flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Recommend a book</span>
          </button>
        </div>

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
              {tag === 'All' ? 'All books' : `Read when ${tag.toLowerCase()}`}
            </button>
          ))}
        </div>

        {/* Recommend Book Modal */}
        {composerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-lg liquid-glass rounded-3xl p-6 sm:p-8 border border-white/20 text-left">
              <button
                onClick={() => setComposerOpen(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="font-serif text-2xl text-white mb-1">Recommend a Book</h2>
              <p className="text-xs text-zinc-400 mb-5">
                Share a volume that stayed with you through the night.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1 font-medium">Book Title</label>
                    <input
                      type="text"
                      required
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      placeholder="e.g. The Year of Magical Thinking"
                      className="w-full liquid-glass rounded-xl p-3 text-sm text-white outline-none border border-white/15 focus:border-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1 font-medium">Author</label>
                    <input
                      type="text"
                      required
                      value={bookAuthor}
                      onChange={(e) => setBookAuthor(e.target.value)}
                      placeholder="e.g. Joan Didion"
                      className="w-full liquid-glass rounded-xl p-3 text-sm text-white outline-none border border-white/15 focus:border-white/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1 font-medium">Read it when you're...</label>
                  <select
                    value={moodTag}
                    onChange={(e) => setMoodTag(e.target.value)}
                    className="liquid-glass text-white text-xs rounded-full px-3.5 py-2 outline-none border border-white/15"
                  >
                    {tags.filter(t => t !== 'All').map((t) => (
                      <option key={t} value={t} className="bg-zinc-900 text-white">{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1 font-medium">Your Review / Why this book?</label>
                  <textarea
                    required
                    rows={4}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="What did these pages heal or break open in you?"
                    className="w-full liquid-glass rounded-2xl p-3 text-sm text-white outline-none border border-white/15 focus:border-white/50 resize-none placeholder:text-zinc-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
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
                    {submitting ? 'Shelving...' : 'Place on Shelf'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Books Grid */}
        {loading ? (
          <div className="py-20 text-center text-zinc-400 text-sm">Browsing the shelf...</div>
        ) : filteredBooks.length === 0 ? (
          <div className="liquid-glass rounded-3xl p-12 text-center text-zinc-400 text-sm border border-white/10">
            No books found for this mood yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            {filteredBooks.map((book) => {
              // Open Library keyless cover endpoint by title
              const coverUrl = `https://covers.openlibrary.org/b/id/${book.id + 1000}-M.jpg?default=false`;
              const hasCoverError = !!coverErrors[book.id];

              return (
                <article
                  key={book.id}
                  className="liquid-glass rounded-3xl p-6 border border-white/15 flex flex-col justify-between hover:border-white/25 transition-all"
                >
                  <div>
                    {/* Header: Tag & Handle */}
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-3 pb-2 border-b border-white/10">
                      <span className="px-2.5 py-0.5 rounded-full liquid-glass border border-white/10 text-zinc-300">
                        Read when {book.book_mood_tag?.toLowerCase() || 'reflective'}
                      </span>
                      <span>by {book.author_handle}</span>
                    </div>

                    {/* Book Cover (with Open Library and graceful fallback) */}
                    <div className="flex gap-4 items-start mb-4">
                      {!hasCoverError ? (
                        <div className="w-20 h-28 rounded-xl overflow-hidden liquid-glass border border-white/15 shrink-0 relative bg-black/40">
                          <img
                            src={coverUrl}
                            alt=""
                            onError={() => setCoverErrors((prev) => ({ ...prev, [book.id]: true }))}
                            className="w-full h-full object-cover unsent-img"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-28 rounded-xl liquid-glass border border-white/10 shrink-0 flex flex-col items-center justify-center p-2 text-center bg-black/40">
                          <BookOpen className="w-5 h-5 text-zinc-500 mb-1" />
                          <span className="text-[9px] text-zinc-400 line-clamp-2">{book.book_title}</span>
                        </div>
                      )}

                      <div className="flex-1">
                        <h3 className="font-serif text-2xl text-white text-aura leading-snug">
                          {book.book_title}
                        </h3>
                        <p className="text-xs text-zinc-300 font-medium mt-1">
                          {book.book_author}
                        </p>
                      </div>
                    </div>

                    {/* Review Body */}
                    <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-line font-normal italic">
                      “{book.body}”
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10 text-xs">
                    <button
                      onClick={() => handleFeel(book.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                        book.userFelt
                          ? 'bg-white text-black font-medium'
                          : 'liquid-glass hover:bg-white/10 text-zinc-300'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${book.userFelt ? 'fill-black' : ''}`} />
                      <span>I feel this ({book.feel_count || 0})</span>
                    </button>

                    <button
                      onClick={() => setReportState({ isOpen: true, type: 'post', id: book.id })}
                      className="text-zinc-500 hover:text-white text-xs"
                    >
                      Report
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  ));
}
