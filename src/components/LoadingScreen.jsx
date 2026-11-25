import { useCallback, useEffect, useRef, useState } from "react";
import { HelloEffect } from "./HelloEffect.jsx";

// Opening screen: the old 0-100% counter is gone, replaced by the Apple
// style handwritten "hello" that draws itself stroke by stroke, then
// fades out. With reduced motion the word appears fully drawn at once.

export default function LoadingScreen() {
  const [hidden, setHidden] = useState(false);
  const [gone, setGone] = useState(false);
  const timersRef = useRef([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  const handleComplete = useCallback(() => {
    timersRef.current.push(setTimeout(() => setHidden(true), 450));
    timersRef.current.push(setTimeout(() => setGone(true), 1000));
  }, []);

  if (gone) return null;

  return (
    <div className={`loading ${hidden ? "is-hidden" : ""}`} aria-hidden={hidden} aria-label="Loading">
      <div className="loading__inner" role="status" aria-live="polite" aria-atomic="true">
        <HelloEffect className="loading__hello" onComplete={handleComplete} />
      </div>
    </div>
  );
}
