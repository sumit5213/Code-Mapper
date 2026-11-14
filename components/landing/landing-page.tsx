import Link from "next/link";
import { LandingNav } from "./landing-nav";
import { HeroForm } from "./hero-form";
import {
  HeroIllustration,
  FeatureIllustration,
  WorkflowIllustration,
} from "./illustrations";
import type { Theme } from "@/lib/theme";

export function LandingPage({
  isAuthenticated,
  initialTheme,
}: {
  isAuthenticated: boolean;
  initialTheme: Theme;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-fg">
      {/* 1. Fixed Navigation Header */}
      <LandingNav isAuthenticated={isAuthenticated} initialTheme={initialTheme} />

      {/* Main Content with pt-9 offset for the fixed h-9 header */}
      <main className="flex-1 pt-9">
        {/* 2. Hero Section */}
        <section className="relative mx-auto flex min-h-[calc(100vh-2.25rem)] max-w-[1140px] flex-col justify-center px-6 py-16 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div className="flex flex-col">
              {/* Product badge */}
              <div className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] text-fg-muted">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                <span>deterministic codebase dependency mapper</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl font-semibold tracking-tight text-fg sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                Understand your codebase. See how everything connects.
              </h1>

              {/* Supporting Description */}
              <p className="mt-6 max-w-xl text-base leading-relaxed text-fg-muted sm:text-[1.0625rem]">
                CodeMapper turns your code repository into a clear, structured visual map,
                helping you understand how files, modules, and components relate to one another.
              </p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-fg-muted/80">
                Explore your project&apos;s architecture without getting lost in thousands of lines of code.
              </p>

              {/* Repository URL Input */}
              <div className="mt-8">
                <HeroForm />
              </div>
            </div>

            {/* Hero Inline SVG Illustration */}
            <div className="w-full">
              <HeroIllustration />
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="mx-auto max-w-[1140px] px-6">
          <hr className="border-t border-line" />
        </div>

        {/* 3. What CodeMapper Does (Editorial Split Layout) */}
        <section id="product" className="scroll-mt-12 mx-auto max-w-[1140px] px-6 py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left editorial text */}
            <div>
              <div className="mb-2 font-mono text-xs font-medium text-accent">
                visual architecture
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                Your codebase, made understandable.
              </h2>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-fg-muted">
                <p className="max-w-[46ch]">
                  Modern software teams frequently navigate massive codebases and AI-generated code.
                  Reading file after file sequentially makes it impossible to hold the entire architectural
                  web in your head.
                </p>
                <p className="max-w-[46ch]">
                  CodeMapper solves this by parsing raw source code into navigable nodes and edges.
                  Instead of guessing how files interact, you immediately see the true import graphs,
                  component trees, and API endpoints.
                </p>
                <p className="max-w-[46ch]">
                  Evaluate blast radii before making edits, trace circular dependency risks, and ask
                  context-aware AI models for explanations grounded entirely in true AST facts.
                </p>
              </div>

              {/* Feature pills */}
              <div className="mt-8 flex flex-wrap gap-2 font-mono text-[11px]">
                <span className="rounded border border-line bg-surface px-2.5 py-1 text-fg">
                  ast parsing
                </span>
                <span className="rounded border border-line bg-surface px-2.5 py-1 text-fg">
                  blast radius tracing
                </span>
                <span className="rounded border border-line bg-surface px-2.5 py-1 text-fg">
                  directory folding
                </span>
                <span className="rounded border border-line bg-surface px-2.5 py-1 text-fg">
                  groq ai grounding
                </span>
              </div>
            </div>

            {/* Right bespoke inline SVG illustration */}
            <div>
              <FeatureIllustration />
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="mx-auto max-w-[1140px] px-6">
          <hr className="border-t border-line" />
        </div>

        {/* 4. How It Works (Three Clear Steps) */}
        <section id="how-it-works" className="scroll-mt-12 mx-auto max-w-[1140px] px-6 py-20 lg:py-28">
          <div className="max-w-2xl">
            <div className="mb-2 font-mono text-xs font-medium text-accent">
              pipeline architecture
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
              From repository to understanding.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-fg-muted">
              CodeMapper executes a three-stage deterministic pipeline. Nothing is mocked or hallucinated:
              every node and edge originates directly from real source analysis.
            </p>
          </div>

          {/* Three steps split with subtle dividers */}
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <div className="relative flex flex-col border-l border-line pl-6">
              <span className="font-mono text-xs font-semibold text-accent">step 01</span>
              <h3 className="mt-2 font-mono text-base font-semibold text-fg">connect</h3>
              <p className="mt-3 text-xs leading-relaxed text-fg-muted">
                Provide any public GitHub repository URL. CodeMapper queries GitHub for the HEAD commit
                SHA and securely streams the repository archive into an isolated temporary workspace.
              </p>
            </div>

            <div className="relative flex flex-col border-l border-line pl-6">
              <span className="font-mono text-xs font-semibold text-accent">step 02</span>
              <h3 className="mt-2 font-mono text-base font-semibold text-fg">analyze</h3>
              <p className="mt-3 text-xs leading-relaxed text-fg-muted">
                A deterministic TypeScript AST engine (<code className="rounded bg-raised px-1 py-0.5 font-mono text-[11px]">ts-morph</code>)
                walks every candidate source file, resolves import specifiers and path aliases, recognizes
                framework conventions, and computes Dagre layout arithmetic.
              </p>
            </div>

            <div className="relative flex flex-col border-l border-line pl-6">
              <span className="font-mono text-xs font-semibold text-accent">step 03</span>
              <h3 className="mt-2 font-mono text-base font-semibold text-fg">explore</h3>
              <p className="mt-3 text-xs leading-relaxed text-fg-muted">
                Navigate the interactive canvas built with React Flow. Inspect file relationships,
                filter categories, and view verified file roles and context summaries explained
                by Groq AI.
              </p>
            </div>
          </div>

          {/* Custom Pipeline SVG Illustration */}
          <div className="mt-14">
            <WorkflowIllustration />
          </div>
        </section>

        {/* Section Divider */}
        <div className="mx-auto max-w-[1140px] px-6">
          <hr className="border-t border-line" />
        </div>

        {/* 5. Supported Frameworks and Technologies */}
        <section id="frameworks" className="scroll-mt-12 mx-auto max-w-[1140px] px-6 py-20 lg:py-28">
          <div className="max-w-2xl">
            <div className="mb-2 font-mono text-xs font-medium text-accent">
              ecosystem &amp; frameworks
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
              Built to understand your stack.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-fg-muted">
              CodeMapper features specialized AST adapters built specifically to understand idiomatic
              patterns across modern JavaScript and TypeScript frameworks.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Category 1: Languages */}
            <div className="rounded border border-line bg-surface p-5">
              <div className="font-mono text-[11px] font-semibold text-fg-muted">
                programming languages
              </div>
              <h3 className="mt-2 font-mono text-sm font-semibold text-fg">TypeScript &amp; JavaScript</h3>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted">
                Full AST support for modern ECMAScript, JSX, TSX, CommonJS, and ES modules.
              </p>
              <ul className="mt-4 space-y-1.5 font-mono text-[11px] text-fg-muted">
                <li className="flex items-center gap-1.5">
                  <span className="text-accent">•</span> .ts, .tsx, .mts, .cts
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-accent">•</span> .js, .jsx, .mjs, .cjs
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-accent">•</span> tsconfig path aliases (@/*)
                </li>
              </ul>
            </div>

            {/* Category 2: Frontend Frameworks */}
            <div className="rounded border border-line bg-surface p-5">
              <div className="font-mono text-[11px] font-semibold text-fg-muted">
                frontend frameworks
              </div>
              <h3 className="mt-2 font-mono text-sm font-semibold text-fg">Next.js &amp; React</h3>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted">
                Detects App Router layouts, pages, route handlers, server actions, and component trees.
              </p>
              <ul className="mt-4 space-y-1.5 font-mono text-[11px] text-fg-muted">
                <li className="flex items-center gap-1.5">
                  <span className="text-accent">•</span> Next.js 13+ App Router
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-accent">•</span> Pages Router &amp; API routes
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-accent">•</span> React hooks &amp; UI components
                </li>
              </ul>
            </div>

            {/* Category 3: Backend Technologies */}
            <div className="rounded border border-line bg-surface p-5">
              <div className="font-mono text-[11px] font-semibold text-fg-muted">
                backend technologies
              </div>
              <h3 className="mt-2 font-mono text-sm font-semibold text-fg">Express &amp; NestJS</h3>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted">
                Traces Express route handlers and NestJS dependency injection modules and controllers.
              </p>
              <ul className="mt-4 space-y-1.5 font-mono text-[11px] text-fg-muted">
                <li className="flex items-center gap-1.5">
                  <span className="text-accent">•</span> Express router middleware
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-accent">•</span> NestJS modules &amp; controllers
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-accent">•</span> REST endpoint declarations
                </li>
              </ul>
            </div>

            {/* Category 4: Tooling & Documentation */}
            <div className="rounded border border-line bg-surface p-5">
              <div className="font-mono text-[11px] font-semibold text-fg-muted">
                ecosystem &amp; docs
              </div>
              <h3 className="mt-2 font-mono text-sm font-semibold text-fg">Docusaurus &amp; Config</h3>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted">
                Classifies documentation hierarchies, testing suites, build scripts, and utilities.
              </p>
              <ul className="mt-4 space-y-1.5 font-mono text-[11px] text-fg-muted">
                <li className="flex items-center gap-1.5">
                  <span className="text-accent">•</span> Docusaurus documentation
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-accent">•</span> Vitest, Jest &amp; test suites
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-accent">•</span> Utilities &amp; shared libraries
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="mx-auto max-w-[1140px] px-6">
          <hr className="border-t border-line" />
        </div>

        {/* 6. What CodeMapper Deliberately Doesn't Do */}
        <section id="philosophy" className="scroll-mt-12 mx-auto max-w-[1140px] px-6 py-20 lg:py-28">
          <div className="max-w-2xl">
            <div className="mb-2 font-mono text-xs font-medium text-accent">
              product philosophy
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
              What CodeMapper isn&apos;t trying to be.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-fg-muted">
              We believe great developer tools define clear, confident boundaries. CodeMapper is
              engineered to illuminate repository architecture, not replace your engineering judgment.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded border border-line bg-surface p-5">
              <span className="font-mono text-xs text-fg-muted">01</span>
              <h3 className="mt-2 font-mono text-sm font-semibold text-fg">
                not a substitute for reading code
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted">
                CodeMapper provides orientation and visual structure so you understand where components
                belong. It does not replace the necessity of reviewing and verifying critical business logic.
              </p>
            </div>

            <div className="rounded border border-line bg-surface p-5">
              <span className="font-mono text-xs text-fg-muted">02</span>
              <h3 className="mt-2 font-mono text-sm font-semibold text-fg">
                not an automatic refactoring engine
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted">
                We do not mutate your files, rewrite functions, or apply automated transformations.
                CodeMapper is strictly a read-only exploration and analysis tool.
              </p>
            </div>

            <div className="rounded border border-line bg-surface p-5">
              <span className="font-mono text-xs text-fg-muted">03</span>
              <h3 className="mt-2 font-mono text-sm font-semibold text-fg">
                no predicted or hallucinated nodes
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted">
                Every node and edge on the canvas is derived from deterministic AST parsing. AI never
                invents files or connections; Groq is only permitted to explain verified structures.
              </p>
            </div>

            <div className="rounded border border-line bg-surface p-5">
              <span className="font-mono text-xs text-fg-muted">04</span>
              <h3 className="mt-2 font-mono text-sm font-semibold text-fg">
                not a replacement for IDE diagnostics
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted">
                Your IDE excels at type checking, jump-to-definition, and syntax debugging. CodeMapper
                operates at the repository-level topology that IDEs cannot easily visualize.
              </p>
            </div>

            <div className="rounded border border-line bg-surface p-5">
              <span className="font-mono text-xs text-fg-muted">05</span>
              <h3 className="mt-2 font-mono text-sm font-semibold text-fg">
                static topology, not runtime profiling
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted">
                CodeMapper parses committed TypeScript and JavaScript source files. It does not inspect
                live process memory, dynamic network calls, or reflection.
              </p>
            </div>

            <div className="rounded border border-line bg-surface p-5">
              <span className="font-mono text-xs text-fg-muted">06</span>
              <h3 className="mt-2 font-mono text-sm font-semibold text-fg">
                explicit multi-tenant security
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted">
                Every analysis is isolated under Clerk organization authorization with strict Supabase
                Row-Level Security (RLS). No repository data crosses organizational boundaries.
              </p>
            </div>
          </div>
        </section>

        {/* Call to action footer banner */}
        <section className="border-t border-line bg-surface/50 py-14">
          <div className="mx-auto flex max-w-[1140px] flex-col items-center justify-between gap-6 px-6 sm:flex-row">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-fg">
                Ready to map your codebase?
              </h2>
              <p className="mt-1 text-xs text-fg-muted">
                Enter any public GitHub repository to generate an interactive map in seconds.
              </p>
            </div>
            <a
              href="#"
              className="inline-flex h-8 items-center justify-center rounded bg-accent px-4 font-mono text-xs font-medium text-accent-fg transition-opacity hover:opacity-90"
            >
              analyze a repository →
            </a>
          </div>
        </section>
      </main>

      {/* 7. Minimal Footer matching app shell */}
      <footer className="border-t border-line bg-surface py-6">
        <div className="mx-auto flex max-w-[1140px] flex-col items-center justify-between gap-4 px-6 font-mono text-xs text-fg-muted sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-fg">codemapper</span>
            <span className="text-line">/</span>
            <span className="text-[11px]">visual dependency maps</span>
          </div>

          <nav className="flex items-center gap-5 text-[11px]">
            <a href="#product" className="transition-colors hover:text-fg">
              product
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-fg">
              how-it-works
            </a>
            <a href="#frameworks" className="transition-colors hover:text-fg">
              frameworks
            </a>
            <a href="#philosophy" className="transition-colors hover:text-fg">
              philosophy
            </a>
            {isAuthenticated ? (
              <Link href="/dashboard" className="text-fg transition-colors hover:text-accent">
                dashboard
              </Link>
            ) : (
              <Link href="/sign-in" className="text-fg transition-colors hover:text-accent">
                sign-in
              </Link>
            )}
          </nav>

          <div className="text-[11px] text-fg-muted/60">
            &copy; {new Date().getFullYear()} codemapper
          </div>
        </div>
      </footer>
    </div>
  );
}
