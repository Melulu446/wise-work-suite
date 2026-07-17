import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { BookOpen, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { ResponsibleAINotice } from "@/components/responsible-ai";
import { LoadingInline } from "@/components/loading-inline";
import { EmptyState } from "@/components/empty-state";
import { AIActions } from "@/components/ai-actions";
import { Markdown } from "@/components/markdown";
import { runAI } from "@/lib/ai.functions";
import { researchPrompt } from "@/lib/prompts";
import { saveHistoryItem } from "@/lib/history";

export const Route = createFileRoute("/research")({ component: ResearchPage });

function ResearchPage() {
  const call = useServerFn(runAI);
  const [topic, setTopic] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState("");

  const generate = async () => {
    if (!topic.trim()) return toast.error("Please enter a topic.");
    setLoading(true);
    try {
      const { system, prompt } = researchPrompt({ topic, url });
      const { text } = await call({ data: { system, prompt } });
      setOut(text);
      saveHistoryItem({ kind: "research", title: topic.slice(0, 80), content: text });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader icon={BookOpen} title="AI Research Assistant" description="Summarize research topics and surface key insights." />
      <ResponsibleAINotice />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label>Topic or article</Label>
              <Textarea rows={8} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Impact of AI agents on software engineering productivity..." />
            </div>
            <div className="space-y-2">
              <Label>Reference URL (optional)</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            </div>
            <Button onClick={generate} disabled={loading} className="gap-2">
              <Wand2 className="h-4 w-4" /> Research
            </Button>
          </CardContent>
        </Card>
        <div className="space-y-4">
          {loading ? <LoadingInline label="Researching..." /> : !out ? (
            <EmptyState>Your research report will appear here.</EmptyState>
          ) : (
            <Card>
              <CardContent className="space-y-3 p-6">
                <Markdown>{out}</Markdown>
                <AIActions text={out} filename="research.txt" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}