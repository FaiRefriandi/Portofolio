import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Projects from "./components/Projects.jsx";
import Education from "./components/Education.jsx";
import Contact from "./components/Contact.jsx";
import Modal from "./components/Modal.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import GitHubHeatmap from "./components/GitHubHeatmap.jsx";
import { profile } from "./data.js";

export default function App() {
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    // block right-click / long-press "save image" on images only (page text
    // and links keep their normal context menu)
    const noImgMenu = (e) => {
      if (e.target && e.target.closest && e.target.closest("img")) e.preventDefault();
    };
    document.addEventListener("contextmenu", noImgMenu);

    // Pengaman: kalau hello tidak pernah selesai, halaman tetap
    // boleh masuk setelah 5 detik.
    const loadFallback = setTimeout(() => document.body.classList.add("is-loaded"), 5000);

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
      clearTimeout(loadFallback);
      io.disconnect();
      document.removeEventListener("contextmenu", noImgMenu);
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#tentang">Skip to content</a>
      <LoadingScreen />

      <div id="top" aria-hidden="true" />
      <Header />

      <Hero />

      <main className="wrap" role="main">
        <Projects onOpen={setActiveProject} />
        <Education />
        <Contact />
        <GitHubHeatmap username={profile.github} />
      </main>

      <img className="page-bottom-gif" src="assets/devault-ascii.gif" alt="" aria-hidden="true" loading="lazy" draggable={false} style={{ display: "block", width: "100%", height: "auto", marginBottom: "48px" }} />

      <Modal project={activeProject} onClose={() => setActiveProject(null)} />
    </>
  );
}
