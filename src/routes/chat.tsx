import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { ResponsibleAINotice } from "@/components/responsible-ai";
import { Markdown } from "@/components/markdown";
import { runAI } from "@/lib/ai.functions";
import { chatSystem } from "@/lib/prompts";
import { saveHistoryItem } from "@/lib/history";

export const Route = createFileRoute("/chat")({ component: ChatPage });

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Write a professional email",
  "Summarize this meeting",
  "Plan my day",
  "Explain Agile methodology",
  "Improve this report",
];

function ChatPage() {
  const call = useServerFn(runAI);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { text: reply } = await call({ data: { system: chatSystem, messages: next } });
      const updated: Msg[] = [...next, { role: "assistant", content: reply }];
      setMessages(updated);
      if (next.length === 1) {
        saveHistoryItem({ kind: "chat", title: content.slice(0, 80), content: `You: ${content}\n\nAI: ${reply}` });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col gap-4">
      <PageHeader icon={Bot} title="AI Chatbot" description="Your interactive workplace assistant." />
      <Card className="flex min-h-0 flex-1 flex-col p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 ? (
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-lg font-semibold">How can I help you today?</h3>
              <p className="mt-1 text-sm text-muted-foreground">Try one of these prompts:</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border bg-card px-3 py-1.5 text-xs transition hover:border-primary/40 hover:bg-primary/5"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => <Bubble key={i} msg={m} />)
          )}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-primary" />
              Thinking...
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="border-t p-3 sm:p-4">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask WorkWise AI anything..."
              rows={1}
              className="min-h-[44px] resize-none"
            />
            <Button onClick={() => send()} disabled={loading || !input.trim()} size="icon" aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
      <ResponsibleAINotice />
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${isUser ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
        {isUser ? <p className="whitespace-pre-wrap">{msg.content}</p> : <Markdown>{msg.content}</Markdown>}
      </div>
    </div>
  );
}