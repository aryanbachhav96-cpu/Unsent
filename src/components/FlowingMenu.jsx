import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

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
  const [isActive, setIsActive] = useState(false);
  const [entranceEdge, setEntranceEdge] = useState('bottom');

  useLayoutEffect(() => {
    const marquee = marqueeRef.current;
    const content = marqueeContentRef.current;
    if (!marquee || !content) return undefined;

    const setupMarquee = () => {
      const part = content.querySelector('.flowing-menu-marquee-part');
      if (!part) return;
      const width = part.getBoundingClientRect().width;
      if (!width) return;

      tweenRef.current?.kill();
      gsap.set(content, { x: 0 });
      tweenRef.current = gsap.to(content, {
        x: -width,
        duration: speed,
        ease: 'none',
        repeat: -1,
        paused: true,
      });
    };

    setupMarquee();
    const resizeObserver = new ResizeObserver(setupMarquee);
    resizeObserver.observe(marquee);

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(activationFrameRef.current);
      tweenRef.current?.kill();
      gsap.killTweensOf(marquee);
    };
  }, [item.text, item.image, speed]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isActive && !prefersReducedMotion) {
      tweenRef.current?.play();
      return;
    }

    tweenRef.current?.pause(0);
    if (marqueeContentRef.current) {
      gsap.set(marqueeContentRef.current, { x: 0 });
    }
  }, [isActive]);

  const enterMenu = (event, edgeOverride) => {
    const link = linkRef.current;
    if (!link) return;

    const edge = edgeOverride || findClosestEdge(event, link);
    window.cancelAnimationFrame(activationFrameRef.current);
    setEntranceEdge(edge);
    activationFrameRef.current = window.requestAnimationFrame(() => {
      setIsActive(true);
    });
  };

  const leaveMenu = (event) => {
    const link = linkRef.current;
    if (!link) return;
    if (event.relatedTarget && link.contains(event.relatedTarget)) return;

    const edge = findClosestEdge(event, link);
    window.cancelAnimationFrame(activationFrameRef.current);
    setEntranceEdge(edge);
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
