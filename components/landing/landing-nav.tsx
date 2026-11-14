"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeControl } from "@/components/theme-control";
import type { Theme } from "@/lib/theme";
import { Logo } from "@/components/Logo";

const NAV_ITEMS = [
  { id: "product", label: "product" },
  { id: "how-it-works", label: "how-it-works" },
  { id: "frameworks", label: "frameworks" },
  { id: "philosophy", label: "philosophy" },
];

export function LandingNav({
  isAuthenticated,
  initialTheme,
}: {
  isAuthenticated: boolean;
  initialTheme: Theme;
}) {
  const [activeSection, setActiveSection] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const scrollPosition = window.scrollY + 80;

      if (window.scrollY < 180) {
        setActiveSection("");
        return;
      }

      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100
      ) {
        setActiveSection(NAV_ITEMS[NAV_ITEMS.length - 1].id);
        return;
      }

      let current = "";
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            current = item.id;
            break;
          }
        }
      }
      setActiveSection(current);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-9 shrink-0 items-center justify-between border-b border-line bg-surface/95 px-3 backdrop-blur-sm">
      {/* Brand & Section Indicator */}
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="flex items-center gap-1.5 font-mono text-xs font-semibold tracking-tight text-fg transition-colors hover:text-accent"
        >
          <Logo/>
          <span>codemapper</span>
        </Link>
        <span className="text-line">/</span>
        <span className="font-mono text-[11px] text-fg-muted lowercase">
          {activeSection || "overview"}
        </span>
      </div>

      {/* Desktop Navigation Links with Scrollspy Highlighting */}
      <nav className="hidden items-center gap-1 font-mono text-xs md:flex">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`rounded px-2 py-0.5 transition-colors ${
                isActive
                  ? "bg-raised font-medium text-fg"
                  : "text-fg-muted hover:bg-raised/50 hover:text-fg"
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Right Controls & Auth */}
      <div className="flex items-center gap-2">
        {/* Project's original ThemeControl */}
        <ThemeControl initial={initialTheme} />

        {/* Auth CTA */}
        {isAuthenticated ? (
          <Link
            href="/dashboard"
            className="inline-flex h-6 items-center rounded border border-line bg-raised px-2 font-mono text-[11px] font-medium text-fg transition-colors hover:border-fg-muted"
          >
            dashboard →
          </Link>
        ) : (
          <div className="hidden items-center gap-1.5 sm:flex">
            <Link
              href="/sign-up"
              className="inline-flex h-6 items-center rounded bg-accent px-2 font-mono text-[11px] font-medium text-accent-fg transition-opacity hover:opacity-90"
            >
              get started
            </Link>
          </div>
        )}

        {/* Mobile men  u toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          className="flex h-6 w-6 items-center justify-center rounded border border-line text-fg-muted transition-colors hover:text-fg md:hidden"
        >
          {mobileOpen ? (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="2" y1="2" x2="10" y2="10" />
              <line x1="10" y1="2" x2="2" y2="10" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="1" y1="3" x2="11" y2="3" />
              <line x1="1" y1="6" x2="11" y2="6" />
              <line x1="1" y1="9" x2="11" y2="9" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="absolute top-9 left-0 right-0 border-b border-line bg-surface px-4 py-3 font-mono text-xs shadow-md md:hidden">
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMobileOpen(false)}
                className={`rounded px-2 py-1 transition-colors ${
                  activeSection === item.id
                    ? "bg-raised font-medium text-fg"
                    : "text-fg-muted hover:text-fg"
                }`}
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-1.5 border-t border-line pt-2">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-7 items-center justify-center rounded border border-line bg-raised text-[11px] font-medium text-fg"
                >
                  dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-7 items-center justify-center rounded bg-accent text-[11px] font-medium text-accent-fg"
                  >
                    get started →
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
