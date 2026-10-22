import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Lets a production build go to another folder (NEXT_DIST_DIR=.next-prod) while `next dev` keeps using .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Menu photos are shrunk in the browser before upload (Vercel caps request bodies at ~4.5MB).
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  // Photos uploaded from the admin live in Supabase Storage.
  images: { remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }] },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
