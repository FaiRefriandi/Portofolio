import { useEffect, useRef, useState } from "react";

// Handwritten stroke effect following the shadcn Hello Effect mechanism:
// each pen stroke is one SVG path with pathLength 1, drawn by animating
// stroke-dashoffset from 1 to 0 with its own delay, duration and easing.
// Pure CSS, no animation library, no Tailwind. Speed divides every
// stroke delay and duration, so the hand keeps its rhythm at any speed.
//
// The "hello" strokes are the original paths from chanhdai.com
// apple-hello-effect (MIT licensed), viewBox 0 0 638 200, 3.5s at speed 1.
// "See ya!" is a custom word drawn in the same style for this project:
// shadcn only ships hello and xin chào, a word cannot be generated
// from a string, so its strokes were hand-drawn and visually checked.

const STROKE_WIDTH = 14.8883;

const WORDS = {
  hello: {
    label: "hello",
    viewBox: "0 0 638 200",
    strokes: [
      {
        d: "M8.69214 166.553C36.2393 151.239 61.3409 131.548 89.8191 98.0295C109.203 75.1488 119.625 49.0228 120.122 31.0026C120.37 17.6036 113.836 7.43883 101.759 7.43883C88.3598 7.43883 79.9231 17.6036 74.7122 40.9363C69.005 66.5793 64.7866 96.0036 54.1166 190.356",
        duration: 0.8,
        delay: 0,
        ease: "ease-in-out",
      },
      {
        d: "M55.1624 181.135C60.6251 133.114 81.4118 98.0479 107.963 98.0479C123.844 98.0479 133.937 110.703 131.071 128.817C129.457 139.487 127.587 150.405 125.408 163.06C122.869 178.941 130.128 191.348 152.122 191.348C184.197 191.348 219.189 173.523 237.097 145.915C243.198 136.509 245.68 128.073 245.928 119.884C246.176 104.996 237.739 93.8296 222.851 93.8296C203.992 93.8296 189.6 115.17 189.6 142.465C189.6 171.745 205.481 192.341 239.208 192.341C285.066 192.341 335.86 137.292 359.199 75.8585C365.788 58.513 368.26 42.4065 368.26 31.1512C368.26 17.8057 364.042 7.55823 352.131 7.55823C340.469 7.55823 332.777 16.6141 325.829 30.9129C317.688 47.4967 311.667 71.4162 309.203 98.4549C303 166.301 316.896 191.348 349.936 191.348C390 191.348 434.542 135.534 457.286 75.6686C463.803 58.513 466.275 42.4065 466.275 31.1512C466.275 17.8057 462.057 7.55823 450.146 7.55823C438.484 7.55823 430.792 16.6141 423.844 30.9129C415.703 47.4967 409.682 71.4162 407.218 98.4549C401.015 166.301 414.911 191.348 444.416 191.348C473.874 191.348 489.877 165.67 499.471 138.402C508.955 111.447 520.618 94.8221 544.935 94.8221C565.035 94.8221 580.916 109.71 580.916 137.75C580.916 168.768 560.792 192.093 535.362 192.341C512.984 192.589 498.285 174.475 499.774 147.179C501.511 116.907 519.873 94.8221 543.943 94.8221C557.839 94.8221 569.51 100.999 578.682 107.725C603.549 125.866 622.709 114.656 630.047 96.7186",
        duration: 2.8,
        delay: 0.7,
        ease: "ease-in-out",
      },
    ],
  },
  seeya: {
    label: "See ya!",
    viewBox: "0 0 640 230",
    strokes: [
      {
        // S + ee, one continuous stroke
        d: "M108 58C82 36 44 42 40 72C37 96 64 104 80 114C96 124 104 136 97 148C90 160 64 164 48 155C64 155 84 148 96 138C102 133 108 131 114 131C122 120 130 108 140 100C134 93 126 94 120 99C112 112 110 126 112 138C116 148 128 152 142 150C150 132 156 110 166 102C158 95 150 96 146 101C140 114 138 128 142 140C146 149 158 152 170 150C182 148 192 142 198 132",
        duration: 1.3,
        delay: 0,
        ease: "ease-in-out",
      },
      {
        // y + a, one continuous stroke
        d: "M198 132C206 128 212 116 214 104C216 122 218 140 222 150C226 157 236 157 240 149C244 141 246 122 248 104C250 124 250 144 246 164C242 184 232 196 222 196C214 196 210 188 216 178C222 168 234 158 244 152C258 150 272 140 284 130C292 124 300 118 308 114C300 106 290 100 284 108C278 118 278 132 284 142C290 150 302 152 310 148C318 144 324 130 322 116C321 110 326 106 330 102",
        duration: 1.0,
        delay: 1.3,
        ease: "ease-in-out",
      },
      {
        // ! stem
        d: "M392 96C396 110 396 126 394 142",
        duration: 0.2,
        delay: 2.35,
        ease: "ease-in-out",
      },
      {
        // ! dot
        d: "M391 161C394 159 397 162 397 166C397 170 393 172 390 170C387 168 388 163 391 161",
        duration: 0.15,
        delay: 2.55,
        ease: "ease-in-out",
      },
      {
        // underline flourish
        d: "M24 210C180 224 420 222 614 188",
        duration: 0.8,
        delay: 2.7,
        ease: "ease-in-out",
      },
    ],
  },
};

export function HelloEffect({ word = "hello", speed = 1, onComplete, className = "" }) {
  const entry = WORDS[word] || WORDS.hello;
  const [reducedMotion, setReducedMotion] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const doneRef = useRef(false);
  onCompleteRef.current = onComplete;

  const safeSpeed = speed > 0 ? speed : 1;
  const totalMs =
    (Math.max(...entry.strokes.map((s) => s.delay + s.duration)) / safeSpeed) * 1000;

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      if (!doneRef.current) {
        doneRef.current = true;
        onCompleteRef.current?.();
      }
      return undefined;
    }
    const t = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onCompleteRef.current?.();
      }
    }, totalMs);
    return () => clearTimeout(t);
  }, [reducedMotion, totalMs]);

  return (
    <svg
      role="img"
      aria-label={entry.label}
      viewBox={entry.viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE_WIDTH}
      className={`hello-effect ${className}`.trim()}
      data-word={word}
    >
      <title>{entry.label}</title>
      {entry.strokes.map((s, i) => (
        <path
          key={i}
          d={s.d}
          pathLength={1}
          strokeLinecap="round"
          className="hello-effect__stroke"
          style={
            reducedMotion
              ? undefined
              : {
                  "--hello-effect-delay": `${s.delay / safeSpeed}s`,
                  "--hello-effect-duration": `${s.duration / safeSpeed}s`,
                  "--hello-effect-ease": s.ease,
                }
          }
        />
      ))}
    </svg>
  );
}
