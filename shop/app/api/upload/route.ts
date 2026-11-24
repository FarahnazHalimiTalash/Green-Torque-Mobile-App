import { promises as fs } from "fs";
import path from "path";

import { json, options } from "@/lib/http";
import { createId } from "@/lib/ids";

export const runtime = "nodejs";

const MAX_BYTES = 80 * 1024 * 1024;
const allowed = new Set(["video/mp4", "video/quicktime", "video/webm", "video/ogg"]);

function extensionFor(type: string, filename: string) {
  const fromName = path.extname(filename).toLowerCase();
  if (fromName && [".mp4", ".mov", ".webm", ".ogg"].includes(fromName)) return fromName;
  if (type === "video/quicktime") return ".mov";
  if (type === "video/webm") return ".webm";
  if (type === "video/ogg") return ".ogg";
  return ".mp4";
}

export async function OPTIONS() {
  return options();
}

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return json({ error: "Choose a video file." }, 400);
  }
  if (!file.type.startsWith("video/") && !allowed.has(file.type)) {
    return json({ error: "Upload a video file." }, 400);
  }
  if (file.size > MAX_BYTES) {
    return json({ error: "Video must be 80 MB or smaller." }, 400);
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const name = `${createId("vid")}${extensionFor(file.type, file.name)}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), bytes);
  return json({ uri: `/uploads/${name}` });
}
