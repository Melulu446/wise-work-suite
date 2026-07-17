import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Mail, RefreshCw, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { ResponsibleAINotice } from "@/components/responsible-ai";
import { LoadingInline } from "@/components/loading-inline";
import { EmptyState } from "@/components/empty-state";
import { AIActions } from "@/components/ai-actions";
import { runAI } from "@/lib/ai.functions";
import { emailPrompt } from "@/lib/prompts";
import { saveHistoryItem } from "@/lib/history";

export const Route = createFileRoute("/email")({ component: EmailPage });

const TONES = ["Formal", "Friendly", "Persuasive", "Apologetic", "Thank You", "Follow Up", "Reminder"];

function parseEmail(text: string) {
  const m = text.match(/^\s*Subject:\s*(.+?)\n([\s\S]*)$/i);
  if (m) return { subject: m[1].trim(), body: m[2].trim() };
  return { subject: "", body: text.trim() };
}

function EmailPage() {
  const call = useServerFn(runAI);
  const [form, setForm] = useState({
    recipientName: "",
    recipientPosition: "",
    purpose: "",
    tone: "Formal",
    instructions: "",
  });
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const wordCount = useMemo(() => body.trim().split(/\s+/).filter(Boolean).length, [body]);
  const charCount = body.length;

  const generate = async () => {
    if (!form.recipientName.trim() || !form.purpose.trim()) {
      toast.error("Please enter recipient and purpose.");
      return;
    }
    setLoading(true);
    try {
      const { system, prompt } = emailPrompt(form);
      const { text } = await call({ data: { system, prompt } });
      const parsed = parseEmail(text);
      setSubject(parsed.subject);
      setBody(parsed.body);
      saveHistoryItem({
        kind: "email",
        title: parsed.subject || `Email to ${form.recipientName}`,
        content: `Subject: ${parsed.subject}\n\n${parsed.body}`,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setForm({ recipientName: "", recipientPosition: "", purpose: "", tone: "Formal", instructions: "" });
    setSubject("");
    setBody("");
  };

  const full = subject ? `Subject: ${subject}\n\n${body}` : body;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        icon={Mail}
        title="Smart Email Generator"
        description="Generate professional emails tailored to your tone and purpose."
      />
      <ResponsibleAINotice />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rn">Recipient Name</Label>
                <Input id="rn" value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rp">Recipient Position</Label>
                <Input id="rp" value={form.recipientPosition} onChange={(e) => setForm({ ...form, recipientPosition: e.target.value })} placeholder="Head of Marketing" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pu">Email Purpose</Label>
              <Textarea id="pu" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="Request a meeting to discuss Q3 campaign..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai">Additional Instructions</Label>
              <Textarea id="ai" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Keep it under 120 words, mention Friday deadline..." rows={3} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={generate} disabled={loading} className="gap-2">
                <Wand2 className="h-4 w-4" /> Generate
              </Button>
              <Button variant="outline" onClick={clear} disabled={loading} className="gap-2">
                <Trash2 className="h-4 w-4" /> Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading ? (
            <LoadingInline label="Generating..." />
          ) : !body ? (
            <EmptyState>Your generated email will appear here.</EmptyState>
          ) : (
            <Card>
              <CardContent className="space-y-3 p-6">
                <div className="space-y-2">
                  <Label htmlFor="sub">Subject</Label>
                  <Input id="sub" value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bd">Body</Label>
                  <Textarea id="bd" value={body} onChange={(e) => setBody(e.target.value)} rows={14} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>{wordCount} words · {charCount} characters</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={generate} disabled={loading} className="gap-2">
                      <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                    </Button>
                    <AIActions text={full} filename="email.txt" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}