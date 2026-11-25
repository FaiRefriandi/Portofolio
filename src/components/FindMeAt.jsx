import { socials } from "../data.js";
import { FadeUp } from "./AnimatedText.jsx";

export default function FindMeAt() {
  return (
    <section className="section reveal" aria-label="Find me at">
      <FadeUp tag="h2" inView>find me at</FadeUp>

      <div className="find-me-at__chips">
        {socials.map((s) => (
          <a
            key={s.label}
            className="find-me-at__chip"
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img className="find-me-at__icon" src={s.icon} alt="" aria-hidden="true" draggable={false} />
            <span>{s.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
