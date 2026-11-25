import { profile } from "../data.js";

// Page footer: brand row and social links above the divider, copyright
// line and links to llms.txt, agent.md, robots.txt below it.

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__top">
        <span className="footer__brand">Morphkite</span>
        <nav className="footer__socials" aria-label="Social links">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <img src="assets/icons/facebook.svg" alt="" aria-hidden="true" />
          </a>
          <a href="https://github.com/FaiRefriandi" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <img src="assets/icons/github.svg" alt="" aria-hidden="true" />
          </a>
          <a href="https://x.com/Mrphkt" target="_blank" rel="noopener noreferrer" aria-label="X">
            <img src="assets/icons/x.svg" alt="" aria-hidden="true" />
          </a>
        </nav>
      </div>
      <div className="footer__divider" aria-hidden="true" />
      <p className="footer__copy">
        © {year} {profile.name}. All rights reserved.
      </p>
      <nav className="footer__links" aria-label="Site files">
        <a href="/llms.txt">llms.txt</a>
        <a href="/agent.md">agent.md</a>
        <a href="/robots.txt">robots.txt</a>
      </nav>
    </footer>
  );
}
