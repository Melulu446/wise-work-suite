import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CalendarClock, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { ResponsibleAINotice } from "@/components/responsible-ai";
import { LoadingInline } from "@/components/loading-inline";
import { EmptyState } from "@/components/empty-state";
import { AIActions } from "@/components/ai-actions";
import { Markdown } from "@/components/markdown";
import { runAI } from "@/lib/ai.functions";
import { plannerPrompt } from "@/lib/prompts";
import { saveHistoryItem } from "@/lib/history";

export const Route = createFileRoute("/tasks")({ component: TasksPage });

function TasksPage() {
  const call = useServerFn(runAI);
  const [form, setForm] = useState({
    tasks: "",
    dueDates: "",
    workingHours: "9:00 - 17:00",
    priority: "High",
    cadence: "Daily",
  });
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState("");

  const generate = async () => {
    if (!form.tasks.trim()) return toast.error("Please enter tasks.");
    setLoading(true);
    try {
      const { system, prompt } = plannerPrompt(form);
      const { text } = await call({ data: { system, prompt } });
      setSchedule(text);
      saveHistoryItem({ kind: "schedule", title: `${form.cadence} plan — ${new Date().toLocaleDateString()}`, content: text });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader icon={CalendarClock} title="AI Task Planner" description="Turn your tasks into a time-blocked, prioritized schedule." />
      <ResponsibleAINotice />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6">
            <Tabs value={form.cadence} onValueChange={(v) => setForm({ ...form, cadence: v })}>
              <TabsList>
                <TabsTrigger value="Daily">Daily</TabsTrigger>
                <TabsTrigger value="Weekly">Weekly</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="space-y-2">
              <Label>Tasks (one per line)</Label>
              <Textarea rows={7} value={form.tasks} onChange={(e) => setForm({ ...form, tasks: e.target.value })} placeholder={"Prepare Q3 deck\nReview PRs\nCall with client..."} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Due Dates (optional)</Label>
                <Input value={form.dueDates} onChange={(e) => setForm({ ...form, dueDates: e.target.value })} placeholder="Deck: Fri, PRs: today" />
              </div>
              <div className="space-y-2">
                <Label>Working Hours</Label>
                <Input value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Priority Preference</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">Focus on High priority first</SelectItem>
                  <SelectItem value="Balanced">Balanced across priorities</SelectItem>
                  <SelectItem value="Quick wins">Quick wins first</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generate} disabled={loading} className="gap-2">
              <Wand2 className="h-4 w-4" /> Generate Plan
            </Button>
          </CardContent>
        </Card>
        <div className="space-y-4">
          {loading ? <LoadingInline label="Planning..." /> : !schedule ? (
            <EmptyState>Your generated schedule will appear here.</EmptyState>
          ) : (
            <Card>
              <CardContent className="space-y-3 p-6">
                <Markdown>{schedule}</Markdown>
                <AIActions text={schedule} filename="schedule.txt" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}