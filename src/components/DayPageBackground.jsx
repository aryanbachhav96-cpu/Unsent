import React from 'react';

export default function DayPageBackground({ image }) {
  return (
    <div className="fixed inset-0 z-0 w-full h-full pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="day-room-image-wrap jolt-container w-full h-full overflow-hidden">
        <img src={image} alt="" className="day-room-image day-media-image handheld-shake w-full h-full object-cover" />
      </div>
      <div className="day-room-scrim absolute inset-0" />
    </div>
  );
}
