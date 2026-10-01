"use client";

/** Convert any recorded audio blob to 16kHz mono 16-bit WAV (Azure's native
 *  format) entirely in the browser. */
export async function blobToWav16k(blob: Blob): Promise<{ wav: ArrayBuffer; durationSec: number }> {
  const ab = await blob.arrayBuffer();
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC();
  try {
    const decoded = await ctx.decodeAudioData(ab.slice(0));
    const targetRate = 16000;
    const ratio = decoded.sampleRate / targetRate;
    const len = Math.floor(decoded.length / ratio);
    const out = ctx.createBuffer(1, len, targetRate);
    const ch = out.getChannelData(0);
    const src = decoded.getChannelData(0);
    const src2 = decoded.numberOfChannels > 1 ? decoded.getChannelData(1) : null;
    for (let i = 0; i < len; i++) {
      const s = Math.floor(i * ratio);
      const a = src[s] ?? 0;
      ch[i] = src2 ? (a + (src2[s] ?? 0)) / 2 : a;
    }
    return { wav: encodeWav(ch, targetRate), durationSec: len / targetRate };
  } finally {
    ctx.close().catch(() => {});
  }
}

function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buffer);
  const writeStr = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  writeStr(0, "RIFF");
  v.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  writeStr(36, "data");
  v.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

export function b64encode(ab: ArrayBuffer): string {
  const bytes = new Uint8Array(ab);
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}
