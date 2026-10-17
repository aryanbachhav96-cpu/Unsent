import React from 'react';
import revealTextTree from './TextReveal';

const OBJECT_POSITIONS = {
  'img-01.jpg': '50% 60%',
  'img-02.jpg': '50% 70%',
  'img-03.jpg': '50% 50%',
  'img-04.jpg': '50% 55%',
  'img-05.jpg': '50% 50%',
  'img-06.jpg': '50% 50%',
  'img-08.jpg': '50% 40%',
  'img-10.jpg': '50% 55%',
  'img-11.jpg': '50% 60%',
  'img-12.jpg': '50% 40%',
  'img-13.jpg': '50% 50%',
};

export default function PageBackground({ image = '/images/img-03.jpg' }) {
  const filename = image.split('/').pop();
  const objectPosition = OBJECT_POSITIONS[filename] || '50% 50%';

  return revealTextTree((
    <div
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Jolt container (triggers a 180ms jolt every 11s) */}
      <div className="w-full h-full jolt-container overflow-hidden">
        {/* Handheld shake image layer (scale 1.08 + 7s irregular loop) */}
        <img
          src={image}
          alt=""
          decoding="async"
          style={{ objectPosition }}
          className="unsent-img w-full h-full object-cover handheld-shake"
        />
      </div>

      {/* Scrim overlay breathing between 0.55 and 0.62 opacity */}
      <div className="unsent-scrim absolute inset-0 w-full h-full" />
    </div>
  ));
}
