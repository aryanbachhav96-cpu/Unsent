import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

function findClosestEdge(event, element) {
  const bounds = element.getBoundingClientRect();
  const localX = event.clientX - bounds.left;
  const localY = event.clientY - bounds.top;
  const topDistance = Math.hypot(localX - bounds.width / 2, localY);
  const bottomDistance = Math.hypot(localX - bounds.width / 2, localY - bounds.height);
  return topDistance < bottomDistance ? 'top' : 'bottom';
}

function MenuItem({ item, theme, speed }) {
  const linkRef = useRef(null);
  const marqueeRef = useRef(null);
  const marqueeContentRef = useRef(null);
  const tweenRef = useRef(null);
  const activationFrameRef = useRef(0);
  const isActiveRef = useRef(false);
  const [isActive, setIsActive] = useState(false);
  const [entranceEdge, setEntranceEdge] = useState('bottom');
  const enableMarquee = typeof window === 'undefined' || (
    !window.matchMedia('(max-width: 768px)').matches &&
    !window.matchMedia('(hover: none)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    !navigator.connection?.saveData
  );

  useLayoutEffect(() => {
    if (!enableMarquee) return undefined;

    const marquee = marqueeRef.current;
    const content = marqueeContentRef.current;
    if (!marquee || !content) return undefined;
    let isCancelled = false;
    let resizeObserver;
    let gsapInstance;

    const setupMarquee = () => {
      if (!gsapInstance || isCancelled) return;
      const part = content.querySelector('.flowing-menu-marquee-part');
      if (!part) return;
      const width = part.getBoundingClientRect().width;
      if (!width) return;

      tweenRef.current?.kill();
      gsapInstance.set(content, { x: 0 });
      tweenRef.current = gsapInstance.to(content, {
        x: -width,
        duration: speed,
        ease: 'none',
        repeat: -1,
        paused: true,
      });
      if (isActiveRef.current) tweenRef.current.play();
    };

    import('gsap').then(({ gsap }) => {
      if (isCancelled) return;
      gsapInstance = gsap;
      setupMarquee();
      resizeObserver = new ResizeObserver(setupMarquee);
      resizeObserver.observe(marquee);
    });

    return () => {
      isCancelled = true;
      resizeObserver?.disconnect();
      window.cancelAnimationFrame(activationFrameRef.current);
      tweenRef.current?.kill();
      gsapInstance?.killTweensOf(marquee);
    };
  }, [enableMarquee, item.text, item.image, speed]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isActive && !prefersReducedMotion) {
      tweenRef.current?.play();
      return;
    }

    tweenRef.current?.pause(0);
    tweenRef.current?.progress(0);
  }, [isActive]);

  const enterMenu = (event, edgeOverride) => {
    if (event?.pointerType === 'touch') return;
    const link = linkRef.current;
    if (!link) return;

    const edge = edgeOverride || findClosestEdge(event, link);
    window.cancelAnimationFrame(activationFrameRef.current);
    setEntranceEdge(edge);
    activationFrameRef.current = window.requestAnimationFrame(() => {
      isActiveRef.current = true;
      setIsActive(true);
    });
  };

  const leaveMenu = (event) => {
    const link = linkRef.current;
    if (!link) return;
    if (event.relatedTarget instanceof Node && link.contains(event.relatedTarget)) return;

    const edge = findClosestEdge(event, link);
    window.cancelAnimationFrame(activationFrameRef.current);
    setEntranceEdge(edge);
    isActiveRef.current = false;
    setIsActive(false);
  };

  return (
    <Link
      ref={linkRef}
      to={item.link}
      className={`flowing-menu-item flowing-menu-item-${theme}${isActive ? ' is-active' : ''}`}
      data-edge={entranceEdge}
      onPointerEnter={(event) => enterMenu(event)}
      onPointerLeave={leaveMenu}
      onFocus={() => enterMenu(null, 'top')}
      onBlur={leaveMenu}
    >
      <span className="flowing-menu-label">{item.text}</span>
      {enableMarquee && (
        <span
          ref={marqueeRef}
          className="flowing-menu-marquee"
          aria-hidden="true"
        >
          <span ref={marqueeContentRef} className="flowing-menu-marquee-content">
            {Array.from({ length: 4 }, (_, index) => (
              <span
                className="flowing-menu-marquee-part"
                key={`${item.text}-${index}`}
              >
                <span className="flowing-menu-marquee-text">{item.text}</span>
                <span
                  className="flowing-menu-image"
                  style={{ backgroundImage: `url("${item.image}")` }}
                />
              </span>
            ))}
          </span>
        </span>
      )}
    </Link>
  );
}

export default function FlowingMenu({
  items,
  theme = 'night',
  title = 'Explore',
}) {
  return (
    <section
      className={`flowing-menu-section flowing-menu-section-${theme}`}
      aria-labelledby={`flowing-menu-title-${theme}`}
    >
      <h2 id={`flowing-menu-title-${theme}`} className="flowing-menu-heading">
        {title}
      </h2>
      <nav className="flowing-menu-list" aria-label={title}>
        {items.map((item, index) => (
          <MenuItem
            key={item.link}
            item={item}
            theme={theme}
            speed={18}
          />
        ))}
      </nav>
    </section>
  );
}
