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

  useEffect(() => {
    function handleScroll() {
      const scrollPosition = window.scrollY + 80;

      // If near page top, no sub-section is active (overview)
      if (window.scrollY < 180) {
        setActiveSection("");
        return;
      }

      // Check if user scrolled near the bottom of the page
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
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 font-mono text-xs font-semibold tracking-tight text-fg transition-colors hover:text-accent"
        >
          <Logo />
          <span>codemapper</span>
        </Link>
        <span className="text-line shrink-0">/</span>
        <span className="truncate font-mono text-[11px] text-fg-muted lowercase">
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
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
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
          <>
            <div className="hidden items-center gap-1.5 sm:flex">
              <Link
                href="/sign-up"
                className="inline-flex h-6 items-center rounded bg-accent px-2 font-mono text-[11px] font-medium text-accent-fg transition-opacity hover:opacity-90"
              >
                get started
              </Link>
            </div>

            {/* Mobile sign up button */}
            <Link
              href="/sign-up"
              className="flex sm:hidden h-6 shrink-0 whitespace-nowrap items-center justify-center rounded bg-accent px-2 font-mono text-[9px] font-medium text-accent-fg transition-opacity hover:opacity-90"
            >
              SignUp
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
