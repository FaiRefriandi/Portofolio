import { projects } from "../data.js";
import WindowDots from "./WindowDots.jsx";

export default function Projects({ onOpen }) {
  const [featured, ...rest] = projects;

  return (
    <section id="projects" className="section reveal">
      <div className="section-head">
        <div className="section-head__left">
          <WindowDots />
          <h2>Projects</h2>
        </div>
        <span className="count">{projects.length} selected</span>
      </div>

      <div className="projects-wrap">
        <article
          className="featured"
          tabIndex={0}
          role="button"
          aria-label={`Open ${featured.title} details`}
          onClick={() => onOpen(featured)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(featured); }
          }}
        >
          <div className="featured__media" aria-hidden="true">
            <div className="imgbox"><img src={featured.image} alt="" loading="lazy" /></div>
            <div className="featured__caption">Featured — {featured.caption}</div>
          </div>
          <div>
            <div className="featured__meta">
              <span className="featured__kicker">{featured.period}</span>
              <span aria-hidden="true" style={{ width: 4, height: 4, borderRadius: 999, background: "var(--semantic-stroke-strong)", display: "inline-block" }} />
              <span className="mono-chip">Featured</span>
            </div>
            <h3 className="featured__title">{featured.title}</h3>
            <p className="featured__desc">{featured.description}</p>
            <div className="chips" aria-label={`Tech stack ${featured.title}`}>
              {featured.tech.map((t) => <span key={t} className="chip">{t}</span>)}
            </div>
          </div>
        </article>

        <div className="cards" role="list">
          {rest.map((p) => (
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
      </div>
    </section>
  );
}
