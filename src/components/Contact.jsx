import { contacts } from "../data.js";
import WindowDots from "./WindowDots.jsx";

export default function Contact() {
  return (
    <section id="contact" className="section reveal">
      <div className="section-head">
        <div className="section-head__left">
          <WindowDots />
          <h2>Contact</h2>
        </div>
        <span className="count">Get in touch</span>
      </div>

      <div className="contact" role="list" aria-label="Contact">
        {contacts.map((c) => (
          <div key={c.label} className="contact__row" role="listitem">
            <div className="contact__label">{c.label}</div>
            <div className="contact__value">
              <a href={c.href} target={c.href.startsWith("mailto:") ? undefined : "_blank"} rel={c.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}>
                {c.value}
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="band band--mint" style={{ marginTop: 16 }}>
        <div className="band__head">
          <span className="kicker">Availability</span>
          <span className="kicker">Bandung · Remote</span>
        </div>
        <div className="band__body" style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
          <span className="mono" style={{ fontSize: 12, color: "var(--semantic-text-tertiary)", lineHeight: 1.6 }}>Open for freelance & collaboration — quick reply via email.</span>
          <a className="btn btn--primary" href="mailto:frefriandi@gmail.com">Email me →</a>
        </div>
      </div>
    </section>
  );
}
