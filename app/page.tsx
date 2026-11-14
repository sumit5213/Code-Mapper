import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { parseTheme, THEME_COOKIE } from "@/lib/theme";

export const metadata: Metadata = {
  title: "CodeMapper | Visual Codebase Dependency Maps",
  description:
    "Turn public GitHub repositories into interactive architectural maps with AST analysis and context-aware Groq AI explanations.",
};

export default async function HomePage() {
  const { userId, orgId } = await auth();

  // Redirect authenticated visitors directly to dashboard/workspace
  if (userId) {
    if (!orgId) {
      redirect("/start");
    }
    redirect("/dashboard");
  }

  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return <LandingPage isAuthenticated={false} initialTheme={theme} />;
}
