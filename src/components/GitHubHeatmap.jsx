import { useEffect, useMemo, useRef, useState } from "react";
// Bundled snapshot of the real contribution data (same-origin, so it renders
// instantly and works even when the live API is blocked). This is user-specific
// — refresh it periodically to keep the portfolio current.
import bundled from "../data/contributions.json";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const LEVEL_OPACITY = [0.06, 0.2, 0.42, 0.66, 0.95];

// The public community API mirrors a user's contribution graph as JSON.
// If it fails (offline / API down) we fall back to a deterministic pattern
// that still looks like a real contribution heatmap.
const API = "https://github-contributions-api.jogruber.de/v4";

function iso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Deterministic fake contributions (same username → same pattern).
function fakeContributions(username, days) {
  const rand = mulberry32(hashStr(username));
  const today = new Date();
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dow = d.getDay();
    const r = rand();
    let count = 0;
    if (r < 0.5) count = 0;
    else if (r < 0.72) count = 1;
    else if (r < 0.86) count = 2 + Math.floor(rand() * 2);
    else if (r < 0.95) count = 4 + Math.floor(rand() * 3);
    else count = 8 + Math.floor(rand() * 8);
    if (dow === 0 || dow === 6) count = Math.floor(count * 0.35); // quieter weekends
    out.push({ date: iso(d), count });
  }
  return out;
}

