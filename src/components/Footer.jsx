import { useEffect, useRef, useState } from "react";
import { HelloEffect } from "./HelloEffect.jsx";
import { profile } from "../data.js";

// Page footer: the same handwritten stroke effect as the loading screen,
// but writing "See ya!" instead of "hello". It draws once, the first
// time the footer scrolls into view (immediately for reduced motion).

export default function Footer() {
  const wrapRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div ref={wrapRef} className="footer__seeya">
        {inView ? <HelloEffect word="seeya" /> : null}
      </div>
      <p className="footer__copy kicker">
        © {year} {profile.name} · Bandung, Indonesia
      </p>
    </footer>
  );
}
