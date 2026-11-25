import { useEffect, useRef, useState } from "react";

// Unmount delay for the exit transition in components.css (.modal__panel,
// .modal__backdrop — 260ms), plus a little slack so the fade-out is never
// cut off mid-flight.
const EXIT_MS = 280;

export default function Modal({ project, onClose }) {
  const closeRef = useRef(null);
  const timerRef = useRef(0);
  // `shown` lags behind `project` on close so the exit animation can play
  // before the content unmounts.
  const [shown, setShown] = useState(null);
  // Derived during render, never set in an effect: the old code set `closing`
  // inside useEffect, so on close there was one render where the modal had
  // neither `is-open` nor `is-closing` — the container snapped to opacity 0
  // / visibility hidden for a frame, then snapped back visible and the
  // panel restarted its transition toward a different transform. That
  // one-frame vanish plus restart is what made closing look choppy and
  // shaky. Now `is-closing` applies in the very same commit as the close.
  const open = Boolean(project);
  const closing = !open && shown !== null;

  useEffect(() => {
    if (project) {
      clearTimeout(timerRef.current);
      setShown(project);
    } else if (shown) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      timerRef.current = setTimeout(() => {
        setShown(null);
      }, reduce ? 0 : EXIT_MS);
    }
    return () => clearTimeout(timerRef.current);
  }, [project, shown]);

  useEffect(() => {
    if (!shown) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    const prevPadRight = document.body.style.paddingRight;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;
    const t = setTimeout(() => closeRef.current?.focus(), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadRight;
    };
  }, [shown, onClose]);

  if (!shown) return null;

  return (
    <div className={`modal${open ? " is-open" : ""}${closing ? " is-closing" : ""}`} role="dialog" aria-modal="true" aria-label={shown.title}>
      <button className="modal__backdrop" aria-label="Close modal" onClick={onClose} />

      <div className="modal__panel" role="document">
        <button ref={closeRef} className="modal__close" aria-label="Close" onClick={onClose}><svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg></button>

        <div className="modal__body">
          <div className="modal__media">
            <img src={shown.image} alt={shown.title} draggable={false} />
          </div>

          <div>
            <div className="modal__period">{shown.period}</div>
            <h3 className="modal__title">{shown.title}</h3>
            <p className="modal__desc">{shown.description}</p>

            {shown.link ? (
              <div style={{ marginTop: 16 }}>
                <a href={shown.link} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
                  View Project →
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
