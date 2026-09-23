import { useEffect, useRef } from "react";

export default function Modal({ project, onClose }) {
  const closeRef = useRef(null);
  const open = Boolean(project);

  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={`modal ${open ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-label={project.title}>
      <button className="modal__backdrop" aria-label="Close modal" onClick={onClose} />

      <div className="modal__panel" role="document">
        <button ref={closeRef} className="modal__close" aria-label="Close" onClick={onClose}>×</button>

        <div className="modal__body">
          <div className="modal__media">
            <img src={project.image} alt={project.title} />
          </div>

          <div>
            <div className="modal__period">{project.period}</div>
            <h3 className="modal__title">{project.title}</h3>
            <p className="modal__desc">{project.description}</p>

            <div className="chips" style={{ marginTop: 14 }} aria-label="Tech stack">
              {project.tech.map((t) => (
                <span key={t} className="chip">{t}</span>
              ))}
            </div>

            {project.link ? (
              <div style={{ marginTop: 16 }}>
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
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
