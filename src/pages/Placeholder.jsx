import React from 'react';
import PageBackground from '../components/PageBackground';
import revealTextTree from '../components/TextReveal';

export default function Placeholder({ title, subtitle, image = '/images/img-03.jpg' }) {
  return revealTextTree((
    <div className="relative min-h-screen bg-transparent pt-28 pb-16 px-4 flex flex-col justify-between">
      <PageBackground image={image} />

      <div className="relative z-10 max-w-4xl mx-auto text-center pt-8">
        <h1 className="font-serif text-4xl sm:text-6xl text-white text-aura mb-4">{title}</h1>
        <p className="text-zinc-200 text-lg max-w-xl mx-auto text-aura-sm">{subtitle}</p>
        <div className="mt-12 liquid-glass p-8 rounded-3xl max-w-md mx-auto text-zinc-300 text-sm">
          Preparing this sanctuary for you...
        </div>
      </div>
    </div>
  ));
}