function levelOf(count) {
  if (count <= 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
}

function prettyDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function countText(count) {
  if (count <= 0) return "No contributions";
  if (count === 1) return "1 contribution";
  return `${count} contributions`;
}

export default function GitHubHeatmap({ username, className = "" }) {
  // Start from the bundled snapshot (real data, zero flash), then keep it fresh
  // by polling the live API. The generated pattern is only a last resort.
  const [api, setApi] = useState(bundled);

  useEffect(() => {
    let alive = true;
    let seq = 0; // only the most recent request may update state
    const load = async () => {
      const id = ++seq;
      try {
        const res = await fetch(`${API}/${username}?y=last`, { cache: "no-store" });
        if (res.ok) {
          const live = await res.json();
          if (alive && id === seq && Array.isArray(live.contributions)) {
            setApi(live);
            return true;
          }
        }
      } catch {
        /* keep whatever data we already have */
      }
      return false;
    };
    // real-time-ish: poll every minute, but back off to 5 min while the API
    // is failing so we don't hammer a dead endpoint; reset on success.
    let intervalMs = 60 * 1000;
    let timer = 0;
    const poll = async () => {
      const ok = await load();
      intervalMs = ok ? 60 * 1000 : Math.min(5 * 60 * 1000, intervalMs * 2);
      clearInterval(timer);
      timer = setInterval(poll, intervalMs);
    };
    poll();
    const onVisible = () => {
      if (!document.hidden) poll();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [username]);

  const { cells, months, total } = useMemo(() => {
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay()); // weeks start on Sunday
    const firstSunday = new Date(sunday);
    firstSunday.setDate(sunday.getDate() - 52 * 7); // 53 columns

    const map = new Map();
    if (api && Array.isArray(api.contributions)) {
      api.contributions.forEach((c) => map.set(c.date, c.count || 0));
    } else {
      fakeContributions(username, 371).forEach((c) => map.set(c.date, c.count));
    }

    const months = [];
    let prevMonth = -1;
    for (let c = 0; c < 53; c++) {
      const ws = new Date(firstSunday);
      ws.setDate(firstSunday.getDate() + c * 7);
      const m = ws.getMonth();
      if (m !== prevMonth) {
        months.push({ label: MONTHS[m], col: c });
        prevMonth = m;
      }
    }

    // Row-major (7 rows outer, 53 columns inner) so cells line up with CSS
    // grid's row-by-row auto-placement: each column = one week, left→right =
    // oldest → newest. column 0 = first Sunday, row 0 = Sunday.
    const cells = [];
    let sum = 0;
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 53; c++) {
        const d = new Date(firstSunday);
        d.setDate(firstSunday.getDate() + c * 7 + r);
        const key = iso(d);
        const count = map.get(key) || 0;
        sum += count;
        cells.push({ count, level: levelOf(count), iso: key });
      }
    }
    const apiTotal = api && api.total ? api.total.lastYear : null;
    return { cells, months, total: apiTotal != null ? apiTotal : sum };
  }, [api, username]);

  // Custom swipe scrollbar: the native ("classic") scrollbar is hidden and
  // replaced with a slim themed thumb that mirrors the scroll position.
  // It only renders when the grid actually overflows (mobile) and stays
  // hidden on desktop where the full grid fits.
  const scrollRef = useRef(null);
  const trackRef = useRef(null);
  const [bar, setBar] = useState(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const { scrollWidth, clientWidth, scrollLeft } = el;
      if (scrollWidth <= clientWidth + 1) {
        setBar((b) => (b === null ? b : null));
        return;
      }
      const widthPct = (clientWidth / scrollWidth) * 100;
      const maxScroll = scrollWidth - clientWidth;
      const leftPct = maxScroll > 0 ? (scrollLeft / maxScroll) * (100 - widthPct) : 0;
      const next = {
        left: leftPct,
        width: widthPct,
        canLeft: scrollLeft > 2,
        canRight: scrollLeft < maxScroll - 2,
      };
      setBar((b) =>
        b &&
        Math.abs(b.left - next.left) < 0.05 &&
        Math.abs(b.width - next.width) < 0.05 &&
        b.canLeft === next.canLeft &&
        b.canRight === next.canRight
          ? b
          : next
      );
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    if (ro) ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (ro) ro.disconnect();
    };
  }, []);

  // Drag the custom thumb to scroll (pointer events cover mouse + touch).
  const onThumbPointerDown = (e) => {
    const el = scrollRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    e.preventDefault();
    const startX = e.clientX;
    const startScroll = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const maxThumb = track.clientWidth - e.currentTarget.offsetWidth;
    const move = (ev) => {
      if (maxThumb > 0) el.scrollLeft = startScroll + ((ev.clientX - startX) / maxThumb) * maxScroll;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  // Tap / click on the track jumps the grid straight to that position.
  const onTrackPointerDown = (e) => {
    if (e.target !== e.currentTarget) return;
    const el = scrollRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    el.scrollTo({ left: ratio * (el.scrollWidth - el.clientWidth), behavior: "smooth" });
  };

  // Click / tap a day cell → floating bubble with that day's info.
  // Tapping the same cell again toggles it closed.
  const [tip, setTip] = useState(null);
  const onCellClick = (cell, e) => {
    if (tip && tip.iso === cell.iso) {
      setTip(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const below = rect.top < 96; // not enough room above → show under the cell
    const x = Math.min(Math.max(rect.left + rect.width / 2, 112), window.innerWidth - 112);
    setTip({
      iso: cell.iso,
      count: cell.count,
      x,
      y: below ? rect.bottom + 10 : rect.top - 10,
      below,
    });
  };

  // Dismiss the bubble on Escape, scroll, resize, or a tap outside
  // the cells and the bubble itself.
  useEffect(() => {
    if (!tip) return;
    const close = () => setTip(null);
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    const onDown = (e) => {
      if (e.target && e.target.closest && e.target.closest(".gh-heatmap__cell, .gh-heatmap__tip")) return;
      close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", close, { capture: true, passive: true });
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", close, { capture: true });
      window.removeEventListener("resize", close);
    };
  }, [tip]);

  return (
    <div className={`gh-heatmap ${className}`}>
      <div className="gh-heatmap__head">
        <span className="gh-heatmap__label">GitHub contributions</span>
        <span className="gh-heatmap__total">
          {total.toLocaleString("id-ID")} in the last year
        </span>
      </div>

      {/* Scroll wrapper: desktop shows the full 53-week grid, mobile keeps a
          fixed cell size and scrolls horizontally (like GitHub) so every dot
          stays exactly the same size instead of being squished unevenly. */}
      <div
        ref={scrollRef}
        className={`gh-heatmap__scroll${bar && bar.canLeft ? " gh-heatmap__scroll--more-left" : ""}${bar && bar.canRight ? " gh-heatmap__scroll--more-right" : ""}`}
      >
        <div className="gh-heatmap__scroll-inner">
          {/* Labels use the exact same 53-column grid as the cells, so each label
              starts precisely at its week's column and can never drift out of sync.
              The row clips any label that would run past the right edge. */}
          <div className="gh-heatmap__months" aria-hidden="true">
            {months.map((m) => {
              const span = Math.min(4, 53 - m.col);
              // drop a label that only has ~1 column of room — it would be
              // clipped at the row's right edge (GitHub does the same)
              if (span < 2) return null;
              return (
                <span
                  key={`${m.col}-${m.label}`}
                  className="gh-heatmap__month"
                  style={{ gridColumn: `${m.col + 1} / span ${span}` }}
                >
                  {m.label}
                </span>
              );
            })}
          </div>

          <div
            className="gh-heatmap__grid"
            role="img"
            aria-label={`GitHub contribution heatmap, ${total} contributions in the last year`}
          >
            {cells.map((cell) => (
              <span
                key={cell.iso}
                className="gh-heatmap__cell"
                title={`${cell.count} contribution${cell.count === 1 ? "" : "s"} on ${cell.iso}`}
                style={{ background: `rgba(232, 232, 232, ${LEVEL_OPACITY[cell.level]})` }}
                onClick={(e) => onCellClick(cell, e)}
              />
            ))}
          </div>
        </div>
      </div>

      {bar && (
        <div
          ref={trackRef}
          className="gh-heatmap__scrollbar"
          onPointerDown={onTrackPointerDown}
          aria-hidden="true"
        >
          <div
            className="gh-heatmap__scrollbar-thumb"
            style={{ left: `${bar.left}%`, width: `${bar.width}%` }}
            onPointerDown={onThumbPointerDown}
          />
        </div>
      )}

      {tip && (
        <div
          className={`gh-heatmap__tip${tip.below ? " gh-heatmap__tip--below" : ""}`}
          style={{ left: tip.x, top: tip.y }}
          role="status"
        >
          <strong>{countText(tip.count)}</strong>
          <span>{prettyDate(tip.iso)}</span>
        </div>
      )}

      <div className="gh-heatmap__foot" aria-hidden="true">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className="gh-heatmap__swatch" style={{ opacity: LEVEL_OPACITY[l] }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
