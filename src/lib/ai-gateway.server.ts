import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createGateway(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
  });
}

export const DEFAULT_MODEL = "google/gemini-2.5-flash";