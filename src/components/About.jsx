import { useEffect, useRef, useState } from "react";
import { aboutText } from "../data.js";
import WindowDots from "./WindowDots.jsx";

export default function About() {
  const [typed, setTyped] = useState("");
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (m.matches) {
      setTyped(aboutText);
      doneRef.current = true;
      return;
    }

    let i = 0;
    const min = 28;
    const max = 90;
    const PUNCT = new Set([".", ",", "!", "?", ";", ":"]);

    function nextDelay(ch) {
      // natural typing: random per-char, longer pause after punctuation & spaces
      let d = min + Math.random() * (max - min);
      if (PUNCT.has(ch)) d += 280;
      else if (ch === " ") d += 60;
      return d;
    }

    let timer = null;
    function tick() {
      if (i >= aboutText.length) {
        doneRef.current = true;
        return;
      }
      i += 1;
      setTyped(aboutText.slice(0, i));
      timer = setTimeout(tick, nextDelay(aboutText[i - 1]));
    }
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="about" className="section reveal">
      <div className="section-head">
        <div className="section-head__left">
          <WindowDots />
          <h2>About</h2>
        </div>
        <span className="count">01 — Intro</span>
      </div>
      <div className="about about--term" role="region" aria-label="About terminal">
        <div className="about__term-bar">
          <WindowDots />
          <span className="about__term-title">fai@portfolio: ~ — zsh</span>
          <span aria-hidden="true" />
        </div>
        <div className="about__term-body">
          <div className="about__term-line" aria-hidden="true">
            <span className="about__term-prompt">➜</span>
            <span className="about__term-dir">~</span>
            <span className="about__term-cmd">cat about.txt</span>
          </div>
          <p className="about__term-out">
            {typed}
            <span className="about__term-cursor" aria-hidden="true" />
          </p>
        </div>
      </div>
    </section>
  );
}
