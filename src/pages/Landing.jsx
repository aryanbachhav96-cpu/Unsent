import React from 'react';
import { ArrowDown } from 'lucide-react';
import LoopingVideo from '../components/LoopingVideo';
import FlowingMenu from '../components/FlowingMenu';
import LandingControls from '../components/LandingControls';
import revealTextTree from '../components/TextReveal';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { text: 'Stories Feed', link: '/stories', image: '/images/img-03.jpg' },
  { text: 'My Profile', link: '/my', image: '/images/img-05.jpg' },
  { text: 'Unsent Letters', link: '/letters', image: '/images/img-02.jpg' },
  { text: 'Heart Corner', link: '/love', image: '/images/img-05.jpg' },
  { text: 'Perspectives', link: '/thoughts', image: '/images/img-08.jpg' },
  { text: 'The Soundtrack', link: '/music', image: '/images/img-06.jpg' },
  { text: 'The Shelf', link: '/books', image: '/images/img-10.jpg' },
  { text: 'The Dark Corner', link: '/occult', image: '/images/img-11.jpg' },
  { text: 'Healing Space', link: '/healing', image: '/images/img-12.jpg' },
  { text: 'Explore Rooms', link: '/explore', image: '/images/img-13.jpg' },
  { text: 'Write Anonymously', link: '/write', image: '/images/img-04.jpg' },
  { text: 'Guidelines', link: '/guidelines', image: '/images/img-01.jpg' },
  { text: 'Day Mode', link: '/', image: '/images/day/day-01.jpg' },
];

export default function Landing() {
  const { user } = useAuth();
  const landingMenuItems = [
    ...menuItems,
    ...(user?.role === 'admin'
      ? [{ text: 'Admin Console', link: '/admin', image: '/images/img-13.jpg' }]
      : []),
  ];

  return revealTextTree((
    <div className="relative w-full bg-transparent">
      <LandingControls mode="night" />

      {/* Background Hero Video: night-hero.mp4 at full opacity, no filter, no scrim */}
      <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <LoopingVideo
          src="/video/night-hero.mp4"
          playbackRate={0.5}
          fallbackImage="/images/img-01.jpg"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main Hero Content */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-16 pb-20 text-center max-w-4xl mx-auto w-full">
        {/* Headline */}
        <h1
          className="font-serif font-normal text-white text-aura tracking-tight leading-[1.08] mb-6 select-none"
          style={{ fontSize: 'clamp(44px, 9vw, 104px)' }}
        >
          Say what you never <em className="italic font-serif">sent</em>
        </h1>

        {/* Subline */}
        <p className="text-zinc-100 text-lg sm:text-xl font-normal max-w-2xl mx-auto leading-relaxed mb-10 text-aura">
          A quiet place to share your story, your heartbreak or your strangest thoughts. Anonymous, unjudged, and heard.
        </p>

        <a
          href="#night-explore-menu"
          className="scroll-explore-cue inline-flex items-center gap-2 text-sm font-medium tracking-wide text-white/80 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <span>Scroll to explore</span>
          <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
        </a>
      </main>

      <div id="night-explore-menu" className="relative z-10 scroll-mt-8">
        <FlowingMenu items={landingMenuItems} theme="night" title="Find your space" />
      </div>
    </div>
  ));
}
