import { useEffect, useRef } from "react";

const BANDUNG = { lat: -6.9175, lng: 107.6191 };

// Module-level cache: avoids re-fetching the GeoJSON on remount/HMR, so the map
// never has a blank gap while waiting for the network.
let geoCache = null;
const PAD = 10; // px padding around the map inside the canvas
const STEP = 5; // px between dots
const DOT_R = 1.1; // dot radius
const TAU = Math.PI * 2;

// Deterministic pseudo-random in [0, 1) from an integer seed.
function hash(i) {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

// Ray-casting point-in-polygon test (screen space).
function inPoly(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0];
    const yi = pts[i][1];
    const xj = pts[j][0];
    const yj = pts[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

export default function DotMap({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let resizeTimer = 0;
    let disposed = false;
    let geoData = null;
    let geoBounds = null;
    let proj = null; // { x0, y0, mapW, mapH } — crop-to-fill projection
    let polys = []; // [{ pts, minX, minY, maxX, maxY }]
    let points = []; // [x, y, phase, speed]
    let bandung = null; // { x, y }

    const size = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      return { w: rect.width, h: rect.height };
    };

    function fitCanvas(w, h) {
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Crop-to-fill: on wide banners the map spans the banner width at its
    // natural aspect ratio (never squished) and the excess ocean top/bottom is
    // cropped by the cover's overflow:hidden. On narrow containers it instead
    // fills the banner height so the whole archipelago stays visible.
    function computeProjection(w, h) {
      const geoAspect =
        (geoBounds.east - geoBounds.west) / (geoBounds.north - geoBounds.south);
      const span = geoBounds.north - geoBounds.south;

      let mapW = Math.max(1, w - PAD * 2); // PAD only insets horizontally (crop mode)
      let mapH = mapW / geoAspect;
      if (mapH < h) {
        // Narrow container: fill the height, crop a sliver off each side.
        mapH = Math.max(1, h);
        mapW = mapH * geoAspect;
        return { x0: (w - mapW) / 2, y0: 0, mapW, mapH };
      }

      // Wide container: bias the crop window toward the main island band
      // (≈ -3.8° lat) so Java / Sulawesi / most of Papua stay centered; the far
      // southern islands (Timor) and northern tips can be cropped on desktop.
      const targetLat = -3.8;
      const centerFrac = Math.min(1, Math.max(0, (geoBounds.north - targetLat) / span));
      return { x0: PAD, y0: h / 2 - centerFrac * mapH, mapW, mapH };
    }

    function project(lng, lat) {
      const x =
        proj.x0 + ((lng - geoBounds.west) / (geoBounds.east - geoBounds.west)) * proj.mapW;
      const y =
        proj.y0 + ((geoBounds.north - lat) / (geoBounds.north - geoBounds.south)) * proj.mapH;
      return [x, y];
    }

    // Rebuild polygons + dot grid from the cached GeoJSON and current size.
    function rebuild(geo) {
      const { w, h } = size();
      if (w < 2 || h < 2) return;
      // skip if the canvas already matches this size (e.g. spurious resize events)
      if (
        Math.abs(w - canvas.width / dpr) < 1 &&
        Math.abs(h - canvas.height / dpr) < 1
      ) {
        return;
      }
      fitCanvas(w, h);
      proj = computeProjection(w, h);

      polys = [];
      const walkPoly = (c) => {
        if (typeof c[0][0] === "number") {
          const pts = c.map(([lng, lat]) => project(lng, lat));
          let minX = Infinity;
          let minY = Infinity;
          let maxX = -Infinity;
          let maxY = -Infinity;
          for (const [px, py] of pts) {
            if (px < minX) minX = px;
            if (px > maxX) maxX = px;
            if (py < minY) minY = py;
            if (py > maxY) maxY = py;
          }
          polys.push({ pts, minX, minY, maxX, maxY });
        } else c.forEach(walkPoly);
      };
      geo.features.forEach((f) => walkPoly(f.geometry.coordinates));

      points = [];
      let idx = 0;
      // only rasterize cells that fall inside the visible cover
      const yStart = Math.max(0, proj.y0);
      const yEnd = Math.min(h, proj.y0 + proj.mapH);
      const xStart = Math.max(0, proj.x0);
      const xEnd = Math.min(w, proj.x0 + proj.mapW);
      for (let y = yStart; y < yEnd; y += STEP) {
        for (let x = xStart; x < xEnd; x += STEP) {
          for (const poly of polys) {
            if (x < poly.minX || x > poly.maxX || y < poly.minY || y > poly.maxY) continue;
            if (inPoly(x, y, poly.pts)) {
              points.push([x, y, hash(idx * 7 + 1) * TAU, 0.9 + hash(idx * 13 + 5) * 1.4]);
              idx++;
              break;
            }
          }
        }
      }

      const [bx, by] = project(BANDUNG.lng, BANDUNG.lat);
      bandung = { x: bx, y: by };
    }

    function draw(now, animate) {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      if (!points.length) return;

      const t = now / 1000;
      const minA = 0.28;
      const maxA = 0.62;
      const levels = 8;
      const buckets = Array.from({ length: levels }, () => []);

      for (const p of points) {
        const a = animate
          ? minA + (maxA - minA) * (0.5 + 0.5 * Math.sin(t * p[3] + p[2]))
          : 0.45;
        const b = Math.min(levels - 1, Math.floor(((a - minA) / (maxA - minA)) * levels));
        buckets[b].push(p[0], p[1]);
      }

      for (let b = 0; b < levels; b++) {
        const arr = buckets[b];
        if (!arr.length) continue;
        const alpha = minA + ((maxA - minA) * (b + 0.5)) / levels;
        ctx.fillStyle = `rgba(232, 232, 232, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        for (let i = 0; i < arr.length; i += 2) {
          ctx.moveTo(arr[i] + DOT_R, arr[i + 1]);
          ctx.arc(arr[i], arr[i + 1], DOT_R, 0, TAU);
        }
        ctx.fill();
      }

      // Bandung blip (monochrome pulse, light on dark).
      if (bandung) {
        const pulse = animate ? (Math.sin(now / 500) + 1) / 2 : 0.5;
        const r = 2.5 + pulse * 3;
        ctx.beginPath();
        ctx.arc(bandung.x, bandung.y, r, 0, TAU);
        ctx.fillStyle = `rgba(232, 232, 232, ${(0.3 + pulse * 0.45).toFixed(3)})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(bandung.x, bandung.y, 2, 0, TAU);
        ctx.fillStyle = "#e8e8e8";
        ctx.fill();
      }
    }

    function frame(now) {
      try {
        draw(now, true);
      } catch {
        // never let a draw error kill the animation loop
      }
      if (!disposed) raf = requestAnimationFrame(frame);
    }

    function startLoop() {
      cancelAnimationFrame(raf);
      if (mq.matches) {
        draw(0, false); // static, calm render
        return;
      }
      // draw one frame synchronously so the map never flashes blank while
      // waiting for the first rAF tick (important on resize/remount).
      draw(performance.now(), true);
      raf = requestAnimationFrame(frame);
    }

    async function load() {
      try {
        if (!geoCache) {
          const res = await fetch("/data/indonesia.geojson");
          geoCache = await res.json();
        }
        if (disposed) return;
        const geo = geoCache;

        const coords = [];
        const walk = (c) => {
          if (typeof c[0] === "number") coords.push(c);
          else c.forEach(walk);
        };
        if (disposed) return;
        geoData = geo;
        geo.features.forEach((f) => walk(f.geometry.coordinates));
        geoBounds = {
          west: Math.min(...coords.map((c) => c[0])),
          east: Math.max(...coords.map((c) => c[0])),
          south: Math.min(...coords.map((c) => c[1])),
          north: Math.max(...coords.map((c) => c[1])),
        };

        if (disposed) return;
        rebuild(geo);
        if (!disposed) startLoop();
        if (!points.length) {
          // container may not be laid out yet — retry on the next frame
          raf = requestAnimationFrame(() => {
            if (!disposed) {
              rebuild(geo);
              startLoop();
            }
          });
        }
      } catch {
        // silent fail — background just stays empty
      }
    }

    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!geoBounds) return;
        rebuild(geoData);
        startLoop();
      }, 120);
    }

    const onVis = () => {
      // redraw when the tab becomes visible again (rAF may have been paused)
      if (!document.hidden && !disposed && geoBounds) {
        rebuild(geoData);
        startLoop();
      }
    };

    load();
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    const onMq = () => startLoop();
    mq.addEventListener?.("change", onMq);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      mq.removeEventListener?.("change", onMq);
    };
  }, []);

  return <canvas ref={canvasRef} className={`dotmap ${className}`} aria-hidden="true" />;
}
