// MorphingText, diadaptasi dari Magic UI (MIT).
// Sumber: https://magicui.design/docs/components/morphing-text
// Dua lapis teks yang saling blur (cross-blur) lewat requestAnimationFrame,
// plus filter SVG threshold supaya hurufnya meleleh seperti gooey.
// Diadaptasi ke JSX + CSS biasa (tanpa Tailwind) dan ke hero:
// - Sizer tersembunyi mengikuti teks yang sedang dominan, supaya lebar
//   mengikuti panjang teks.
// - Filter threshold hanya aktif saat morphing; saat diam dilepas supaya teks tajam.
// - Hormat reduced motion dan menunggu halaman selesai loading.

import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { usePageLoaded } from "./AnimatedText.jsx";

const morphTime = 1.5;
const cooldownTime = 3;

const useMorphingText = (texts) => {
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(0);
  const timeRef = useRef(new Date());

  const text1Ref = useRef(null);
  const text2Ref = useRef(null);
  const sizerRef = useRef(null);
  const containerRef = useRef(null);

  const setStyles = useCallback(
    (fraction) => {
      const current1 = text1Ref.current;
      const current2 = text2Ref.current;
      if (!current1 || !current2) return;

      // Filter threshold (gooey) hanya saat morphing; saat diam dilepas di doCooldown.
      if (containerRef.current) {
        containerRef.current.style.filter = "url(#threshold)";
      }

      current2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      current2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      const invertedFraction = 1 - fraction;
      current1.style.filter = `blur(${Math.min(8 / invertedFraction - 8, 100)}px)`;
      current1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`;

      current1.textContent = texts[textIndexRef.current % texts.length];
      current2.textContent = texts[(textIndexRef.current + 1) % texts.length];

      if (sizerRef.current) {
        sizerRef.current.textContent =
          fraction < 0.5
            ? texts[textIndexRef.current % texts.length]
            : texts[(textIndexRef.current + 1) % texts.length];
      }

    },
    [texts]
  );

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current;
    cooldownRef.current = 0;

    let fraction = morphRef.current / morphTime;

    if (fraction > 1) {
      cooldownRef.current = cooldownTime;
      fraction = 1;
    }

    setStyles(fraction);

    if (fraction === 1) {
      textIndexRef.current++;
    }
  }, [setStyles]);

  const doCooldown = useCallback(() => {
    morphRef.current = 0;
    // Saat diam: lepas filter threshold supaya teks tajam, tanpa raster filter.
    if (containerRef.current) {
      containerRef.current.style.filter = "none";
    }
    const current1 = text1Ref.current;
    const current2 = text2Ref.current;
    if (current1 && current2) {
      current2.style.filter = "none";
      current2.style.opacity = "100%";
      current1.style.filter = "none";
      current1.style.opacity = "0%";
    }
    if (sizerRef.current) {
      sizerRef.current.textContent = texts[textIndexRef.current % texts.length];
    }
  }, [texts]);

  const loaded = usePageLoaded();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !loaded) return undefined;
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const newTime = new Date();
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
      timeRef.current = newTime;
      cooldownRef.current -= dt;
      if (cooldownRef.current <= 0) doMorph();
      else doCooldown();
    };
    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [doMorph, doCooldown, reduce, loaded]);

  return { text1Ref, text2Ref, sizerRef, containerRef };
};

const SvgFilters = () => (
  <svg
    id="filters"
    className="morphing-text__filters"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <filter id="threshold">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 255 -140"
        />
      </filter>
    </defs>
  </svg>
);

export function MorphingText({ texts, className }) {
  const reduce = useReducedMotion();
  const { text1Ref, text2Ref, sizerRef, containerRef } = useMorphingText(texts);

  if (reduce) {
    return <span className={className}>{texts[0]}</span>;
  }

  return (
    <span ref={containerRef} className={className ? `morphing-text ${className}` : "morphing-text"}>
      <span ref={sizerRef} className="morphing-text__sizer" aria-hidden="true">
        {texts[0]}
      </span>
      <span ref={text1Ref} className="morphing-text__layer" style={{ opacity: 1 }}>
        {texts[0]}
      </span>
      <span ref={text2Ref} className="morphing-text__layer" style={{ opacity: 0 }}>
        {texts[1 % texts.length]}
      </span>
      <SvgFilters />
    </span>
  );
}
