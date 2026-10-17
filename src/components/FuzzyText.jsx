import React, { useEffect, useRef } from 'react';

export default function FuzzyText({
  children,
  fontSize = 'clamp(2rem, 8vw, 8rem)',
  fontWeight = 900,
  fontFamily = 'inherit',
  color = '#fff',
  enableHover = true,
  baseIntensity = 0.18,
  hoverIntensity = 0.5,
  fuzzRange = 30,
  fps = 30,
  direction = 'horizontal',
  transitionDuration = 0,
  clickEffect = false,
  glitchMode = false,
  glitchInterval = 2000,
  glitchDuration = 200,
  gradient = null,
  letterSpacing = 0,
  className = '',
  decorative = false,
}) {
  const canvasRef = useRef(null);
  const text = React.Children.toArray(children).join('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !text) return undefined;

    let renderVersion = 0;
    let resizeTimer;
    let frameId;
    let glitchTimer;
    let glitchEndTimer;
    let clickTimer;
    let activeCleanup = () => {};

    const renderText = async () => {
      const version = ++renderVersion;
      const context = canvas.getContext('2d');
      if (!context) return;

      const computedFontFamily =
        fontFamily === 'inherit'
          ? window.getComputedStyle(canvas).fontFamily || 'sans-serif'
          : fontFamily;
      const fontSizeValue = typeof fontSize === 'number' ? `${fontSize}px` : fontSize;
      const font = `${fontWeight} ${fontSizeValue} ${computedFontFamily}`;
      try {
        await document.fonts.load(font);
      } catch {
        await document.fonts.ready;
      }
      if (version !== renderVersion) return;

      const measuringSpan = document.createElement('span');
      Object.assign(measuringSpan.style, {
        font: `${fontWeight} ${fontSizeValue} ${computedFontFamily}`,
        letterSpacing: `${letterSpacing}px`,
        position: 'fixed',
        visibility: 'hidden',
        whiteSpace: 'pre',
        inset: '0 auto auto 0',
      });
      measuringSpan.textContent = text;
      canvas.parentElement?.appendChild(measuringSpan);
      const computedSize = parseFloat(window.getComputedStyle(measuringSpan).fontSize);
      measuringSpan.remove();

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const offscreen = document.createElement('canvas');
      const offscreenContext = offscreen.getContext('2d');
      if (!offscreenContext) return;

      offscreenContext.scale(pixelRatio, pixelRatio);
      offscreenContext.font = `${fontWeight} ${computedSize}px ${computedFontFamily}`;
      offscreenContext.textBaseline = 'alphabetic';
      const metrics = offscreenContext.measureText(text);
      const measuredWidth =
        letterSpacing === 0
          ? metrics.width
          : Array.from(text).reduce(
              (width, character) => width + offscreenContext.measureText(character).width + letterSpacing,
              -letterSpacing
            );
      const ascent = metrics.actualBoundingBoxAscent || computedSize;
      const descent = metrics.actualBoundingBoxDescent || computedSize * 0.2;
      const textWidth = Math.ceil(measuredWidth);
      const textHeight = Math.ceil(ascent + descent);
      const textPadding = 5;
      const horizontalMargin = Math.max(0, fuzzRange) + 20;
      const verticalMargin = direction === 'vertical' || direction === 'both'
        ? Math.max(0, fuzzRange) + 10
        : 0;
      const logicalWidth = textWidth + textPadding * 2 + horizontalMargin * 2;
      const logicalHeight = textHeight + verticalMargin * 2;

      offscreen.width = Math.ceil((textWidth + textPadding * 2) * pixelRatio);
      offscreen.height = Math.ceil(textHeight * pixelRatio);
      offscreenContext.scale(pixelRatio, pixelRatio);
      offscreenContext.font = `${fontWeight} ${computedSize}px ${computedFontFamily}`;
      offscreenContext.textBaseline = 'alphabetic';

      if (gradient && gradient.length > 1) {
        const fill = offscreenContext.createLinearGradient(0, 0, textWidth, 0);
        gradient.forEach((stop, index) => fill.addColorStop(index / (gradient.length - 1), stop));
        offscreenContext.fillStyle = fill;
      } else {
        offscreenContext.fillStyle = color;
      }

      if (letterSpacing === 0) {
        offscreenContext.fillText(text, textPadding, ascent);
      } else {
        let x = textPadding;
        for (const character of Array.from(text)) {
          offscreenContext.fillText(character, x, ascent);
          x += offscreenContext.measureText(character).width + letterSpacing;
        }
      }

      canvas.width = Math.ceil(logicalWidth * pixelRatio);
      canvas.height = Math.ceil(logicalHeight * pixelRatio);
      canvas.style.width = `${logicalWidth}px`;
      canvas.style.height = 'auto';
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      let hovering = false;
      let clicking = false;
      let glitching = false;
      let intensity = baseIntensity;
      let previousFrame = 0;
      const frameDuration = 1000 / Math.max(1, fps);
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

      const drawFrame = (timestamp = 0) => {
        if (version !== renderVersion) return;
        if (timestamp - previousFrame < frameDuration && !reducedMotion.matches) {
          frameId = window.requestAnimationFrame(drawFrame);
          return;
        }
        previousFrame = timestamp;

        const targetIntensity = reducedMotion.matches
          ? 0
          : clicking || glitching
            ? 1
            : hovering
              ? hoverIntensity
              : baseIntensity;
        if (transitionDuration > 0 && !reducedMotion.matches) {
          const step = frameDuration / transitionDuration;
          intensity += Math.sign(targetIntensity - intensity) *
            Math.min(Math.abs(targetIntensity - intensity), step);
        } else {
          intensity = targetIntensity;
        }

        context.clearRect(0, 0, logicalWidth, logicalHeight);
        const rowStep = 1;
        for (let y = 0; y < textHeight; y += rowStep) {
          const horizontalOffset =
            direction === 'horizontal' || direction === 'both'
              ? Math.floor(intensity * (Math.random() - 0.5) * fuzzRange)
              : 0;
          const verticalOffset =
            direction === 'vertical' || direction === 'both'
              ? Math.floor(intensity * (Math.random() - 0.5) * fuzzRange * 0.5)
              : 0;
          context.drawImage(
            offscreen,
            0,
            Math.floor(y * pixelRatio),
            offscreen.width,
            Math.min(pixelRatio, offscreen.height - Math.floor(y * pixelRatio)),
            horizontalMargin + horizontalOffset,
            verticalMargin + y + verticalOffset,
            textWidth + textPadding * 2,
            rowStep + 0.5
          );
        }

        if (!reducedMotion.matches) frameId = window.requestAnimationFrame(drawFrame);
      };

      const onPointerMove = (event) => {
        if (!enableHover || reducedMotion.matches) return;
        const bounds = canvas.getBoundingClientRect();
        const x = (event.clientX - bounds.left) * (logicalWidth / bounds.width);
        const y = (event.clientY - bounds.top) * (logicalHeight / bounds.height);
        hovering =
          x >= horizontalMargin &&
          x <= horizontalMargin + textWidth + textPadding * 2 &&
          y >= verticalMargin &&
          y <= verticalMargin + textHeight;
      };
      const onPointerLeave = () => {
        hovering = false;
      };
      const onClick = () => {
        if (!clickEffect || reducedMotion.matches) return;
        clicking = true;
        window.clearTimeout(clickTimer);
        clickTimer = window.setTimeout(() => {
          clicking = false;
        }, 150);
      };
      const onMotionPreferenceChange = () => {
        window.cancelAnimationFrame(frameId);
        previousFrame = 0;
        drawFrame();
      };

      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerleave', onPointerLeave);
      canvas.addEventListener('click', onClick);
      reducedMotion.addEventListener?.('change', onMotionPreferenceChange);

      const startGlitchLoop = () => {
        if (!glitchMode || version !== renderVersion || reducedMotion.matches) return;
        glitchTimer = window.setTimeout(() => {
          glitching = true;
          glitchEndTimer = window.setTimeout(() => {
            glitching = false;
            startGlitchLoop();
          }, glitchDuration);
        }, glitchInterval);
      };
      startGlitchLoop();
      drawFrame();

      activeCleanup = () => {
        window.cancelAnimationFrame(frameId);
        window.clearTimeout(glitchTimer);
        window.clearTimeout(glitchEndTimer);
        window.clearTimeout(clickTimer);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerleave', onPointerLeave);
        canvas.removeEventListener('click', onClick);
        reducedMotion.removeEventListener?.('change', onMotionPreferenceChange);
      };
    };

    renderText();
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        renderVersion += 1;
        activeCleanup();
        renderText();
      }, 100);
    };
    window.addEventListener('resize', onResize);

    return () => {
      renderVersion += 1;
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      activeCleanup();
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(glitchTimer);
      window.clearTimeout(glitchEndTimer);
      window.clearTimeout(clickTimer);
    };
  }, [
    text,
    fontSize,
    fontWeight,
    fontFamily,
    color,
    enableHover,
    baseIntensity,
    hoverIntensity,
    fuzzRange,
    fps,
    direction,
    transitionDuration,
    clickEffect,
    glitchMode,
    glitchInterval,
    glitchDuration,
    gradient,
    letterSpacing,
    decorative,
  ]);

  return (
    <canvas
      ref={canvasRef}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : text}
      aria-hidden={decorative || undefined}
      data-skip-text-reveal
      className={`fuzzy-text-canvas ${className}`}
    />
  );
}
