import { NextResponse } from "next/server";
import { groqTranscribe, groqConfigured } from "@/lib/groq";

/** Optional transcription via Groq Whisper. When not configured, the client
 *  falls back to the browser Web Speech API or a manual transcript. */
export async function POST(req: Request) {
  if (!groqConfigured()) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured. Use the browser's live transcript or type it manually." },
      { status: 503 }
    );
  }
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof Blob)) return NextResponse.json({ error: "No audio." }, { status: 400 });
    const result = await groqTranscribe(file);
    if (!result) return NextResponse.json({ error: "Transcription failed." }, { status: 502 });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: `Transcription error: ${(e as Error).message}` }, { status: 500 });
  }
}
