import { profile } from "../data.js";

// Page footer: copyright line and links to llms.txt, agent.md, robots.txt.

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
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
