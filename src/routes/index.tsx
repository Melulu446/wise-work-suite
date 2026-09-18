import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Mail,
  FileText,
  CalendarClock,
  BookOpen,
  Bot,
  FileUser,
  ArrowUpRight,
  Sparkles,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsibleAINotice } from "@/components/responsible-ai";
import { loadHistory, loadStats, type HistoryItem } from "@/lib/history";

export const Route = createFileRoute("/")({ component: Dashboard });

const tools = [
  { title: "Smart Email Generator", url: "/email", icon: Mail, desc: "Draft professional emails in seconds." },
  { title: "Meeting Notes Summarizer", url: "/meetings", icon: FileText, desc: "Turn long notes into clear summaries." },
  { title: "AI Task Planner", url: "/tasks", icon: CalendarClock, desc: "Build a smart, time-blocked schedule." },
  { title: "AI Research Assistant", url: "/research", icon: BookOpen, desc: "Summarize topics with key insights." },
  { title: "AI Chatbot", url: "/chat", icon: Bot, desc: "Ask your workplace assistant anything." },
  { title: "Resume Builder", url: "/resume", icon: FileUser, desc: "Build a professional CV and export a PDF." },
] as const;

function useLive<T>(read: () => T): T {
  const [v, setV] = useState<T>(read);
  useEffect(() => {
    setV(read());
    const h = () => setV(read());
    window.addEventListener("workwise-history-updated", h);
    return () => window.removeEventListener("workwise-history-updated", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return v;
}

function Dashboard() {
  const stats = useLive(loadStats);
  const history = useLive<HistoryItem[]>(loadHistory);

  const cards = [
    { label: "Emails Generated", value: stats.email, icon: Mail },
    { label: "Meetings Summarized", value: stats.summary, icon: FileText },
    { label: "Tasks Planned", value: stats.schedule, icon: CalendarClock },
    { label: "Research Sessions", value: stats.research, icon: BookOpen },
    { label: "Chat Conversations", value: stats.chat, icon: Bot },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="animate-fade-in rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Welcome back
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Do more, faster with WorkWise AI
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Your AI workplace productivity assistant. Draft emails, summarize meetings, plan
          your day, research topics and chat — all in one place.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c, i) => (
          <Card
            key={c.label}
            className="hover-lift animate-fade-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
                <c.icon className="h-4 w-4 text-primary transition-transform duration-300 group-hover:rotate-6" />
              </div>
              <div className="mt-2 text-2xl font-semibold tabular-nums">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">AI Tools</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t, i) => (
            <Link
              key={t.url}
              to={t.url}
              style={{ animationDelay: `${i * 70}ms` }}
              className="group hover-lift press animate-fade-in rounded-xl border bg-card p-5 shadow-sm hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/15">
                  <t.icon className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-6" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <div className="mt-4 font-semibold">{t.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">Recent Activity</h2>
          <Card>
            <CardContent className="p-0">
              {history.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No activity yet. Try a tool above to get started.
                </div>
              ) : (
                <ul className="divide-y">
                  {history.slice(0, 6).map((h) => (
                    <li key={h.id} className="flex items-center gap-3 p-4 text-sm">
                      <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{h.title}</div>
                        <div className="text-xs capitalize text-muted-foreground">
                          {h.kind} · {new Date(h.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold">Responsible AI</h2>
          <ResponsibleAINotice />
        </div>
      </section>
    </div>
  );
}
