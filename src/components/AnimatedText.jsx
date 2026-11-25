import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Ease yang sama dengan --motion-ease di tokens.css.
const EASE = [0.22, 1, 0.36, 1];

// True saat body sudah punya class is-loaded (loading hello selesai).
// Dipakai untuk menahan animasi hero sampai overlay loading hilang.
export function usePageLoaded() {
  const [loaded, setLoaded] = useState(
    () => typeof document !== "undefined" && document.body.classList.contains("is-loaded")
  );
  useEffect(() => {
    if (loaded) return undefined;
    const check = () => {
      if (document.body.classList.contains("is-loaded")) setLoaded(true);
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    const fallback = setTimeout(() => setLoaded(true), 6000);
    return () => {
      obs.disconnect();
      clearTimeout(fallback);
    };
  }, [loaded]);
  return loaded;
}

// Nama/heading yang muncul kata per kata: naik halus + blur hilang, stagger.
export function StaggerWords({ text }) {
  const reduce = useReducedMotion();
  const loaded = usePageLoaded();
  const words = String(text).split(" ");
  if (reduce) return <>{text}</>;
  return (
    <motion.span
      initial="hidden"
      animate={loaded ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
      }}
    >
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          variants={{
            hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.6, ease: EASE },
            },
          }}
          style={{ display: "inline-block", willChange: "transform, opacity, filter" }}
        >
          {w}
          {i < words.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}

// Nama hero yang morphing antara dua frasa (mis. "Fai Refriandi" dan
// "Morphkite") tiap beberapa detik. Kedua frasa ditumpuk di satu sel grid
// supaya lebar tidak berubah saat morph, jadi elemen di sebelah nama tidak
// bergeser. Kalau reduced motion, tampilkan frasa pertama saja.
export function MorphName({ phrases = ["Fai Refriandi", "Morphkite"], intervalMs = 3000 }) {
  const reduce = useReducedMotion();
  const loaded = usePageLoaded();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce || !loaded) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % phrases.length), intervalMs);
    return () => clearInterval(id);
  }, [reduce, loaded, intervalMs, phrases.length]);

  if (reduce) return <>{phrases[0]}</>;

  return (
    <span style={{ display: "inline-grid", verticalAlign: "top" }}>
      {phrases.map((text, i) => (
        <motion.span
          key={text}
          aria-hidden={i !== index}
          style={{ gridArea: "1 / 1", display: "inline-block", willChange: "transform, opacity, filter" }}
          initial={false}
          animate={
            !loaded
              ? { opacity: 0, y: 16, filter: "blur(4px)" }
              : i === index
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, y: -12, filter: "blur(6px)" }
          }
          transition={{ duration: 0.55, ease: EASE }}
        >
          {text}
        </motion.span>
      ))}
    </span>
  );
}

const MOTION_TAGS = {
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  span: motion.span,
};

// Blok teks yang naik halus. inView = animasi saat di-scroll ke viewport
// (untuk judul section); kalau false, animasi saat halaman selesai loading.
export function FadeUp({ children, className, delay = 0, tag = "div", inView = false }) {
  const reduce = useReducedMotion();
  const loaded = usePageLoaded();
  if (reduce) {
    const Tag = tag;
    return <Tag className={className}>{children}</Tag>;
  }
  const MotionTag = MOTION_TAGS[tag] || motion.div;
  const anim = inView
    ? {
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "0px 0px -8% 0px" },
      }
    : {
        initial: { opacity: 0, y: 14 },
        animate: loaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
      };
  return (
    <MotionTag
      className={className}
      transition={{ duration: 0.55, ease: EASE, delay }}
      {...anim}
    >
      {children}
    </MotionTag>
  );
}
