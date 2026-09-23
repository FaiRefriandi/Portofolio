import { profile } from "../data.js";
import DotMap from "./DotMap.jsx";
import GitHubHeatmap from "./GitHubHeatmap.jsx";

export default function Hero() {
  return (
    <section className="hero reveal" aria-label="Profile">
      {/* Cover / banner */}
      <div className="hero__cover">
        <DotMap className="hero__map" />
      </div>

      {/* Profile body (Twitter style) */}
      <div className="hero__body">
        <div className="hero__profile">
          <div className="avatar" aria-hidden="true">
            <img src={profile.avatar} alt={profile.name} loading="eager" />
          </div>
          <div className="hero__content">
            <div className="name-row">
              <h1 className="hero__name">{profile.name}</h1>
              <dotlottie-player
                src="https://lottie.host/07f05192-a1b7-4133-a26b-19860df7de6a/CEA68admAD.lottie"
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
    </section>
  );
}
