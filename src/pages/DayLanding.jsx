import React from 'react';
import { ArrowDown } from 'lucide-react';
import FlowingMenu from '../components/FlowingMenu';
import LandingControls from '../components/LandingControls';
import revealTextTree from '../components/TextReveal';
import DAY_ROOMS from '../data/dayRooms';

export default function DayLanding() {
  return revealTextTree((
    <div className="w-full">
      <LandingControls mode="day" />

      <main className="w-full min-h-screen max-w-5xl mx-auto px-4 flex flex-col items-center justify-center text-center pt-8 pb-20">
        <h1
          className="font-serif font-normal text-slate-950 tracking-[-2.46px] leading-[1.05] mb-5 select-none drop-shadow-sm"
          style={{ fontSize: 'clamp(48px, 8.5vw, 104px)' }}
        >
          Light upon the <em className="italic font-serif">unspoken</em>
        </h1>

        <p className="text-slate-900 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-medium">
          A daytime space to explore curiosities, theories, and life perspectives under clear sky.
        </p>

        <a
          href="#day-explore-menu"
          className="scroll-explore-cue inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-800 transition-colors hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900"
        >
          <span>Scroll to explore</span>
          <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
        </a>
      </main>

      <div id="day-explore-menu" className="scroll-mt-8">
        <FlowingMenu
          items={[
            { text: 'Day Feed', link: '/day/feed', image: '/images/day/day-06.jpg' },
            { text: 'My Profile', link: '/day/profile', image: '/images/day/day-04.jpg' },
            ...DAY_ROOMS.map((room) => ({
              text: room.title,
              link: `/day/r/${room.slug}`,
              image: room.img,
            })),
            { text: 'All Day Rooms', link: '/day/rooms', image: '/images/day/day-03.jpg' },
            { text: 'Night Mode', link: '/night', image: '/images/img-01.jpg' },
          ]}
          theme="day"
          title="Explore Day Rooms"
        />
      </div>
    </div>
  ));
}
