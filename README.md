# CodeMapper

An AI-powered interactive codebase dependency mapper. CodeMapper turns public GitHub repositories into interactive architectural maps by parsing source code with AST analysis and providing AI-powered context and role explanations using Groq.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Actions)
- **UI & Styling:** React 19, Tailwind CSS v4
- **Interactive Graph:** `@xyflow/react` (React Flow), `@dagrejs/dagre`
- **Code Parser:** `ts-morph` (TypeScript AST parsing)
- **AI Engine:** Groq SDK (`openai/gpt-oss-20b`)
- **Authentication:** Clerk (Multi-tenant Organizations)
- **Database:** Supabase (PostgreSQL with Row-Level Security)
- **Observability:** LangSmith (LLM tracing and run monitoring)

---

## Prerequisites

- **Node.js:** v20.x or later
- **Package Manager:** `pnpm` (v10+ recommended)
- **Accounts & API Keys:**
  - [Groq Console](https://console.groq.com) (API Key for inference)
  - [Clerk](https://clerk.com) (Authentication & Organizations)
  - [Supabase](https://supabase.com) (Postgres Database)
  - [LangSmith](https://smith.langchain.com) (Optional, for LLM tracing)

---

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Create `.env.local` by copying `.env.example`:

```bash
cp .env.example .env.local
```

Fill in the required configuration in `.env.local`:

```env
# CLERK
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...

# GROQ
GROQ_API_KEY=gsk_...

# LANGSMITH (Optional)
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=lsv2_pt_...
LANGSMITH_PROJECT=codemapper
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
```

### 3. Configure Clerk Session Token

CodeMapper requires organization-based multi-tenancy. In your Clerk Dashboard:

1. Navigate to **Configure** → **Sessions** → **Customize session token**.
2. Add the custom claim for `org_name`:
   ```json
   {
     "org_name": "{{org.name}}"
   }
   ```
3. Save the changes.

### 4. Set Up Supabase Database

Apply the SQL migration files located in `supabase/migrations/` to your Supabase project in sequential order using the Supabase SQL Editor or Supabase CLI:

- `20260928085353_schema.sql`
- `20260928085423_revoke_rls_trigger_execute.sql`
- `20260928173315_pipeline.sql`
- `20260928174534_progress_channel.sql`
- `20260928175808_rename_detected_projects.sql`
- `20260928182115_roles_and_routes.sql`
- `20260929065834_file_exports.sql`
- `20260929135235_ai_cache.sql`

### 5. Run the Application

Start the local development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Starts the Next.js development server on port 3000 |
| `pnpm build` | Builds the application for production |
| `pnpm start` | Runs the production build |
| `pnpm lint` | Runs ESLint to check for code issues |
| `pnpm analyze` | CLI script to analyze a repository (`pnpm analyze <github-url> --org <clerk-org-id>`) |
| `pnpm parse` | Parses a local directory and outputs detected AST files and edges |
| `pnpm insights` | Scans dependency graphs for cycles and hub patterns |
| `pnpm map-counts` | Displays file and relationship counts for graph visualizations |

---

## How It Works

1. **Ingestion**: Resolves HEAD commit and streams the public repository archive directly from GitHub into an isolated temporary workspace.
2. **AST Parsing**: Discovers TypeScript and JavaScript files, extracting module imports, exports, frameworks, and route patterns using `ts-morph`.
3. **Graph Calculation**: Computes graph layout (nodes, edges, folding, cycles) deterministically using Dagre layout arithmetic.
4. **AI Explanation & Categorization**: Uses Groq (`openai/gpt-oss-20b`) to explain complex dependency chains and classify file architectural roles without predicting connections. All answers are cached in Supabase.
