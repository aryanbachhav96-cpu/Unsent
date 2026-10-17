import React, { useState, useEffect } from 'react';
import PageBackground from '../components/PageBackground';
import ReportModal from '../components/ReportModal';
import revealTextTree from '../components/TextReveal';
import { useAuth } from '../context/AuthContext';
import { PhoneCall, Globe, Eye, EyeOff, Heart, Wind, ShieldAlert, CheckCircle, ChevronDown, Sparkles } from 'lucide-react';

export default function Healing() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState({});

  // Active Tool: 'breathing' | 'grounding' | null
  const [activeTool, setActiveTool] = useState(null);

  // Box Breathing state
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale'); // Inhale, Hold, Exhale, Hold
  const [phaseSeconds, setPhaseSeconds] = useState(4);

  // 5-4-3-2-1 Grounding checked items
  const [groundingChecks, setGroundingChecks] = useState({});

  // Report modal
  const [reportState, setReportState] = useState({ isOpen: false, type: 'post', id: null });

  useEffect(() => {
    let interval = null;
    if (isBreathing) {
      interval = setInterval(() => {
        setPhaseSeconds((prev) => {
          if (prev <= 1) {
            setBreathPhase((currentPhase) => {
              if (currentPhase === 'Inhale') return 'Hold (lungs full)';
              if (currentPhase === 'Hold (lungs full)') return 'Exhale';
              if (currentPhase === 'Exhale') return 'Hold (empty)';
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathing]);

  const fetchHealingStories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts?topic=Trauma');
      if (res.ok) {
        const data = await res.json();
        setStories(data.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealingStories();
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
        setStories((prev) =>
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

  const groundingSteps = [
    { count: 5, sense: 'Things you can SEE', hint: 'Notice a shadow, a grain of wood, a speck of light.' },
    { count: 4, sense: 'Things you can TOUCH', hint: 'Feel the fabric of your sleeve, the cool floor, your own fingertips.' },
    { count: 3, sense: 'Things you can HEAR', hint: 'Distant traffic, hum of a fan, your own breath.' },
    { count: 2, sense: 'Things you can SMELL', hint: 'The air, paper, morning coffee, rain.' },
    { count: 1, sense: 'Thing you can TASTE', hint: 'A sip of cold water, or simply the presence of your own mouth.' },
  ];

  return revealTextTree((
    <div className="relative min-h-screen bg-transparent pt-32 pb-24 px-4 flex flex-col items-center">
      <PageBackground image="/images/img-11.jpg" />

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
            Healing Space
          </h1>
          <p className="text-zinc-200 text-sm sm:text-base max-w-lg mx-auto mb-6">
            A quiet sanctuary for trauma, recovery, and learning to breathe again.
          </p>
        </div>

        {/* Pinned "Get Help Now" Card */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-7 border border-white/20 mb-8 text-left shadow-2xl">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-3">
            <PhoneCall className="w-4 h-4 text-white" />
            <span>Get Help Now — 24/7 Crisis Support</span>
          </div>

          <p className="text-zinc-200 text-sm sm:text-base leading-relaxed mb-4">
            If you are carrying pain that feels too heavy right now, gentle, confidential voices are waiting to listen:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="liquid-glass rounded-2xl p-4 border border-white/10 flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400">India (Free & Toll-Free 24/7)</span>
              <a
                href="tel:14416"
                className="text-lg font-bold text-white hover:underline flex items-center gap-2"
              >
                <span>Tele-MANAS: 14416</span>
              </a>
              <span className="text-xs text-zinc-400">or 1800 891 4416</span>
            </div>

            <div className="liquid-glass rounded-2xl p-4 border border-white/10 flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400">Global Helplines</span>
              <a
                href="https://findahelpline.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-semibold text-white hover:underline flex items-center gap-1.5"
              >
                <span>findahelpline.com</span>
                <Globe className="w-3.5 h-3.5" />
              </a>
              <span className="text-xs text-zinc-400">Free, confidential support in 130+ countries</span>
            </div>
          </div>

          {/* Medical disclaimer */}
          <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-2 border-t border-white/10">
            <ShieldAlert className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>Community posts here share personal journeys only and do not constitute clinical or medical advice.</span>
          </div>
        </div>

        {/* Interactive Grounding & Calming Tools */}
        <div className="mb-10 text-left">
          <h2 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-3">
            Grounding Tools
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setActiveTool(activeTool === 'breathing' ? null : 'breathing')}
              className={`p-4 rounded-2xl liquid-glass border text-left transition-all ${
                activeTool === 'breathing' ? 'border-white bg-white/10' : 'border-white/15 hover:border-white/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Wind className="w-4 h-4 text-white" />
                  <span>Box-Breathing Guide</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${activeTool === 'breathing' ? 'rotate-180' : ''}`} />
              </div>
              <p className="text-xs text-zinc-400">Visual 4-4-4-4 pacing to reset your nervous system.</p>
            </button>

            <button
              onClick={() => setActiveTool(activeTool === 'grounding' ? null : 'grounding')}
              className={`p-4 rounded-2xl liquid-glass border text-left transition-all ${
                activeTool === 'grounding' ? 'border-white bg-white/10' : 'border-white/15 hover:border-white/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>5-4-3-2-1 Sensory Reset</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${activeTool === 'grounding' ? 'rotate-180' : ''}`} />
              </div>
              <p className="text-xs text-zinc-400">Step-by-step checklist to pull you back into the room.</p>
            </button>
          </div>

          {/* Tool 1: Box-Breathing Widget */}
          {activeTool === 'breathing' && (
            <div className="liquid-glass rounded-3xl p-8 border border-white/20 mb-8 text-center flex flex-col items-center">
              <h3 className="font-serif text-2xl text-white mb-1">Box Breathing (4-4-4-4)</h3>
              <p className="text-xs text-zinc-300 max-w-sm mb-6">
                Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s.
              </p>

              {/* Animated Pacing Circle */}
              <div className="relative w-48 h-48 rounded-full flex items-center justify-center my-4 liquid-glass border border-white/20">
                <div
                  className={`absolute rounded-full border border-white/40 transition-all duration-1000 ${
                    breathPhase.startsWith('Inhale')
                      ? 'w-44 h-44 bg-white/15'
                      : breathPhase.startsWith('Hold')
                      ? 'w-44 h-44 bg-white/20'
                      : 'w-24 h-24 bg-white/5'
                  }`}
                />
                <div className="relative z-10 text-center">
                  <span className="text-lg font-serif text-white block">{breathPhase}</span>
                  <span className="text-3xl font-light text-white">{phaseSeconds}s</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (isBreathing) {
                    setIsBreathing(false);
                    setBreathPhase('Inhale');
                    setPhaseSeconds(4);
                  } else {
                    setIsBreathing(true);
                  }
                }}
                className="mt-4 px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all"
              >
                {isBreathing ? 'Pause breathing' : 'Start box breathing'}
              </button>
            </div>
          )}

          {/* Tool 2: 5-4-3-2-1 Grounding Widget */}
          {activeTool === 'grounding' && (
            <div className="liquid-glass rounded-3xl p-6 sm:p-7 border border-white/20 mb-8 text-left">
              <h3 className="font-serif text-2xl text-white mb-2">5-4-3-2-1 Grounding Method</h3>
              <p className="text-xs text-zinc-300 mb-6">
                Take a breath. Look around your space and gently acknowledge each item.
              </p>

              <div className="flex flex-col gap-3">
                {groundingSteps.map((step) => {
                  const isDone = !!groundingChecks[step.count];
                  return (
                    <div
                      key={step.count}
                      onClick={() =>
                        setGroundingChecks((prev) => ({ ...prev, [step.count]: !isDone }))
                      }
                      className={`liquid-glass rounded-2xl p-4 border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isDone ? 'border-white/40 bg-white/10' : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="mt-0.5">
                        <CheckCircle
                          className={`w-5 h-5 ${isDone ? 'text-white fill-white/20' : 'text-zinc-500'}`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white">{step.count}</span>
                          <span className="text-sm text-zinc-200 font-medium">{step.sense}</span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{step.hint}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Stories of Survival and Recovery */}
        <div className="text-left mb-6">
          <h2 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-1">
            Trauma & Recovery Stories
          </h2>
          <p className="text-xs text-zinc-400">Content warning is active by default.</p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-zinc-400 text-sm">Gathering quiet strength...</div>
        ) : stories.length === 0 ? (
          <div className="liquid-glass rounded-3xl p-12 text-center text-zinc-400 text-sm border border-white/10">
            No recovery stories shared yet.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {stories.map((story) => {
              const isBlurred = !revealed[story.id];
              return (
                <article
                  key={story.id}
                  className="liquid-glass rounded-3xl p-6 sm:p-7 border border-white/15 text-left transition-all hover:border-white/25"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-3 pb-2 border-b border-white/10">
                    <span className="font-medium text-white">{story.author_handle}</span>
                    <button
                      onClick={() => setReportState({ isOpen: true, type: 'post', id: story.id })}
                      className="text-zinc-500 hover:text-white"
                      title="Report"
                    >
                      Report
                    </button>
                  </div>

                  {story.title && (
                    <h3 className="font-serif text-2xl text-white text-aura mb-2">{story.title}</h3>
                  )}

                  {/* Blur-to-reveal content warning ON by default */}
                  {isBlurred ? (
                    <div className="relative rounded-2xl overflow-hidden py-10 px-6 border border-white/10 text-center flex flex-col items-center justify-center gap-3">
                      <div className="filter blur-md select-none opacity-30 line-clamp-3 text-sm">
                        {story.body}
                      </div>
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 p-4 z-10">
                        <span className="text-xs text-zinc-300">
                          Personal account of trauma and healing
                        </span>
                        <button
                          onClick={() => setRevealed((prev) => ({ ...prev, [story.id]: true }))}
                          className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-all flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Reveal account</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-zinc-100 text-base leading-relaxed whitespace-pre-line mb-2 font-normal">
                        {story.body}
                      </p>
                      <button
                        onClick={() => setRevealed((prev) => ({ ...prev, [story.id]: false }))}
                        className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 mb-4"
                      >
                        <EyeOff className="w-3 h-3" />
                        <span>Re-blur account</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                    <button
                      onClick={() => handleFeel(story.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                        story.userFelt
                          ? 'bg-white text-black font-semibold'
                          : 'liquid-glass hover:bg-white/10 text-zinc-300'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${story.userFelt ? 'fill-black' : ''}`} />
                      <span>I feel this ({story.feel_count || 0})</span>
                    </button>

                    <span className="text-zinc-500">Healing & Ground</span>
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
