/** Cup on a saucer with two curls of steam, drawn on a 48×40 grid. */
export function CupGlyph({ x = 0, y = 0, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M20 2c-3 3 3 5 0 9M27 3c-3 3 3 5 0 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 17h26v4c0 7-5.5 12-13 12S10 28 10 21z" fill="currentColor" />
      <path d="M36 20h2.5a4 4 0 0 1 0 8H34" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <path d="M6 35.5h34" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </g>
  );
}

export function CupIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 46 40" className={className} aria-hidden>
      <CupGlyph />
    </svg>
  );
}

/** Three coffee beans, used as the divider under section titles. */
export function BeansIcon({ className = "" }: { className?: string }) {
  const bean = (cx: number, cy: number, r: number) => (
    <g transform={`rotate(${r} ${cx} ${cy})`}>
      <ellipse cx={cx} cy={cy} rx="5" ry="7.5" fill="currentColor" />
      <path d={`M${cx} ${cy - 6.5}c-2.5 4 2.5 9 0 13`} stroke="var(--paper)" strokeWidth="1.3" fill="none" />
    </g>
  );
  return (
    <svg viewBox="0 0 36 30" className={className} aria-hidden>
      {bean(18, 9, 0)}
      {bean(10, 20, -35)}
      {bean(26, 20, 35)}
    </svg>
  );
}

/**
 * Logo: a steaming cup resting on the top edge of a chamfered frame that holds the name in bold caps.
 * Simple on purpose, so it reads at sidebar size and as a small top-bar mark.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 104" className={className} role="img" aria-label="Phjn Coffee">
      <g color="currentColor">
        <CupGlyph x={97} y={0} scale={1} />
      </g>
      <path
        d="M96 36H24L12 48V80L24 92H216L228 80V48L216 36H144"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <text
        x="120"
        y="73"
        textAnchor="middle"
        fill="currentColor"
        fontSize="27"
        fontWeight="700"
        letterSpacing="1"
        style={{ fontFamily: "var(--font-brand)" }}
      >
        Phjn Coffee
      </text>
    </svg>
  );
}
