"use client";

import { useId } from "react";
import type { ProductArtSpec } from "@/lib/types";

/**
 * Product illustrations drawn in SVG from a few parameters, so the menu has a consistent
 * look without stock photos. Swap for real photos later by giving products an imageUrl.
 */
export function ProductArt({ art, className }: { art: ProductArtSpec; className?: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 140" className={className} role="img" aria-hidden>
      <ellipse cx="60" cy="133" rx="38" ry="5" fill="rgb(42 26 16 / 0.12)" />
      {art.kind === "cup" ? <Cup art={art} uid={uid} /> : <Pastry art={art} />}
    </svg>
  );
}

type CupSpec = Extract<ProductArtSpec, { kind: "cup" }>;
type PastrySpec = Extract<ProductArtSpec, { kind: "pastry" }>;

const CUP = "M24 36 H96 L87 126 Q86.5 131 81.5 131 H38.5 Q33.5 131 33 126 Z";

function Cup({ art, uid }: { art: CupSpec; uid: string }) {
  const clip = `cup-${uid}`;
  const grad = `liq-${uid}`;
  const top = art.cream ? 50 : 46;

  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <path d={CUP} />
        </clipPath>
        <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={art.liquid[0]} />
          <stop offset="1" stopColor={art.liquid[1]} />
        </linearGradient>
      </defs>

      {/* straw */}
      <path d="M70 6 L64 92" stroke="#2a1a10" strokeOpacity="0.85" strokeWidth="5" strokeLinecap="round" />

      <g clipPath={`url(#${clip})`}>
        <rect x="20" y="20" width="80" height="120" fill="#fff" fillOpacity="0.55" />
        <rect x="20" y={top} width="80" height="100" fill={`url(#${grad})`} />
        {art.cream && <rect x="20" y="38" width="80" height="14" fill={art.cream} />}
        {art.cream && <path d={`M20 52 Q40 ${56} 60 52 T100 52 V56 H20 Z`} fill={art.cream} />}
        {art.ice &&
          [
            [36, 60, -12],
            [58, 70, 8],
            [44, 84, 18],
            [68, 56, -4],
          ].map(([x, y, r], i) => (
            <rect
              key={i}
              x={x}
              y={y}
              width="16"
              height="16"
              rx="3.5"
              fill="#fff"
              fillOpacity="0.35"
              stroke="#fff"
              strokeOpacity="0.6"
              transform={`rotate(${r} ${x + 8} ${y + 8})`}
            />
          ))}
        {art.garnish && (
          <g>
            <circle cx="76" cy="66" r="10" fill={art.garnish} fillOpacity="0.9" />
            <circle cx="76" cy="66" r="6.5" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.2" />
            <circle cx="44" cy="96" r="7" fill={art.garnish} fillOpacity="0.8" />
          </g>
        )}
        {art.pearls &&
          Array.from({ length: 14 }, (_, i) => {
            const row = Math.floor(i / 7);
            const col = i % 7;
            return (
              <circle
                key={i}
                cx={38 + col * 7.4 + (row % 2) * 3.5}
                cy={124 - row * 7}
                r="3.6"
                fill={art.pearls}
              />
            );
          })}
        {/* glass highlight */}
        <path d="M30 40 L38 126" stroke="#fff" strokeOpacity="0.45" strokeWidth="4" strokeLinecap="round" />
      </g>

      <path d={CUP} fill="none" stroke="#2a1a10" strokeOpacity="0.18" strokeWidth="1.2" />
      {/* rim */}
      <rect x="20" y="31" width="80" height="7" rx="3.5" fill="#fffaf2" stroke="#2a1a10" strokeOpacity="0.15" />
      {/* label band */}
      <rect x="41" y="104" width="38" height="12" rx="6" fill="#fffaf2" fillOpacity="0.9" />
      <text x="60" y="113" textAnchor="middle" fontSize="7" fontWeight="700" fill="#2a1a10" letterSpacing="1">
        PHJN
      </text>
    </g>
  );
}

function Pastry({ art }: { art: PastrySpec }) {
  const { color, accent = "#7a4a24" } = art;
  switch (art.shape) {
    case "croissant":
      return (
        <g transform="translate(0 18)">
          <path d="M14 92 Q22 62 44 56 Q60 52 76 56 Q98 62 106 92 Q96 82 86 84 Q74 70 60 70 Q46 70 34 84 Q24 82 14 92 Z" fill={color} />
          {[
            "M34 84 Q40 64 52 60",
            "M46 72 Q54 58 64 58",
            "M60 70 Q68 58 78 60",
            "M74 74 Q84 64 92 72",
          ].map((d) => (
            <path key={d} d={d} fill="none" stroke={accent} strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
          ))}
          <path d="M22 80 Q40 60 60 58 Q80 60 98 80" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "cake":
      return (
        <g>
          <path d="M22 70 L96 54 L98 120 L22 126 Z" fill={color} />
          <path d="M22 70 L96 54 L98 64 L22 80 Z" fill={accent} fillOpacity="0.9" />
          <path d="M22 96 L97 84 L97 92 L22 104 Z" fill={accent} fillOpacity="0.7" />
          <path d="M22 116 L98 108 L98 120 L22 126 Z" fill={accent} fillOpacity="0.6" />
          {Array.from({ length: 18 }, (_, i) => (
            <circle key={i} cx={28 + ((i * 37) % 66)} cy={62 + ((i * 13) % 12) - i * 0.4} r="1.2" fill="#2a1a10" fillOpacity="0.5" />
          ))}
        </g>
      );
    case "tart":
      return (
        <g>
          <path d="M18 112 L60 56 L102 112 Z" fill={color} />
          <path d="M18 112 L102 112 L100 124 L20 124 Z" fill="#b97c3e" />
          <path d="M30 96 L60 56 L90 96 Q75 90 60 96 Q45 102 30 96 Z" fill={accent} fillOpacity="0.85" />
          <circle cx="58" cy="80" r="2.2" fill="#2a1a10" fillOpacity="0.6" />
          <circle cx="66" cy="86" r="2" fill="#2a1a10" fillOpacity="0.6" />
        </g>
      );
    case "loaf":
      return (
        <g>
          <rect x="16" y="66" width="88" height="58" rx="16" fill={color} />
          <path d="M16 86 Q60 70 104 86" fill="none" stroke="#2a1a10" strokeOpacity="0.15" strokeWidth="3" />
          {[30, 48, 66, 84].map((x, i) => (
            <ellipse key={x} cx={x + 6} cy={76 - (i % 2) * 3} rx="9" ry="5" fill={accent} transform={`rotate(-12 ${x + 6} 76)`} />
          ))}
        </g>
      );
    case "cookie":
      return (
        <g>
          <circle cx="60" cy="92" r="40" fill={color} />
          <circle cx="60" cy="92" r="40" fill="none" stroke="#2a1a10" strokeOpacity="0.08" strokeWidth="4" />
          {[
            [44, 78, 5], [68, 74, 4], [80, 96, 5.5], [52, 104, 4.5], [64, 116, 4], [36, 98, 3.5], [74, 86, 3],
          ].map(([x, y, r]) => (
            <rect key={`${x}-${y}`} x={x - r} y={y - r} width={r * 2} height={r * 2} rx={r * 0.5} fill={accent} transform={`rotate(20 ${x} ${y})`} />
          ))}
        </g>
      );
  }
}
