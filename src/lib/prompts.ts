export const RESPONSIBLE_AI_NOTICE =
  "WorkWise AI generates content using artificial intelligence. AI responses may contain inaccuracies or incomplete information. Users should carefully review, edit, and verify all generated content before using it professionally. Do not enter confidential, personal, or sensitive information into the system.";

export const emailPrompt = (i: {
  recipientName: string;
  recipientPosition: string;
  purpose: string;
  tone: string;
  instructions: string;
}) => ({
  system:
    "You are an expert professional email writer. Return ONLY the email in this exact format:\nSubject: <one line subject>\n\n<email body>\n\nNo commentary. No markdown fences.",
  prompt: `Write a ${i.tone.toLowerCase()} email.\nRecipient: ${i.recipientName}${i.recipientPosition ? ` (${i.recipientPosition})` : ""}\nPurpose: ${i.purpose}\n${i.instructions ? `Additional instructions: ${i.instructions}` : ""}`,
});

export const summaryPrompt = (notes: string) => ({
  system:
    "You summarize meeting notes into a structured markdown report with these sections in order: ## Executive Summary, ## Key Decisions, ## Action Items, ## Assigned Responsibilities, ## Deadlines, ## Risks, ## Next Meeting. Use bullet lists. If a section has no info, write '- None mentioned'.",
  prompt: `Meeting notes:\n\n${notes}`,
});

export const plannerPrompt = (i: {
  tasks: string;
  dueDates: string;
  workingHours: string;
  priority: string;
  cadence: string;
}) => ({
  system:
    "You are a productivity planner. Produce a clear time-blocked markdown schedule. Include: ## Schedule (time blocks with tasks, each with a priority label High/Medium/Low and an estimated duration), ## Productivity Suggestions. Keep it concise and realistic.",
  prompt: `Cadence: ${i.cadence}\nWorking hours: ${i.workingHours}\nPriority preference: ${i.priority}\nDue dates: ${i.dueDates || "not specified"}\nTasks:\n${i.tasks}`,
});

export const researchPrompt = (i: { topic: string; url: string }) => ({
  system:
    "You are a research assistant. Produce a structured markdown report with sections: ## Summary, ## Key Points, ## Important Facts, ## Advantages, ## Challenges, ## Recommendations, ## Further Reading. Use bullet lists.",
  prompt: `Topic: ${i.topic}\n${i.url ? `Reference URL: ${i.url}` : ""}`,
});

export const chatSystem =
  "You are WorkWise AI, a helpful workplace productivity assistant. Answer concisely, using markdown when helpful. Keep responses professional and actionable.";