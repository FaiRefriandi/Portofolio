import { useEffect, useRef, useState } from "react";

// Must stay in sync with the exit transition in components.css (.modal__panel).
const EXIT_MS = 240;

export default function Modal({ project, onClose }) {
  const closeRef = useRef(null);
  const timerRef = useRef(0);
  // `shown` lags behind `project` on close so the exit animation can play
  // before the content unmounts.
  const [shown, setShown] = useState(null);
  const [closing, setClosing] = useState(false);
  const open = Boolean(project);

  useEffect(() => {
    if (project) {
      clearTimeout(timerRef.current);
      setClosing(false);
      setShown(project);
    } else if (shown) {
      setClosing(true);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      timerRef.current = setTimeout(() => {
        setShown(null);
        setClosing(false);
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
    <div className={`modal${open && !closing ? " is-open" : ""}${closing ? " is-closing" : ""}`} role="dialog" aria-modal="true" aria-label={shown.title}>
      <button className="modal__backdrop" aria-label="Close modal" onClick={onClose} />

      <div className="modal__panel" role="document">
        <button ref={closeRef} className="modal__close" aria-label="Close" onClick={onClose}>×</button>

        <div className="modal__body">
          <div className="modal__media">
            <img src={shown.image} alt={shown.title} />
          </div>

          <div>
            <div className="modal__period">{shown.period}</div>
            <h3 className="modal__title">{shown.title}</h3>
            <p className="modal__desc">{shown.description}</p>

            <div className="chips" style={{ marginTop: 14 }} aria-label="Tech stack">
              {shown.tech.map((t) => (
                <span key={t} className="chip">{t}</span>
              ))}
            </div>

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
