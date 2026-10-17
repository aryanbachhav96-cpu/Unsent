import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageBackground from '../components/PageBackground';
import revealTextTree from '../components/TextReveal';
import { useAuth } from '../context/AuthContext';
import { Lock, Trash2, Heart, ExternalLink, ShieldCheck, Feather, BookOpen, Music, FileText } from 'lucide-react';

export default function My({ mode = 'night' }) {
  const isDay = mode === 'day';
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stories'); // 'stories' | 'vault' | 'music_books'
  const [myPosts, setMyPosts] = useState([]);
  const [vaultLetters, setVaultLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyContent = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [resPosts, resVault] = await Promise.all([
        fetch('/api/posts/my-content'),
        fetch('/api/posts/my-vault'),
      ]);

      if (resPosts.ok) {
        const data = await resPosts.json();
        setMyPosts(data.posts || []);
      }
      if (resVault.ok) {
        const data = await resVault.json();
        setVaultLetters(data.letters || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyContent();
  }, [user]);

  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm(
      'Permanently delete this from your sanctuary? It will be removed immediately from all records.'
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        setMyPosts((prev) => prev.filter((p) => p.id !== postId));
        setVaultLetters((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return revealTextTree((
      <div className={`relative min-h-screen bg-transparent pt-36 pb-20 px-4 flex flex-col items-center ${isDay ? 'day-profile' : ''}`}>
        {!isDay && <PageBackground image="/images/img-12.jpg" />}
        <div className="relative z-10 w-full max-w-md liquid-glass rounded-3xl p-8 border border-white/15 text-center shadow-2xl">
          <Lock className="w-8 h-8 text-white mx-auto mb-3" />
          <h1 className="font-serif text-3xl text-white mb-2">Private Dashboard</h1>
          <p className="text-zinc-300 text-sm mb-6">
            Log in to access your private letters vault, track your stories, or delete your content anytime.
          </p>
          <Link
            to={isDay ? '/auth?mode=login&theme=day' : '/auth'}
            className="w-full py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 block transition-all"
          >
            Log in or create space
          </Link>
        </div>
      </div>
    ));
  }

  const storiesOnly = myPosts.filter((p) => p.type !== 'music' && p.type !== 'book' && p.visibility !== 'vault');
  const musicBooksOnly = myPosts.filter((p) => p.type === 'music' || p.type === 'book');

  return revealTextTree((
    <div className={`relative min-h-screen bg-transparent pt-32 pb-24 px-4 flex flex-col items-center ${isDay ? 'day-profile' : ''}`}>
      {!isDay && <PageBackground image="/images/img-12.jpg" />}

      <div className="relative z-10 w-full max-w-3xl mx-auto">
        {/* Header with Handle & Privacy details */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/15 mb-8 text-left shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Public Handle</span>
              <h1 className="font-serif text-3xl sm:text-4xl text-white text-aura mt-0.5">
                {user.handle}
              </h1>
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>Email hidden from public view • Content can be permanently deleted anytime</span>
              </p>
            </div>

            <Link
              to="/write"
              className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 self-start sm:self-auto transition-all"
            >
              Write new
            </Link>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="liquid-glass rounded-full p-1.5 flex max-w-lg mx-auto mb-8 border border-white/10 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('stories')}
            className={`flex-none whitespace-nowrap px-2.5 py-2 text-xs sm:flex-1 sm:px-3 sm:text-sm font-medium rounded-full transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'stories' ? 'bg-white text-black font-semibold shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Stories ({storiesOnly.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex-none whitespace-nowrap px-2.5 py-2 text-xs sm:flex-1 sm:px-3 sm:text-sm font-medium rounded-full transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'vault' ? 'bg-white text-black font-semibold shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Letters Vault ({vaultLetters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('music_books')}
            className={`flex-none whitespace-nowrap px-2.5 py-2 text-xs sm:flex-1 sm:px-3 sm:text-sm font-medium rounded-full transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'music_books' ? 'bg-white text-black font-semibold shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Sound & Shelf ({musicBooksOnly.length})</span>
          </button>
        </div>

        {/* Tab 1: Stories & Confessions */}
        {activeTab === 'stories' && (
          <div className="flex flex-col gap-4 text-left">
            {storiesOnly.length === 0 ? (
              <div className="liquid-glass rounded-3xl p-12 text-center text-zinc-400 text-sm border border-white/10">
                You haven't posted any stories yet.
              </div>
            ) : (
              storiesOnly.map((post) => (
                <div
                  key={post.id}
                  className="liquid-glass rounded-3xl p-6 border border-white/15 flex flex-col gap-3 relative"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="px-2.5 py-0.5 rounded-full liquid-glass border border-white/10 text-zinc-300">
                      {post.topic || 'Story'}
                    </span>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                      title="Permanently delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {post.title && (
                    <h3 className="font-serif text-xl text-white">{post.title}</h3>
                  )}

                  <p className="text-zinc-200 text-sm whitespace-pre-line leading-relaxed">
                    {post.body}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-zinc-400">
                    <span>Felt by {post.feel_count || 0} souls</span>
                    <span className="text-[11px] text-zinc-500">Public story</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Letters Vault (Private, Strictly Owner-Only) */}
        {activeTab === 'vault' && (
          <div className="flex flex-col gap-4 text-left">
            <div className="liquid-glass rounded-2xl p-4 border border-white/10 text-xs text-zinc-300 flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>
                These letters are private to your eyes only. The server never returns them on any public feed or search.
              </span>
            </div>

            {vaultLetters.length === 0 ? (
              <div className="liquid-glass rounded-3xl p-12 text-center text-zinc-400 text-sm border border-white/10">
                Your letters vault is empty. When writing an Unsent Letter, choose "Keep private" to seal it here.
              </div>
            ) : (
              vaultLetters.map((letter) => (
                <div
                  key={letter.id}
                  className="liquid-glass rounded-3xl p-6 border border-white/15 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-white/10 pb-2">
                    <span className="font-serif text-lg text-white">
                      Dear {letter.addressee || 'You'},
                    </span>
                    <button
                      onClick={() => handleDelete(letter.id)}
                      className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10"
                      title="Permanently delete from vault"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-zinc-200 text-base leading-relaxed whitespace-pre-line font-normal">
                    {letter.body}
                  </p>

                  <div className="pt-2 border-t border-white/10 text-xs text-zinc-400 flex items-center justify-between">
                    <span className="italic">{letter.sign_off || 'Always,'}</span>
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Vault Sealed</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Dedicated Songs & Books */}
        {activeTab === 'music_books' && (
          <div className="flex flex-col gap-4 text-left">
            {musicBooksOnly.length === 0 ? (
              <div className="liquid-glass rounded-3xl p-12 text-center text-zinc-400 text-sm border border-white/10">
                You haven't dedicated any songs or shelved any books yet.
              </div>
            ) : (
              musicBooksOnly.map((item) => (
                <div
                  key={item.id}
                  className="liquid-glass rounded-3xl p-6 border border-white/15 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="px-2.5 py-0.5 rounded-full liquid-glass border border-white/10 text-zinc-300 uppercase tracking-wider text-[10px]">
                      {item.type}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10"
                      title="Permanently delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-serif text-xl text-white">
                    {item.song_title || item.book_title}
                  </h3>
                  <p className="text-xs text-zinc-300">
                    {item.song_artist || item.book_author}
                  </p>
                  <p className="text-zinc-200 text-sm italic mt-2">
                    “{item.body}”
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  ));
}
