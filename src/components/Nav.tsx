"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, CalendarDays, Home, LineChart, Mic2, NotebookPen, Settings, Radio, Layers } from "lucide-react";

const LINKS = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/curriculum", label: "Curriculum", icon: BookOpenText },
  { href: "/session", label: "Session", icon: CalendarDays },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/monologue", label: "Tests", icon: Mic2 },
  { href: "/live", label: "Live", icon: Radio },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-2">
        <Link href="/" className="mr-2 shrink-0 font-semibold text-accent-dark">
          Fluency Desk
        </Link>
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium ${
                active ? "bg-accent-soft text-accent-dark" : "text-ink-soft hover:bg-desk"
              }`}
            >
              <Icon size={16} aria-hidden />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
