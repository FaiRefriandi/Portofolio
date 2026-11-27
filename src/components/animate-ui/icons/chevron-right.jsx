// Chevron kanan polos, tanpa @animate-ui/react/icons.
// IconWrapper di paket itu me-render AnimateIconContext langsung sebagai
// komponen (<AnimateIconContext value={...}>), fitur React 19. Di React 18
// itu diperlakukan sebagai Consumer yang memanggil children sebagai fungsi,
// padahal children-nya elemen React, jadi render crash ("r is not a function")
// dan halaman blank. SVG polos + animasi hover via CSS (components.css).
function ChevronRight({ size = 20, className, animateOnHover, ...props }) {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export { ChevronRight, ChevronRight as ChevronRightIcon };
