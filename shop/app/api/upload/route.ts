import { promises as fs } from "fs";
import path from "path";

import { readDb } from "@/lib/db";
import { json, options } from "@/lib/http";
import { createId } from "@/lib/ids";
import { canUploadWorkMedia } from "@/lib/staff";

export const runtime = "nodejs";

const MAX_BYTES = 80 * 1024 * 1024;
const imageExt = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic"]);
const videoExt = new Set([".mp4", ".mov", ".webm", ".ogg"]);

function extensionFor(type: string, filename: string) {
  const fromName = path.extname(filename).toLowerCase();
  if (imageExt.has(fromName) || videoExt.has(fromName)) return fromName;
  if (type === "image/jpeg") return ".jpg";
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
  if (type === "video/quicktime") return ".mov";
  if (type === "video/webm") return ".webm";
  if (type === "video/ogg") return ".ogg";
  if (type.startsWith("image/")) return ".jpg";
  return ".mp4";
}

export async function OPTIONS() {
  return options();
}

export async function POST(request: Request) {
  const staffId = request.headers.get("x-user-id");
  const state = await readDb();
  const staff = staffId ? state.staff.find((item) => item.id === staffId) : null;
  if (!staff || !canUploadWorkMedia(staff.role)) {
    return json({ error: "Only admin and sub-admin can upload work photos and videos." }, 403);
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return json({ error: "Choose a photo or video." }, 400);
  }
  const isVideo = file.type.startsWith("video/");
  const isPhoto = file.type.startsWith("image/");
  if (!isVideo && !isPhoto) {
    return json({ error: "Upload a photo or video file." }, 400);
  }
  if (file.size > MAX_BYTES) {
    return json({ error: "File must be 80 MB or smaller." }, 400);
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const name = `${createId(isPhoto ? "img" : "vid")}${extensionFor(file.type, file.name)}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), bytes);
  return json({ uri: `/uploads/${name}`, kind: isPhoto ? "photo" : "video_clip" });
}
