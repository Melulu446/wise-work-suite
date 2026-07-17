import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { createGateway, DEFAULT_MODEL } from "./ai-gateway.server";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

type RunInput = {
  system: string;
  prompt?: string;
  messages?: ChatMessage[];
};

export const runAI = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const d = data as RunInput;
    if (!d || typeof d.system !== "string") throw new Error("Invalid input");
    if (!d.prompt && !d.messages) throw new Error("Missing prompt or messages");
    return d;
  })
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY is not configured");
    const gateway = createGateway(key);
    const model = gateway(DEFAULT_MODEL);

    try {
      if (data.messages) {
        const { text } = await generateText({
          model,
          system: data.system,
          messages: data.messages,
        });
        return { text };
      }
      const { text } = await generateText({
        model,
        system: data.system,
        prompt: data.prompt!,
      });
      return { text };
    } catch (e: unknown) {
      const err = e as { statusCode?: number; message?: string };
      const status = err?.statusCode;
      if (status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
      if (status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
      throw new Error(err?.message ?? "AI request failed");
    }
  });