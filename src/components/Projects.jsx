import { projects } from "../data.js";
import WindowDots from "./WindowDots.jsx";

export default function Projects({ onOpen }) {
  return (
    <section id="projects" className="section reveal">
      <div className="section-head">
        <div className="section-head__left">
          <WindowDots />
          <h2>Projects</h2>
        </div>
        <span className="count">{projects.length} selected</span>
      </div>

      <div className="cards" role="list">
        {projects.map((p) => (
          <article
            key={p.title}
            role="listitem"
            className="card"
            tabIndex={0}
            aria-label={`Open ${p.title} details`}
            onClick={() => onOpen(p)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(p); }
            }}
          >
            <div className="card__media" aria-hidden="true">
              <div className="imgbox"><img src={p.image} alt="" loading="lazy" /></div>
              <div className="card__caption">{p.caption}</div>
            </div>
            <div>
              <div className="card__period">{p.period}</div>
              <h3 className="card__title">{p.title}</h3>
              <p className="card__desc">{p.description}</p>
              <div className="chips" aria-label={`Tech stack ${p.title}`}>
                {p.tech.map((t) => <span key={t} className="chip">{t}</span>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
