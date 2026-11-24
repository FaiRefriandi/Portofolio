import { useRef } from "react";
import { LiquidGlass } from "simple-liquid-glass";
import { profile } from "../data.js";
import GitHubHeatmap from "./GitHubHeatmap.jsx";

export default function Hero() {
  const coverRef = useRef(null);

  return (
    <section className="hero reveal" aria-label="Profile">
      {/* Cover / banner */}
      <div className="hero__cover" ref={coverRef}>
        <img className="hero__cover-img" src="assets/cover.gif" alt="" aria-hidden="true" loading="eager" draggable={false} />
      </div>

      {/* Profile body (Twitter style) */}
      <div className="hero__body">
        {/* Liquid glass strip over the bottom of the banner: clear material,
            almost no tint or frost, so the GIF reads through like real glass.
            backdropRef points at the cover so the refraction also works on
            phones and in Firefox/Safari, not just desktop Chromium. */}
        <div className="hero__glass" aria-hidden="true">
          <LiquidGlass
            material="clear"
            radius={0}
            blur={2}
            frost={0.05}
            saturation={100}
            aberrationIntensity={0.5}
            dispersion={12}
            glassColor="rgba(255, 255, 255, 0.05)"
            border={0.02}
            borderColor="rgba(255, 255, 255, 0.35)"
            backdropRef={coverRef}
            quality="high"
            className="hero__glass-panel"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        <div className="hero__inner">
          <div className="hero__profile">
            <div className="avatar" aria-hidden="true">
              <img src={profile.avatar} alt={profile.name} loading="eager" draggable={false} />
            </div>
            <div className="hero__content">
              <div className="name-row">
                <h1 className="hero__name">{profile.name}</h1>
                <dotlottie-player
                  src="assets/cat-white.lottie"
                  autoplay
                  loop
                  speed="1"
                  aria-hidden="true"
                />
              </div>
              <div className="hero__subtitle">{profile.subtitle}</div>
            </div>
          </div>

          <div className="hero__heatmap">
            <GitHubHeatmap username={profile.github} />
          </div>
        </div>
      </div>
    </section>
  );
}
