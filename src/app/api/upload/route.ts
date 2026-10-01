import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { newId } from "@/lib/db";

/**
 * Stores a recording as a file. Audio NEVER goes into MongoDB (512MB free
 * Atlas limit) — only files on disk, referenced by path.
 */

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "No audio file received." }, { status: 400 });
    }
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "Recording is too large (15MB max)." }, { status: 400 });
    }
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const name = `${newId()}.webm`;
    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
    return NextResponse.json({ path: `/api/uploads/${name}`, name });
  } catch (e) {
    return NextResponse.json({ error: `Upload failed: ${(e as Error).message}` }, { status: 500 });
  }
}
