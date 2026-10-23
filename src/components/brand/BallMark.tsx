/** The site mark: a gold ball with seam lines. Decorative. */
export default function BallMark({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <radialGradient id="ballmark-gold" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fbf1d0" />
          <stop offset="45%" stopColor="#e9b949" />
          <stop offset="100%" stopColor="#8a6414" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#ballmark-gold)" />
      <g
        fill="none"
        stroke="#5c430d"
        strokeOpacity="0.55"
        strokeWidth="2.2"
        strokeLinejoin="round"
      >
        <path d="M32 20 l11 8 -4 13 h-14 l-4 -13 z" />
        <path d="M32 20 V4 M43 28 l14 -6 M39 41 l9 13 M25 41 l-9 13 M21 28 L7 22" />
      </g>
    </svg>
  );
}
