"use client";

import { useActionState, useState } from "react";
import { submitLandingRepo, type LandingFormState } from "@/app/actions";

const INITIAL_STATE: LandingFormState = { error: null };

const POPULAR_EXAMPLES = [
  "expressjs/express",
  "facebook/react",
  "pmndrs/zustand",
  "vercel/next.js",
];

export function HeroForm() {
  const [state, formAction, isPending] = useActionState(submitLandingRepo, INITIAL_STATE);
  const [inputValue, setInputValue] = useState("");

  function handleExampleClick(repo: string) {
    setInputValue(`https://github.com/${repo}`);
  }

  return (
    <div className="w-full max-w-xl">
      <form action={formAction} className="relative flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            name="url"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="https://github.com/username/repository"
            required
            autoComplete="off"
            spellCheck={false}
            aria-label="Public GitHub repository URL"
            aria-invalid={state.error ? true : undefined}
            className="h-8 w-full rounded border border-line bg-surface px-3 font-mono text-xs text-fg outline-none transition-colors placeholder:text-fg-muted focus:border-accent"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded bg-accent px-3 font-mono text-xs font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? (
            <>
              <svg
                className="h-3.5 w-3.5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>analyzing…</span>
            </>
          ) : (
            <>
              <span>explore repository</span>
              <span className="text-accent-fg/80">→</span>
            </>
          )}
        </button>
      </form>

      {/* Error state */}
      {state.error && (
        <div
          role="alert"
          className="mt-2.5 flex items-start gap-2 rounded border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-500 dark:text-red-400"
        >
          <span className="font-mono text-[11px] font-semibold uppercase">error</span>
          <span className="font-mono text-[11px] leading-tight">{state.error}</span>
        </div>
      )}

      {/* Quick example clickers */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-fg-muted">
        <span className="text-fg-muted/70">examples:</span>
        {POPULAR_EXAMPLES.map((repo) => (
          <button
            key={repo}
            type="button"
            onClick={() => handleExampleClick(repo)}
            className="underline decoration-line underline-offset-2 transition-colors hover:text-fg hover:decoration-fg"
          >
            {repo}
          </button>
        ))}
      </div>
    </div>
  );
}
