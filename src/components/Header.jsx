export default function Header() {
  return (
    <header className="site-header" role="banner">
      <div className="site-header__inner">
        <a
          href="#top"
          className="brand"
          aria-label="Back to top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          FR.
        </a>
      </div>
    </header>
  );
}
