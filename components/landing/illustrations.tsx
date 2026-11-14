export function HeroIllustration() {
  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-line bg-canvas shadow-sm">
      {/* Canvas top bar */}
      <div className="flex h-8 items-center justify-between border-b border-line bg-surface px-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-line" />
          <span className="h-2 w-2 rounded-full bg-line" />
          <span className="h-2 w-2 rounded-full bg-line" />
          <span className="ml-2 font-mono text-[10px] text-fg-muted">interactive-canvas.svg</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-fg-muted">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--incoming)" }} />
            <span>incoming</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--outgoing)" }} />
            <span>outgoing</span>
          </span>
          <span className="text-line">|</span>
          <span>100% AST</span>
        </div>
      </div>

      {/* SVG Canvas Body */}
      <svg
        viewBox="0 0 640 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto w-full select-none"
      >
        <defs>
          {/* Subtle background grid pattern */}
          <pattern id="canvas-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.75" fill="var(--line)" />
          </pattern>
        </defs>

        {/* Grid Background */}
        <rect width="640" height="400" fill="url(#canvas-grid)" />

        {/* ================= Connection Edges (Bezier paths) ================= */}
        {/* Node 1 (routes) to Center */}
        <path
          d="M 170 110 C 230 110, 250 190, 310 190"
          stroke="var(--incoming)"
          strokeWidth="1.75"
          strokeDasharray="4 2"
          opacity="0.85"
        />

        {/* Node 2 (components) to Center */}
        <path
          d="M 470 110 C 410 110, 390 190, 330 190"
          stroke="var(--outgoing)"
          strokeWidth="1.75"
          opacity="0.9"
        />

        {/* Center to Node 3 (services) */}
        <path
          d="M 310 215 C 240 215, 230 290, 170 290"
          stroke="var(--edge)"
          strokeWidth="1.25"
        />

        {/* Center to Node 4 (store) */}
        <path
          d="M 330 215 C 400 215, 410 290, 470 290"
          stroke="var(--edge)"
          strokeWidth="1.25"
        />

        {/* Node 2 (components) to Node 5 (utils) */}
        <path
          d="M 520 135 C 550 160, 560 170, 560 200"
          stroke="var(--line)"
          strokeWidth="1.25"
        />

        {/* Node 3 (services) to Node 1 (routes) */}
        <path
          d="M 120 265 C 100 200, 100 160, 120 135"
          stroke="var(--line)"
          strokeWidth="1.25"
          strokeDasharray="2 2"
        />

        {/* ================= Nodes ================= */}

        {/* Central Root Node: core / pipeline */}
        <g transform="translate(240, 165)">
          <rect
            width="160"
            height="70"
            rx="6"
            fill="var(--surface)"
            stroke="var(--accent)"
            strokeWidth="1.5"
          />
          {/* Header pill */}
          <rect x="8" y="8" width="54" height="14" rx="3" fill="var(--raised)" />
          <text
            x="12"
            y="18"
            fill="var(--accent)"
            fontFamily="var(--font-mono)"
            fontSize="8"
            fontWeight="600"
          >
            CORE MODULE
          </text>
          {/* Node title */}
          <text
            x="8"
            y="38"
            fill="var(--fg)"
            fontFamily="var(--font-mono)"
            fontSize="12"
            fontWeight="600"
          >
            pipeline/run.ts
          </text>
          {/* Node meta */}
          <text
            x="8"
            y="54"
            fill="var(--fg-muted)"
            fontFamily="var(--font-mono)"
            fontSize="9"
          >
            fan-in: 8 · fan-out: 14
          </text>
          {/* Connection Handles */}
          <circle cx="0" cy="35" r="3.5" fill="var(--canvas)" stroke="var(--accent)" strokeWidth="1.5" />
          <circle cx="160" cy="35" r="3.5" fill="var(--canvas)" stroke="var(--accent)" strokeWidth="1.5" />
        </g>

        {/* Node 1: routes/api (Top Left) */}
        <g transform="translate(50, 75)">
          <rect
            width="135"
            height="60"
            rx="5"
            fill="var(--surface)"
            stroke="var(--line)"
            strokeWidth="1.2"
          />
          <rect x="8" y="8" width="46" height="13" rx="2.5" fill="var(--raised)" />
          <text
            x="12"
            y="17"
            fill="var(--incoming)"
            fontFamily="var(--font-mono)"
            fontSize="7.5"
            fontWeight="600"
          >
            ENDPOINT
          </text>
          <text
            x="8"
            y="35"
            fill="var(--fg)"
            fontFamily="var(--font-mono)"
            fontSize="11"
            fontWeight="500"
          >
            api/routes.ts
          </text>
          <text
            x="8"
            y="49"
            fill="var(--fg-muted)"
            fontFamily="var(--font-mono)"
            fontSize="8.5"
          >
            3 exported handlers
          </text>
          <circle cx="135" cy="35" r="3" fill="var(--canvas)" stroke="var(--line)" strokeWidth="1.2" />
        </g>

        {/* Node 2: components/view (Top Right) */}
        <g transform="translate(450, 75)">
          <rect
            width="140"
            height="60"
            rx="5"
            fill="var(--surface)"
            stroke="var(--line)"
            strokeWidth="1.2"
          />
          <rect x="8" y="8" width="56" height="13" rx="2.5" fill="var(--raised)" />
          <text
            x="12"
            y="17"
            fill="var(--kind-1)"
            fontFamily="var(--font-mono)"
            fontSize="7.5"
            fontWeight="600"
          >
            COMPONENT
          </text>
          <text
            x="8"
            y="35"
            fill="var(--fg)"
            fontFamily="var(--font-mono)"
            fontSize="11"
            fontWeight="500"
          >
            components/view.tsx
          </text>
          <text
            x="8"
            y="49"
            fill="var(--fg-muted)"
            fontFamily="var(--font-mono)"
            fontSize="8.5"
          >
            interactive canvas
          </text>
          <circle cx="0" cy="35" r="3" fill="var(--canvas)" stroke="var(--line)" strokeWidth="1.2" />
        </g>

        {/* Node 3: services/auth (Bottom Left) */}
        <g transform="translate(50, 255)">
          <rect
            width="135"
            height="60"
            rx="5"
            fill="var(--surface)"
            stroke="var(--line)"
            strokeWidth="1.2"
          />
          <rect x="8" y="8" width="58" height="13" rx="2.5" fill="var(--raised)" />
          <text
            x="12"
            y="17"
            fill="var(--outgoing)"
            fontFamily="var(--font-mono)"
            fontSize="7.5"
            fontWeight="600"
          >
            MIDDLEWARE
          </text>
          <text
            x="8"
            y="35"
            fill="var(--fg)"
            fontFamily="var(--font-mono)"
            fontSize="11"
            fontWeight="500"
          >
            lib/auth/clerk.ts
          </text>
          <text
            x="8"
            y="49"
            fill="var(--fg-muted)"
            fontFamily="var(--font-mono)"
            fontSize="8.5"
          >
            org session claims
          </text>
          <circle cx="135" cy="35" r="3" fill="var(--canvas)" stroke="var(--line)" strokeWidth="1.2" />
        </g>

        {/* Node 4: store/state (Bottom Right) */}
        <g transform="translate(450, 255)">
          <rect
            width="140"
            height="60"
            rx="5"
            fill="var(--surface)"
            stroke="var(--line)"
            strokeWidth="1.2"
          />
          <rect x="8" y="8" width="46" height="13" rx="2.5" fill="var(--raised)" />
          <text
            x="12"
            y="17"
            fill="var(--kind-2)"
            fontFamily="var(--font-mono)"
            fontSize="7.5"
            fontWeight="600"
          >
            STATE
          </text>
          <text
            x="8"
            y="35"
            fill="var(--fg)"
            fontFamily="var(--font-mono)"
            fontSize="11"
            fontWeight="500"
          >
            lib/db/supabase.ts
          </text>
          <text
            x="8"
            y="49"
            fill="var(--fg-muted)"
            fontFamily="var(--font-mono)"
            fontSize="8.5"
          >
            RLS-enforced storage
          </text>
          <circle cx="0" cy="35" r="3" fill="var(--canvas)" stroke="var(--line)" strokeWidth="1.2" />
        </g>

        {/* Node 5: utils/helpers (Middle Right) */}
        <g transform="translate(520, 175)">
          <rect
            width="100"
            height="45"
            rx="4"
            fill="var(--surface)"
            stroke="var(--line)"
            strokeWidth="1"
          />
          <text
            x="8"
            y="20"
            fill="var(--fg)"
            fontFamily="var(--font-mono)"
            fontSize="9.5"
            fontWeight="500"
          >
            lib/graph/dagre.ts
          </text>
          <text
            x="8"
            y="34"
            fill="var(--kind-4)"
            fontFamily="var(--font-mono)"
            fontSize="8"
          >
            layout arithmetic
          </text>
        </g>

        {/* Canvas Minimap Widget in Bottom Corner */}
        <g transform="translate(530, 315)">
          <rect
            width="90"
            height="65"
            rx="4"
            fill="var(--surface)"
            stroke="var(--line)"
            strokeWidth="1"
          />
          {/* Mini nodes inside minimap */}
          <rect x="10" y="10" width="16" height="8" rx="1" fill="var(--fg-muted)" opacity="0.4" />
          <rect x="64" y="10" width="16" height="8" rx="1" fill="var(--fg-muted)" opacity="0.4" />
          <rect x="35" y="26" width="20" height="12" rx="1" fill="var(--accent)" opacity="0.7" />
          <rect x="10" y="46" width="16" height="8" rx="1" fill="var(--fg-muted)" opacity="0.4" />
          <rect x="64" y="46" width="16" height="8" rx="1" fill="var(--fg-muted)" opacity="0.4" />
          {/* Viewport frame */}
          <rect x="4" y="4" width="82" height="57" rx="2" stroke="var(--accent)" strokeWidth="1" strokeDasharray="2 2" fill="none" />
        </g>
      </svg>
    </div>
  );
}

