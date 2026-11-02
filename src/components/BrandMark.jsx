export default function BrandMark({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="brandBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9a93fa" />
          <stop offset="100%" stopColor="#6c63e0" />
        </linearGradient>
      </defs>

      {/* rounded square */}
      <rect width="40" height="40" rx="11" fill="url(#brandBg)" />

      {/* Q ring */}
      <circle cx="18" cy="18" r="8.5" fill="none" stroke="#ffffff" strokeWidth="3.4" />

      {/* Q tail drawn as a queue arrow */}
      <path
        d="M24 24 L31 31"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M25.5 31 H31 V25.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}