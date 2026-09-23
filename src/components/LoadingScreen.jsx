import { useEffect, useRef, useState } from "react";

export default function LoadingScreen() {
  const [hidden, setHidden] = useState(false);
  const [progress, setProgress] = useState(0);
  const counterRef = useRef(null);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (m.matches) {
      setProgress(100);
      const t = setTimeout(() => setHidden(true), 180);
      return () => clearTimeout(t);
    }

    const duration = 1600;
    const start = performance.now();
    let raf = 0;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(p);
      const v = Math.floor(eased * 100);
      setProgress(v);
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setProgress(100);
        setTimeout(() => setHidden(true), 260);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={`loading ${hidden ? "is-hidden" : ""}`} aria-hidden={hidden} aria-label="Loading">
      <div className="loading__inner" role="status" aria-live="polite" aria-atomic="true">
        <div className="loading__counter" ref={counterRef} aria-label={`Loading ${progress} percent`}>
          {progress}%
        </div>
        <div className="loading__bar" aria-hidden="true">
          <div className="loading__progress" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
