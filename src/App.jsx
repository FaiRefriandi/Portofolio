import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Projects from "./components/Projects.jsx";
import Education from "./components/Education.jsx";
import Contact from "./components/Contact.jsx";
import Modal from "./components/Modal.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";

export default function App() {
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (m.matches) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
      return;
    }

    const els = Array.from(document.querySelectorAll(".reveal"));
    els.forEach((el, i) => {
      el.style.transitionDelay = `${80 + i * 60}ms`;
    });

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        els.forEach((el) => el.classList.add("is-in"));
      });
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("is-in");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#tentang">Skip to content</a>
      <LoadingScreen />

      <div id="top" aria-hidden="true" />
      <Header />

      <main className="wrap" role="main">
        <Hero />
        <About />
        <Projects onOpen={setActiveProject} />
        <Education />
        <Contact />
      </main>

      <Modal project={activeProject} onClose={() => setActiveProject(null)} />
    </>
  );
}
