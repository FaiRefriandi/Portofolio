import { education } from "../data.js";

export default function Education() {
  return (
    <section id="education" className="section reveal">
      <h2>Education</h2>

      <div className="band band--paper">
        <div className="band__body">
          <div className="timeline" role="list" aria-label="Education history">
            {education.map((e) => (
              <article key={e.role} className="timeline__row" role="listitem">
                <div className="timeline__period">{e.period}</div>
                <div>
                  <div className="timeline__role">{e.role}</div>
                  <div className="timeline__desc">{e.desc}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
