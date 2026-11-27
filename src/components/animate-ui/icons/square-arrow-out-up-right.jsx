// Square arrow out up right polos, tanpa @animate-ui/react/icons.
// IconWrapper di paket itu me-render AnimateIconContext langsung sebagai
// komponen (<AnimateIconContext value={...}>), fitur React 19. Di React 18
// itu diperlakukan sebagai Consumer yang memanggil children sebagai fungsi,
// padahal children-nya elemen React, jadi render crash ("r is not a function")
// dan halaman blank. SVG polos + animasi hover via CSS (components.css).
// Path dari Lucide (lucide-static v1.82.0).
function SquareArrowOutUpRight({ size = 20, className, animateOnHover, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
      <path d="m21 3-9 9" />
      <path d="M15 3h6v6" />
    </svg>
  );
}

export { SquareArrowOutUpRight, SquareArrowOutUpRight as SquareArrowOutUpRightIcon };
