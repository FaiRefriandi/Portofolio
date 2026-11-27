import { useRef } from "react";
import { projects } from "../data.js";
import WindowDots from "./WindowDots.jsx";
import { FadeUp } from "./AnimatedText.jsx";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  CarouselCounter,
} from "./Carousel.jsx";

function hostOf(link) {
  try { return new URL(link).hostname.replace(/^www\./, ""); }
  catch { return ""; }
}

export default function Projects({ onOpen }) {
  // Embla drag vs click: jangan buka modal kalau pointer sempat digeser (drag).
  const dragStart = useRef({ x: 0, y: 0 });
  const onCardPointerDown = (e) => {
    dragStart.current = { x: e.clientX, y: e.clientY };
  };
  const openIfNotDragged = (e, p) => {
    const dx = Math.abs(e.clientX - dragStart.current.x);
    const dy = Math.abs(e.clientY - dragStart.current.y);
    if (dx > 8 || dy > 8) return;
    onOpen(p);
  };

  return (
    <section id="projects" className="section reveal">
      <FadeUp tag="h2" inView>projects.</FadeUp>

      <Carousel opts={{ loop: true, align: "center", containScroll: false, scale: 0.8, visible: 1 }}>
        <CarouselContent>
          {projects.map((p) => (
            <CarouselItem key={p.title}>
              <article
                role="listitem"
                className="card"
                tabIndex={0}
                aria-label={`Open ${p.title} details`}
                onPointerDown={onCardPointerDown}
                onClick={(e) => openIfNotDragged(e, p)}
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
                <div className="card__body">
                  <div className="card__period">{p.period}</div>
                  <h3 className="card__title">{p.title}</h3>
                  <p className="card__desc">{p.description}</p>
                  <div className="chips" aria-label={`Tech stack ${p.title}`}>
                    {p.tech.map((t) => <span key={t} className="chip">{t}</span>)}
                  </div>
                </div>
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="pcarousel__controls">
          <CarouselPrevious />
          <CarouselDots />
          <CarouselCounter />
          <CarouselNext />
        </div>
      </Carousel>
    </section>
  );
}
