import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Serves photos uploaded from the admin (saved in data/uploads). Files added to /public after a
 * build are not served by Next.js, so uploads live outside it and come through here.
 */
export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[a-z0-9-]+\.webp$/.test(file)) return new Response("Not found", { status: 404 });
  try {
    const data = await fs.readFile(path.join(process.cwd(), "data", "uploads", file));
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