export function FeatureIllustration() {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-line bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-line pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-fg">AST Inspector</span>
          <span className="rounded bg-raised px-1.5 py-0.5 font-mono text-[10px] text-accent">
            verified-structure
          </span>
        </div>
        <span className="font-mono text-[10px] text-fg-muted">ts-morph parser</span>
      </div>

      <svg
        viewBox="0 0 460 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mt-3 h-auto w-full select-none"
      >
        {/* Selected File Card */}
        <g transform="translate(10, 10)">
          <rect
            width="190"
            height="115"
            rx="5"
            fill="var(--canvas)"
            stroke="var(--line)"
            strokeWidth="1.2"
          />
          <text x="12" y="24" fill="var(--fg)" fontFamily="var(--font-mono)" fontSize="11" fontWeight="600">
            app/actions.ts
          </text>
          <text x="12" y="40" fill="var(--fg-muted)" fontFamily="var(--font-mono)" fontSize="9">
            Role: Server Action (detected)
          </text>
          <line x1="12" y1="50" x2="178" y2="50" stroke="var(--line)" strokeWidth="1" />
          <text x="12" y="66" fill="var(--incoming)" fontFamily="var(--font-mono)" fontSize="8.5">
            ← 6 incoming imports
          </text>
          <text x="12" y="80" fill="var(--outgoing)" fontFamily="var(--font-mono)" fontSize="8.5">
            → 11 outgoing dependencies
          </text>
          <text x="12" y="96" fill="var(--fg-muted)" fontFamily="var(--font-mono)" fontSize="8.5">
            Exports: submitLandingRepo()
          </text>
        </g>

        {/* Connecting flow lines */}
        <path
          d="M 200 65 L 250 65"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeDasharray="3 2"
        />

        {/* Dependency Reach Tree */}
        <g transform="translate(250, 10)">
          <rect
            width="190"
            height="115"
            rx="5"
            fill="var(--canvas)"
            stroke="var(--line)"
            strokeWidth="1.2"
          />
          <text x="12" y="24" fill="var(--fg)" fontFamily="var(--font-mono)" fontSize="10.5" fontWeight="600">
            Direct Blast Radius
          </text>
          <text x="12" y="40" fill="var(--fg-muted)" fontFamily="var(--font-mono)" fontSize="8.5">
            Files impacted on change:
          </text>
          <g transform="translate(12, 50)">
            <rect x="0" y="0" width="166" height="15" rx="3" fill="var(--raised)" />
            <text x="6" y="11" fill="var(--fg)" fontFamily="var(--font-mono)" fontSize="8">
              components/landing/hero-form.tsx
            </text>
          </g>
          <g transform="translate(12, 70)">
            <rect x="0" y="0" width="166" height="15" rx="3" fill="var(--raised)" />
            <text x="6" y="11" fill="var(--fg)" fontFamily="var(--font-mono)" fontSize="8">
              lib/pipeline/submit.ts
            </text>
          </g>
          <g transform="translate(12, 90)">
            <rect x="0" y="0" width="166" height="15" rx="3" fill="var(--raised)" />
            <text x="6" y="11" fill="var(--fg)" fontFamily="var(--font-mono)" fontSize="8">
              lib/pipeline/run.ts
            </text>
          </g>
        </g>

        {/* Bottom AI Explanation Callout */}
        <g transform="translate(10, 140)">
          <rect
            width="430"
            height="100"
            rx="5"
            fill="var(--raised)"
            stroke="var(--line)"
            strokeWidth="1"
          />
          <text x="14" y="24" fill="var(--accent)" fontFamily="var(--font-mono)" fontSize="9.5" fontWeight="600">
            GROQ AI EXPLANATION · GROUNDED IN AST FACTS
          </text>
          <text x="14" y="44" fill="var(--fg)" fontFamily="var(--font-sans)" fontSize="10.5">
            &quot;This file handles repository submission. It validates the GitHub target, verifies organization claims,
          </text>
          <text x="14" y="60" fill="var(--fg)" fontFamily="var(--font-sans)" fontSize="10.5">
            and streams the archive directly into the deterministic parser. It is imported by the hero form
          </text>
          <text x="14" y="76" fill="var(--fg)" fontFamily="var(--font-sans)" fontSize="10.5">
            and links out to pipeline storage without circular dependencies.&quot;
          </text>
          <rect x="330" y="8" width="86" height="15" rx="3" fill="var(--surface)" />
          <text x="336" y="19" fill="var(--fg-muted)" fontFamily="var(--font-mono)" fontSize="7.5">
            model: gpt-oss-20b
          </text>
        </g>
      </svg>
    </div>
  );
}

