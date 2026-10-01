import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-line bg-card p-5 shadow-[0_1px_2px_rgba(28,25,23,0.05)] ${className}`}>
      {children}
    </section>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="text-xl font-semibold tracking-tight text-ink">{children}</h2>;
}

export function Meta({ children }: { children: ReactNode }) {
  return <p className="text-sm text-ink-faint">{children}</p>;
}

export function Btn({
  children,
  variant = "primary",
  className = "",
  ...rest
}: {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger" | "soft";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles =
    variant === "primary"
      ? "bg-accent text-white hover:bg-accent-dark"
      : variant === "danger"
        ? "bg-bad text-white hover:opacity-90"
        : variant === "soft"
          ? "bg-accent-soft text-accent-dark hover:bg-accent-soft/70"
          : "border border-line bg-card text-ink hover:border-accent";
  return (
    <button
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-base font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" | "warn" | "good" | "bad" }) {
  const tones: Record<string, string> = {
    neutral: "bg-desk text-ink-soft border border-line",
    accent: "bg-accent-soft text-accent-dark border border-accent/20",
    warn: "bg-warn-soft text-warn border border-warn/20",
    good: "bg-good-soft text-good border border-good/20",
    bad: "bg-bad-soft text-bad border border-bad/20",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-card p-8 text-center">
      <p className="text-base font-medium text-ink-soft">{title}</p>
      {hint && <p className="mt-1 text-sm text-ink-faint">{hint}</p>}
    </div>
  );
}
