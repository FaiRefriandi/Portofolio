import { contacts } from "../data.js";

export default function Contact() {
  return (
    <section id="contact" className="section reveal">
      <div className="section-head">
        <div className="section-head__left">
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
    </section>
  );
}
