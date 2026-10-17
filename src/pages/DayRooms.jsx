import React from 'react';
import { Link } from 'react-router-dom';
import revealTextTree from '../components/TextReveal';
import DAY_ROOMS from '../data/dayRooms';

export default function DayRooms() {
  return revealTextTree((
    <div className="w-full max-w-5xl mx-auto px-4 text-left pt-6">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-5xl sm:text-6xl font-medium text-slate-950 tracking-tight mb-4">
          All Day Rooms
        </h1>
        <p className="text-slate-900 text-lg max-w-lg mx-auto font-medium">
          Choose a room to explore its stories, questions, and perspectives.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {DAY_ROOMS.map((room) => (
          <Link
            key={room.slug}
            to={`/day/r/${room.slug}`}
            className="day-room-link rounded-full px-5 py-3 text-base font-semibold text-slate-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-800"
          >
            {room.title}
          </Link>
        ))}
      </div>
    </div>
  ));
}
