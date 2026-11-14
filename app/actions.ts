"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { parseRepositoryUrl, PipelineError } from "@/lib/pipeline/github";
import { claimAnalysis, continueRun } from "@/lib/pipeline/run";
import { submitRepository } from "@/lib/pipeline/submit";
import { createAdminSupabase } from "@/lib/supabase/admin";

export type LandingFormState = {
  error: string | null;
  pendingUrl?: string;
};

export async function submitLandingRepo(
  _prev: LandingFormState,
  formData: FormData,
): Promise<LandingFormState> {
  const url = formData.get("url");
  if (typeof url !== "string" || !url.trim()) {
    return { error: "Please enter a GitHub repository URL" };
  }

  // 1. Validate repository URL syntax first
  try {
    parseRepositoryUrl(url);
  } catch (err) {
    if (err instanceof PipelineError) {
      return { error: err.message };
    }
    return { error: "Invalid repository URL (expected github.com/owner/name)" };
  }

  // 2. Check user authentication
  const { userId, orgId } = await auth();

  // If visitor is unauthenticated, redirect to sign-up preserving target repo URL
  if (!userId || !orgId) {
    const nextUrl = `/dashboard?repo=${encodeURIComponent(url.trim())}`;
    redirect(`/sign-up?redirect_url=${encodeURIComponent(nextUrl)}`);
  }

  // If user is authenticated with an active organization, submit directly into pipeline
  const admin = createAdminSupabase();
  let analysisId: string;
  try {
    const submission = await submitRepository(admin, orgId, url.trim());
    analysisId = submission.analysisId;
    if (submission.created) {
      // Claim and run the analysis pipeline
      const claimed = await claimAnalysis(admin, analysisId);
      continueRun(admin, claimed).catch((err) =>
        console.error("Pipeline run error:", err),
      );
    }
  } catch (error) {
    if (error instanceof PipelineError) {
      return { error: error.message };
    }
    return { error: error instanceof Error ? error.message : "Failed to analyze repository" };
  }

  redirect(`/analyses/${analysisId}`);
}
