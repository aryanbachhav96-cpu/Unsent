import React, { useRef, useState, useEffect } from 'react';
import revealTextTree from './TextReveal';

function shouldUseFallback() {
  if (typeof window === 'undefined') return false;

  return (
    window.matchMedia('(max-width: 768px)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    Boolean(navigator.connection?.saveData)
  );
}

/**
 * LoopingVideo: Seamless video looper using two stacked <video> elements.
 * At (duration - 1s), starts the other video from 0 and crossfades over 1s,
 * preventing visible jump cuts.
 */
export default function LoopingVideo({
  src,
  fallbackImage,
  playbackRate = 0.5,
  className = 'w-full h-full object-cover',
}) {
  const [useFallback, setUseFallback] = useState(shouldUseFallback);
  const [activeSlot, setActiveSlot] = useState(0); // 0 or 1
  const [slotOpacities, setSlotOpacities] = useState([1, 0]);

  const v0Ref = useRef(null);
  const v1Ref = useRef(null);
  const activeSlotRef = useRef(0);
  const crossfadingRef = useRef(false);

  useEffect(() => {
    const v0 = v0Ref.current;
    const v1 = v1Ref.current;
    if (!v0 || !v1) return;

    v0.muted = true;
    v1.muted = true;
    v0.playbackRate = playbackRate;
    v1.playbackRate = playbackRate;

    const playVideo = (v) => {
      if (!v) return;
      v.muted = true;
      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Retry on user interaction if initial autoplay was blocked
          const onUserGesture = () => {
            v.muted = true;
            v.play().catch(() => {});
            window.removeEventListener('click', onUserGesture);
            window.removeEventListener('touchstart', onUserGesture);
          };
          window.addEventListener('click', onUserGesture, { once: true });
          window.addEventListener('touchstart', onUserGesture, { once: true });
        });
      }
    };

    playVideo(v0);

    // Handle tab visibility
    const handleVisibility = () => {
      if (document.hidden) {
        v0.pause();
        v1.pause();
      } else {
        if (activeSlotRef.current === 0) playVideo(v0);
        else playVideo(v1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    let crossfadeTimeout;

    const checkLoop = () => {
      const currentSlot = activeSlotRef.current;
      const activeVideo = currentSlot === 0 ? v0 : v1;
      const nextVideo = currentSlot === 0 ? v1 : v0;

      if (activeVideo && activeVideo.duration && activeVideo.duration > 1.2) {
        const timeLeft = activeVideo.duration - activeVideo.currentTime;

        // Crossfade trigger 1s before end
        if (timeLeft <= 1.0 && !crossfadingRef.current) {
          crossfadingRef.current = true;
          nextVideo.currentTime = 0;
          nextVideo.muted = true;
          nextVideo.playbackRate = playbackRate;
          nextVideo.play().then(() => {
            setSlotOpacities(currentSlot === 0 ? [0, 1] : [1, 0]);
            crossfadeTimeout = window.setTimeout(() => {
              const nextSlot = currentSlot === 0 ? 1 : 0;
              activeSlotRef.current = nextSlot;
              setActiveSlot(nextSlot);
              crossfadingRef.current = false;
            }, 1000);
          }).catch(() => {
            crossfadingRef.current = false;
          });
        }
      }
    };

    v0.addEventListener('timeupdate', checkLoop);
    v1.addEventListener('timeupdate', checkLoop);

    return () => {
      window.clearTimeout(crossfadeTimeout);
      v0.removeEventListener('timeupdate', checkLoop);
      v1.removeEventListener('timeupdate', checkLoop);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [src, playbackRate, useFallback]);

  if (useFallback && fallbackImage) {
    return <img src={fallbackImage} alt="" className={className} decoding="async" />;
  }

  return revealTextTree((
    <div className="relative w-full h-full overflow-hidden pointer-events-none select-none">
      {/* Video Slot 0 */}
      <video
        ref={v0Ref}
        src={src}
        autoPlay
        muted
        playsInline
        preload="metadata"
        onError={() => setUseFallback(true)}
        style={{ opacity: slotOpacities[0], transition: 'opacity 1s linear' }}
        className={`absolute inset-0 ${className}`}
      />
      {/* Video Slot 1 */}
      <video
        ref={v1Ref}
        src={src}
        autoPlay
        muted
        playsInline
        preload="metadata"
        onError={() => setUseFallback(true)}
        style={{ opacity: slotOpacities[1], transition: 'opacity 1s linear' }}
        className={`absolute inset-0 ${className}`}
      />
    </div>
  ));
}
