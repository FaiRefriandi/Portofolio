import { profile } from "../data.js";

// Page footer: copyright line only.

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <p className="footer__copy kicker">
        © {year} {profile.name} · Bandung, Indonesia
      </p>
    </footer>
  );
}
