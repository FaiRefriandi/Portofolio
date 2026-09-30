import { Fragment } from "react";
import { projects } from "../data.js";
import WindowDots from "./WindowDots.jsx";

function hostOf(link) {
  try { return new URL(link).hostname.replace(/^www\./, ""); }
  catch { return ""; }
}

// 2 cards per row on desktop; dividers span the full grid width between rows.
const COLS = 2;
const rows = [];
for (let i = 0; i < projects.length; i += COLS) rows.push(projects.slice(i, i + COLS));

export default function Projects({ onOpen }) {
  return (
    <section id="projects" className="section reveal">
      <div className="section-head">
        <div className="section-head__left">
          <h2>Projects</h2>
        </div>
        <span className="count">{projects.length} selected</span>
      </div>

      <div className="cards" role="list">
        {rows.map((row, ri) => (
          <Fragment key={ri}>
            {ri > 0 && <div className="cards__divider" aria-hidden="true" />}
            {row.map((p) => (
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
                <div className="browser-bar">
                  <WindowDots />
                  <span className="browser-url">{hostOf(p.link) || "preview"}</span>
                </div>
                <div className="imgbox"><img src={p.image} alt="" loading="lazy" draggable={false} /></div>
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
          </Fragment>
        ))}
      </div>
    </section>
  );
}
