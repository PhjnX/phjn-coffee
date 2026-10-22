"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

/** Base address printed into table QR codes: NEXT_PUBLIC_SITE_URL when set, else the address the admin is open on. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "");
}

export function tableLink(number: string): string {
  return `${siteUrl()}/menu?ban=${number}`;
}

/** QR image for one table's ordering link. */
export function TableQr({ number, size = 220, className = "" }: { number: string; size?: number; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    QRCode.toDataURL(tableLink(number), { margin: 1, width: size * 2, errorCorrectionLevel: "M", color: { dark: "#2e231c", light: "#ffffff" } })
      .then(setSrc)
      .catch(() => setSrc(null));
  }, [number, size]);
  return (
    <div className={`overflow-hidden rounded-xl bg-white ${className}`} style={{ width: size, height: size }}>
      {src && <img src={src} alt={`Mã QR gọi món bàn ${number}`} width={size} height={size} className="size-full" />}
    </div>
  );
}
