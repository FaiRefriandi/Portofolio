import { profile } from "../data.js";
import { FadeUp, StaggerWords } from "./AnimatedText.jsx";

export default function Hero() {

  return (
    <section className="hero reveal" aria-label="Profile">
      {/* Cover / banner */}
      <div className="hero__cover">
        <img className="hero__cover-img" src="assets/cover.gif" alt="" aria-hidden="true" loading="eager" draggable={false} />
      </div>

      {/* Profile body (Twitter style) */}
      <div className="hero__body">
        <div className="hero__inner">
          <div className="hero__profile">
            <div className="avatar" aria-hidden="true">
              <img src={profile.avatar} alt={profile.name} loading="eager" draggable={false} />
            </div>
            <div className="hero__content">
              <div className="name-row">
                <h1 className="hero__name"><StaggerWords text={profile.name} /></h1>
                <dotlottie-player
                  src="assets/cat-white.lottie"
                  autoplay
                  loop
                  speed="1"
                  aria-hidden="true"
                />
              </div>
              <FadeUp className="hero__subtitle" delay={0.15}>{profile.subtitle}</FadeUp>
              <FadeUp className="hero__about" delay={0.3}>
                <h2>About me</h2>
                <p>Zup! I'm Fai, a full-stack builder obsessed with autonomous agents, emerging tech, and turning caffeine into production code. I spend most of my compute experimenting with bleeding-edge architectures and shipping cool projects.</p>
              </FadeUp>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
