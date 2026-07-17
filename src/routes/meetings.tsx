import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { FileText, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { ResponsibleAINotice } from "@/components/responsible-ai";
import { LoadingInline } from "@/components/loading-inline";
import { EmptyState } from "@/components/empty-state";
import { AIActions } from "@/components/ai-actions";
import { Markdown } from "@/components/markdown";
import { runAI } from "@/lib/ai.functions";
import { summaryPrompt } from "@/lib/prompts";
import { saveHistoryItem } from "@/lib/history";

export const Route = createFileRoute("/meetings")({ component: MeetingsPage });

function MeetingsPage() {
  const call = useServerFn(runAI);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");

  const generate = async () => {
    if (!notes.trim()) return toast.error("Please enter meeting notes.");
    setLoading(true);
    try {
      const { system, prompt } = summaryPrompt(notes);
      const { text } = await call({ data: { system, prompt } });
      setSummary(text);
      saveHistoryItem({ kind: "summary", title: `Meeting summary — ${new Date().toLocaleDateString()}`, content: text });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader icon={FileText} title="Meeting Notes Summarizer" description="Convert long meeting notes into concise, structured summaries." />
      <ResponsibleAINotice />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6">
            <Textarea placeholder="Paste your meeting notes here..." rows={18} value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button onClick={generate} disabled={loading} className="gap-2">
              <Wand2 className="h-4 w-4" /> Generate Summary
            </Button>
          </CardContent>
        </Card>
        <div className="space-y-4">
          {loading ? <LoadingInline label="Summarizing..." /> : !summary ? (
            <EmptyState>Meeting summary will appear here.</EmptyState>
          ) : (
            <Card>
              <CardContent className="space-y-3 p-6">
                <Markdown>{summary}</Markdown>
                <AIActions text={summary} filename="meeting-summary.txt" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}