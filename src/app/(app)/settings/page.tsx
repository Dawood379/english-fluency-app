import { KeyRound, CheckCircle2, XCircle, Info } from "lucide-react";
import { providerStatus, MODELS, BUDGETS } from "@/lib/config";
import { usingMongo } from "@/lib/db";
import { Card, H2, Meta, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const status = providerStatus();

  const rows = [
    { name: "Gemini API (generation + feedback)", on: status.gemini, note: `Models: ${MODELS.lite} → ${MODELS.liteAlt} → guarded ${MODELS.flash}. Without a key, lessons use the offline template and feedback steps are skipped.` },
    { name: "Groq (Whisper transcription)", on: status.groq, note: "Optional. Without it, the browser's free live transcript or manual typing is used." },
    { name: "Azure Speech (pronunciation scores)", on: status.azure, note: "Optional. Free F0 tier = 5 audio hours/month. Without it, drills run in practice mode." },
    { name: "MongoDB", on: status.mongo, note: usingMongo ? "Connected — data persists in MongoDB." : "Not set — running on the local file store (demo mode)." },
    { name: "Password gate", on: status.passwordGate, note: "Set APP_PASSWORD to protect the app; unset means it runs open in local demo mode." },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-base text-ink-soft">
          API keys live in server-side environment variables only — never in the browser, never in this page.
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-2"><KeyRound size={18} className="text-accent-dark" aria-hidden /><H2>Providers</H2></div>
        <ul className="mt-4 space-y-4">
          {rows.map((r) => (
            <li key={r.name} className="flex items-start gap-3">
              {r.on ? <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-good" aria-label="active" /> : <XCircle size={20} className="mt-0.5 shrink-0 text-ink-faint" aria-label="inactive" />}
              <div>
                <p className="text-base font-medium">{r.name} <Badge tone={r.on ? "good" : "neutral"}>{r.on ? "active" : "not configured"}</Badge></p>
                <p className="mt-1 text-sm text-ink-soft">{r.note}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <H2>Environment variables (.env)</H2>
        <Meta>Copy .env.example to .env and fill in what you have. Everything is optional except a MongoDB URI for production use.</Meta>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-ink p-4 font-mono text-sm text-paper">
{`GEMINI_API_KEY=            # required for lesson generation + AI feedback
GEMINI_MODEL_LITE=       # default: ${MODELS.lite}
GEMINI_MODEL_LITE_ALT=   # default: ${MODELS.liteAlt}
GEMINI_MODEL_FLASH=       # default: ${MODELS.flash}
GROQ_API_KEY=            # optional, Whisper transcription
AZURE_SPEECH_KEY=        # optional, pronunciation scoring
AZURE_SPEECH_REGION=     # e.g. eastus
MONGODB_URI=             # optional; file store used without it
APP_PASSWORD=            # optional; app runs open without it`}
        </pre>
      </Card>

      <Card>
        <div className="flex items-center gap-2"><Info size={18} className="text-accent-dark" aria-hidden /><H2>Free-tier privacy note</H2></div>
        <p className="mt-2 text-base text-ink-soft">
          Google's free API tier may use your prompts and recordings to improve its products, and content may be
          human-reviewed. Treat the free key as a <strong>practice account</strong>: never send real client names,
          passwords, financial details, or anything you would not post publicly. Use placeholders ("Client A",
          "my online store") in recordings and transcripts.
        </p>
        <p className="mt-2 text-sm text-ink-faint">
          Planned daily budgets: Gemini Lite ≤ {BUDGETS.geminiLitePerDay}/day · full Flash ≤ {BUDGETS.geminiFlashPerDay}/day ·
          Azure ≤ {BUDGETS.azureAudioSecondsPerMonth / 3600} audio-hours/month.
        </p>
      </Card>
    </div>
  );
}
