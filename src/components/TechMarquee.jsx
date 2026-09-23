import { useEffect, useRef } from "react";
import { techStack } from "../data.js";
import WindowDots from "./WindowDots.jsx";

function MarqueeRow({ items, speed = 0.5, reverse = false, ariaLabel }) {
  const trackRef = useRef(null);
  const rafRef = useRef(0);
  const posRef = useRef(0);
  const widthRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const first = track.querySelector("[data-marquee-content]");
    if (!first) return;

    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (m.matches) return;

    const measure = () => {
      widthRef.current = first.offsetWidth;
      posRef.current = reverse ? -widthRef.current : 0;
    };
    measure();

    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(32, now - last);
      last = now;
      const delta = (speed * dt) / 16.666;
      if (reverse) {
        posRef.current += delta;
        if (posRef.current >= 0) posRef.current = -widthRef.current;
      } else {
        posRef.current -= delta;
        if (posRef.current <= -widthRef.current) posRef.current = 0;
      }
      track.style.transform = `translate3d(${posRef.current}px,0,0)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [reverse, speed]);

  return (
    <div className="tech-row" ref={trackRef} aria-label={ariaLabel}>
      <div className="tech-row__content" data-marquee-content aria-hidden="false">
        {items.map((t) => (
          <a key={`${t.label}-a`} href={t.href} target="_blank" rel="noopener noreferrer" className="tech-item" title={t.label} aria-label={t.label}>
            <img src={t.src} alt={t.label} loading="lazy" />
          </a>
        ))}
      </div>
      <div className="tech-row__content" aria-hidden="true">
        {items.map((t) => (
          <a key={`${t.label}-b`} href={t.href} target="_blank" rel="noopener noreferrer" className="tech-item" title={t.label} tabIndex={-1} aria-hidden="true">
            <img src={t.src} alt="" loading="lazy" />
          </a>
        ))}
      </div>
      <div className="tech-row__content" aria-hidden="true">
        {items.map((t) => (
          <a key={`${t.label}-c`} href={t.href} target="_blank" rel="noopener noreferrer" className="tech-item" title={t.label} tabIndex={-1} aria-hidden="true">
            <img src={t.src} alt="" loading="lazy" />
          </a>
        ))}
      </div>
    </div>
  );
}

export default function TechMarquee() {
  const desktop = techStack;
  const mobileA = techStack.slice(0, 7);
  const mobileB = techStack.slice(7);

  return (
    <section id="tech" className="section reveal">
      <div className="section-head">
        <div className="section-head__left">
          <WindowDots />
          <h2>Tech Stack</h2>
        </div>
        <span className="count">{techStack.length} tools</span>
      </div>

      <div className="tech-marquee" role="region" aria-label="Tech stack marquee">
        <div className="tech-marquee__head">
          <span className="eyebrow">Stack</span>
          <span className="eyebrow">Continuous</span>
        </div>

        <div className="tech-marquee__viewport" data-desktop-only>
          <div className="hide-mobile">
            <MarqueeRow items={desktop} speed={0.5} ariaLabel="Tech stack" />
          </div>
          <div className="show-mobile" style={{ display: "grid", gap: 12 }}>
            <MarqueeRow items={mobileA} speed={0.35} ariaLabel="Tech stack row 1" />
            <MarqueeRow items={mobileB} speed={0.35} reverse ariaLabel="Tech stack row 2" />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .hide-mobile{ display:none !important; } }
        @media (min-width: 769px) { .show-mobile{ display:none !important; } }
      `}</style>
    </section>
  );
}
