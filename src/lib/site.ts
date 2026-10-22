/** Public address of the shop (NEXT_PUBLIC_SITE_URL), used for metadata, sitemap and table QR codes. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