export function WorkflowIllustration() {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-line bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-line pb-2.5">
        <span className="font-mono text-xs font-semibold text-fg">Three-Stage Analysis Architecture</span>
        <span className="font-mono text-[10px] text-fg-muted">Zero Hallucinations · Pure AST</span>
      </div>

      <svg
        viewBox="0 0 680 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mt-3 h-auto w-full select-none"
      >
        {/* Stage 1 */}
        <g transform="translate(10, 20)">
          <rect width="190" height="110" rx="6" fill="var(--canvas)" stroke="var(--line)" strokeWidth="1.2" />
          <rect x="12" y="12" width="45" height="14" rx="3" fill="var(--raised)" />
          <text x="16" y="22" fill="var(--fg-muted)" fontFamily="var(--font-mono)" fontSize="8" fontWeight="600">
            STAGE 01
          </text>
          <text x="12" y="44" fill="var(--fg)" fontFamily="var(--font-mono)" fontSize="12" fontWeight="600">
            Connect &amp; Fetch
          </text>
          <text x="12" y="62" fill="var(--fg-muted)" fontFamily="var(--font-sans)" fontSize="9.5">
            Resolves HEAD commit SHA.
          </text>
          <text x="12" y="76" fill="var(--fg-muted)" fontFamily="var(--font-sans)" fontSize="9.5">
            Streams public repo tarball
          </text>
          <text x="12" y="90" fill="var(--fg-muted)" fontFamily="var(--font-sans)" fontSize="9.5">
            into isolated sandbox.
          </text>
        </g>

        {/* Arrow 1 to 2 */}
        <path d="M 205 75 L 235 75" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 2" />
        <polygon points="238,75 233,72 233,78" fill="var(--accent)" />

        {/* Stage 2 */}
        <g transform="translate(245, 20)">
          <rect width="190" height="110" rx="6" fill="var(--canvas)" stroke="var(--line)" strokeWidth="1.2" />
          <rect x="12" y="12" width="45" height="14" rx="3" fill="var(--raised)" />
          <text x="16" y="22" fill="var(--incoming)" fontFamily="var(--font-mono)" fontSize="8" fontWeight="600">
            STAGE 02
          </text>
          <text x="12" y="44" fill="var(--fg)" fontFamily="var(--font-mono)" fontSize="12" fontWeight="600">
            ts-morph AST Walk
          </text>
          <text x="12" y="62" fill="var(--fg-muted)" fontFamily="var(--font-sans)" fontSize="9.5">
            Parses imports &amp; exports.
          </text>
          <text x="12" y="76" fill="var(--fg-muted)" fontFamily="var(--font-sans)" fontSize="9.5">
            Discovers route conventions.
          </text>
          <text x="12" y="90" fill="var(--fg-muted)" fontFamily="var(--font-sans)" fontSize="9.5">
            Calculates Dagre graph geometry.
          </text>
        </g>

        {/* Arrow 2 to 3 */}
        <path d="M 440 75 L 470 75" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 2" />
        <polygon points="473,75 468,72 468,78" fill="var(--accent)" />

        {/* Stage 3 */}
        <g transform="translate(480, 20)">
          <rect width="190" height="110" rx="6" fill="var(--canvas)" stroke="var(--accent)" strokeWidth="1.2" />
          <rect x="12" y="12" width="45" height="14" rx="3" fill="var(--raised)" />
          <text x="16" y="22" fill="var(--accent)" fontFamily="var(--font-mono)" fontSize="8" fontWeight="600">
            STAGE 03
          </text>
          <text x="12" y="44" fill="var(--fg)" fontFamily="var(--font-mono)" fontSize="12" fontWeight="600">
            Interactive Canvas
          </text>
          <text x="12" y="62" fill="var(--fg-muted)" fontFamily="var(--font-sans)" fontSize="9.5">
            Explores dependency canvas.
          </text>
          <text x="12" y="76" fill="var(--fg-muted)" fontFamily="var(--font-sans)" fontSize="9.5">
            Folds and focuses directories.
          </text>
          <text x="12" y="90" fill="var(--fg-muted)" fontFamily="var(--font-sans)" fontSize="9.5">
            Contextual Groq explanations.
          </text>
        </g>
      </svg>
    </div>
  );
}
