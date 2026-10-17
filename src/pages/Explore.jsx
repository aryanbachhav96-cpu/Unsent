import React from 'react';
import { Link } from 'react-router-dom';
import PageBackground from '../components/PageBackground';
import revealTextTree from '../components/TextReveal';

export default function Explore() {
  const rooms = [
    { title: 'Stories Feed', path: '/stories', img: '/images/img-03.jpg', desc: 'All public stories and confessions from strangers.' },
    { title: 'The Writing Room', path: '/write', img: '/images/img-10.jpg', desc: 'Distraction-free space to speak your unspoken truth.' },
    { title: 'Unsent Letters', path: '/letters', img: '/images/img-04.jpg', desc: 'Words meant for someone you could never send them to.' },
    { title: 'Heart Corner', path: '/love', img: '/images/img-13.jpg', desc: 'Breakups, unrequited love, and quiet crushes.' },
    { title: 'Perspectives', path: '/thoughts', img: '/images/img-02.jpg', desc: 'Civil reflections on events and the human condition.' },
    { title: 'The Soundtrack', path: '/music', img: '/images/img-08.jpg', desc: 'Songs carrying the words you could not find.' },
    { title: 'The Shelf', path: '/books', img: '/images/img-06.jpg', desc: 'Pages to hold when the silence feels too heavy.' },
    { title: 'The Dark Corner', path: '/occult', img: '/images/img-05.jpg', desc: 'Cults, the occult, and unsettling lived experiences.' },
    { title: 'Healing Space', path: '/healing', img: '/images/img-11.jpg', desc: 'Trauma, recovery, grounding tools, and quiet peace.' },
  ];

  return revealTextTree((
    <div className="relative min-h-screen bg-transparent pt-32 pb-24 px-4 flex flex-col items-center">
      <PageBackground image="/images/img-03.jpg" />

      <div className="relative z-10 w-full max-w-5xl mx-auto text-left">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl sm:text-6xl text-white text-aura mb-3">
            Wander the Rooms
          </h1>
          <p className="text-zinc-200 text-sm sm:text-base max-w-lg mx-auto">
            Nine quiet sanctuaries within Unsent. Choose where you need to be.
          </p>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Link
              key={room.path}
              to={room.path}
              className="group liquid-glass rounded-3xl overflow-hidden border border-white/15 hover:border-white/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-full aspect-video overflow-hidden bg-black/40">
                  <img
                    src={room.img}
                    alt={room.title}
                    loading="lazy"
                    decoding="async"
                    className="unsent-img w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h2 className="font-serif text-2xl text-white text-aura mb-1 group-hover:text-zinc-100">
                    {room.title}
                  </h2>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {room.desc}
                  </p>
                </div>
              </div>
              <div className="p-6 pt-0 text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>Enter sanctuary</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  ));
}
