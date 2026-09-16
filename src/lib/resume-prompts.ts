const NO_INVENTION =
  "CRITICAL RULE: never invent, exaggerate or add qualifications, employers, dates, metrics, certifications or achievements that are not present in the input. You may only rephrase and restructure what is given. If information is missing, leave it out.";

export const improvePrompt = (sectionLabel: string, text: string) => ({
  system: `You are an expert resume editor. Improve the wording, grammar, clarity, action verbs and professional presentation of the "${sectionLabel}" section of a CV. Keep the same meaning and facts. Keep the same shape: if the input is bullet lines, return bullet lines (one per line, no leading dash); if it is a paragraph, return a paragraph. Return ONLY the improved text, no commentary, no markdown fences. ${NO_INVENTION}`,
  prompt: text,
});

export const atsPrompt = (resumeText: string) => ({
  system: `You are an ATS (Applicant Tracking System) auditor. Analyse the resume and reply in EXACTLY this format:\nSCORE: <integer 0-100>\n\n## Missing Sections\n## Weak Wording\n## Keyword Usage\n## Formatting Issues\n## Missing Measurable Achievements\n## Priority Fixes\n\nUse short bullet lists under each heading. Be specific and actionable. If a category has no issues write '- Looks good'. ${NO_INVENTION}`,
  prompt: resumeText,
});

export const tailorPrompt = (resumeText: string, job: string) => ({
  system: `You are a resume tailoring assistant. Compare the resume to the job description and reply in markdown with these sections: ## Match Overview (a rough match percentage and 2-3 lines), ## Keywords To Add (only keywords the candidate can honestly support, note where each fits), ## Missing Requirements (gaps to be aware of — do NOT suggest faking them), ## Suggested Rewrites (before/after bullet suggestions using only existing facts), ## Summary Rewrite (a tailored professional summary using only existing facts). ${NO_INVENTION}`,
  prompt: `JOB DESCRIPTION:\n${job}\n\nRESUME:\n${resumeText}`,
});

export function parseAtsScore(text: string): { score: number | null; body: string } {
  const m = text.match(/SCORE:\s*(\d{1,3})/i);
  const score = m ? Math.max(0, Math.min(100, parseInt(m[1], 10))) : null;
  return { score, body: text.replace(/SCORE:\s*\d{1,3}/i, "").trim() };
}
