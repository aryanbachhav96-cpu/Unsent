import React, { useState, useEffect } from 'react';
import PageBackground from '../components/PageBackground';
import ReportModal from '../components/ReportModal';
import revealTextTree from '../components/TextReveal';
import { useAuth } from '../context/AuthContext';
import { Disc3, ExternalLink, Heart, Plus, Sparkles, MessageCircle, X, Send } from 'lucide-react';

export default function Music() {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState('All');
  const [composerOpen, setComposerOpen] = useState(false);

  // Form fields
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songLink, setSongLink] = useState('');
  const [whySong, setWhySong] = useState('');
  const [songMood, setSongMood] = useState('Heartbreak');
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [reportState, setReportState] = useState({ isOpen: false, type: 'post', id: null });

  const moods = ['All', 'Heartbreak', 'Healing', 'Late night', 'Nostalgia', 'Rage', 'Calm'];

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts?type=music');
      if (res.ok) {
        const data = await res.json();
        setSongs(data.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
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
        setSongs((prev) =>
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
    if (!songTitle.trim() || !songArtist.trim() || !whySong.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'music',
          topic: 'Music',
          song_title: songTitle.trim(),
          song_artist: songArtist.trim(),
          song_link: songLink.trim() || null,
          song_mood: songMood,
          body: whySong.trim(),
        }),
      });

      if (res.ok) {
        setSongTitle('');
        setSongArtist('');
        setSongLink('');
        setWhySong('');
        setComposerOpen(false);
        fetchSongs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSongs = selectedMood === 'All'
    ? songs
    : songs.filter((s) => s.song_mood === selectedMood);

  // Song of the week is the one with highest feel_count
  const songOfTheWeek = songs.length > 0
    ? [...songs].sort((a, b) => (b.feel_count || 0) - (a.feel_count || 0))[0]
    : null;

  return revealTextTree((
    <div className="relative min-h-screen bg-transparent pt-32 pb-24 px-4 flex flex-col items-center">
      <PageBackground image="/images/img-08.jpg" />

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
            The Soundtrack
          </h1>
          <p className="text-zinc-200 text-sm sm:text-base max-w-lg mx-auto mb-6">
            Melodies that carried words you could never say out loud.
          </p>

          <button
            onClick={() => setComposerOpen(true)}
            className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 active:scale-95 transition-all inline-flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Dedicate a song</span>
          </button>
        </div>

        {/* Featured: Song of the Week */}
        {songOfTheWeek && (
          <div className="liquid-glass rounded-3xl p-6 sm:p-7 border border-white/20 mb-8 text-left relative overflow-hidden">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-3">
              <Sparkles className="w-4 h-4 text-white" />
              <span>Song of the Week — Most Felt</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-3xl text-white text-aura">
                  {songOfTheWeek.song_title}
                </h3>
                <p className="text-zinc-200 text-sm font-medium">
                  {songOfTheWeek.song_artist}
                </p>
                <p className="text-zinc-300 text-sm mt-3 leading-relaxed max-w-xl italic">
                  “{songOfTheWeek.body}”
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                {songOfTheWeek.song_link && (
                  <a
                    href={songOfTheWeek.song_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full border border-white/20 text-xs text-white hover:bg-white/10 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Listen</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <span className="text-xs text-zinc-400">
                  Felt by {songOfTheWeek.feel_count || 0} souls
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mood Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {moods.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMood(m)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedMood === m
                  ? 'bg-white text-black font-semibold'
                  : 'liquid-glass text-zinc-300 hover:text-white border border-white/10'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Dedicate Song Modal */}
        {composerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-lg liquid-glass rounded-3xl p-6 sm:p-8 border border-white/20 text-left">
              <button
                onClick={() => setComposerOpen(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="font-serif text-2xl text-white mb-1">Dedicate a Song</h2>
              <p className="text-xs text-zinc-400 mb-5">
                Share the song and what it meant to you. Outbound links only.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1 font-medium">Song Title</label>
                    <input
                      type="text"
                      required
                      value={songTitle}
                      onChange={(e) => setSongTitle(e.target.value)}
                      placeholder="e.g. Motion Picture Soundtrack"
                      className="w-full liquid-glass rounded-xl p-3 text-sm text-white outline-none border border-white/15 focus:border-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1 font-medium">Artist</label>
                    <input
                      type="text"
                      required
                      value={songArtist}
                      onChange={(e) => setSongArtist(e.target.value)}
                      placeholder="e.g. Radiohead"
                      className="w-full liquid-glass rounded-xl p-3 text-sm text-white outline-none border border-white/15 focus:border-white/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1 font-medium">Outbound Link (Spotify, YouTube, Apple)</label>
                  <input
                    type="url"
                    value={songLink}
                    onChange={(e) => setSongLink(e.target.value)}
                    placeholder="https://open.spotify.com/track/..."
                    className="w-full liquid-glass rounded-xl p-3 text-sm text-white outline-none border border-white/15 focus:border-white/50 placeholder:text-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1 font-medium">Mood</label>
                  <select
                    value={songMood}
                    onChange={(e) => setSongMood(e.target.value)}
                    className="liquid-glass text-white text-xs rounded-full px-3.5 py-2 outline-none border border-white/15"
                  >
                    {moods.filter(m => m !== 'All').map((m) => (
                      <option key={m} value={m} className="bg-zinc-900 text-white">{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1 font-medium">Why this song?</label>
                  <textarea
                    required
                    rows={4}
                    value={whySong}
                    onChange={(e) => setWhySong(e.target.value)}
                    placeholder="What memory or feeling does this carry? Who was it for?"
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
                    {submitting ? 'Sharing...' : 'Dedicate song'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Songs Feed */}
        {loading ? (
          <div className="py-20 text-center text-zinc-400 text-sm">Listening for melodies...</div>
        ) : filteredSongs.length === 0 ? (
          <div className="liquid-glass rounded-3xl p-12 text-center text-zinc-400 text-sm border border-white/10">
            No songs dedicated under {selectedMood} yet.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredSongs.map((song) => (
              <article
                key={song.id}
                className="liquid-glass rounded-3xl p-6 border border-white/15 text-left transition-all hover:border-white/25 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2.5 py-0.5 rounded-full liquid-glass border border-white/10 text-zinc-300">
                        {song.song_mood || 'Track'}
                      </span>
                      <span className="text-xs text-zinc-400">by {song.author_handle}</span>
                    </div>
                    <h3 className="font-serif text-2xl text-white text-aura">{song.song_title}</h3>
                    <p className="text-sm text-zinc-300 font-medium">{song.song_artist}</p>
                  </div>

                  {song.song_link && (
                    <a
                      href={song.song_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full border border-white/15 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Open external link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-line pt-2 border-t border-white/10">
                  {song.body}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-zinc-400">
                  <button
                    onClick={() => handleFeel(song.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                      song.userFelt
                        ? 'bg-white text-black font-medium'
                        : 'liquid-glass hover:bg-white/10 text-zinc-300'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${song.userFelt ? 'fill-black' : ''}`} />
                    <span>I feel this ({song.feel_count || 0})</span>
                  </button>

                  <span className="text-zinc-400">Outbound link only</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  ));
}
