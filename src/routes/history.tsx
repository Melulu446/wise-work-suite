import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { History as HistoryIcon, Search, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Markdown } from "@/components/markdown";
import { loadHistory, deleteHistoryItem, type HistoryItem, type HistoryKind } from "@/lib/history";

export const Route = createFileRoute("/history")({ component: HistoryPage });

const TABS: { key: HistoryKind | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "email", label: "Emails" },
  { key: "summary", label: "Summaries" },
  { key: "schedule", label: "Schedules" },
  { key: "research", label: "Research" },
  { key: "chat", label: "Chats" },
];

function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<HistoryItem | null>(null);

  const refresh = () => setItems(loadHistory());
  useEffect(() => {
    refresh();
    window.addEventListener("workwise-history-updated", refresh);
    return () => window.removeEventListener("workwise-history-updated", refresh);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((i) => i.title.toLowerCase().includes(s) || i.content.toLowerCase().includes(s));
  }, [items, q]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader icon={HistoryIcon} title="History" description="Browse and reopen past AI outputs." />
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search history..." className="pl-9" />
      </div>
      <Tabs defaultValue="all">
        <TabsList className="flex-wrap">
          {TABS.map((t) => (<TabsTrigger key={t.key} value={t.key}>{t.label}</TabsTrigger>))}
        </TabsList>
        {TABS.map((t) => {
          const list = t.key === "all" ? filtered : filtered.filter((i) => i.kind === t.key);
          return (
            <TabsContent key={t.key} value={t.key} className="mt-4">
              {list.length === 0 ? (
                <EmptyState>No {t.key === "all" ? "history" : t.label.toLowerCase()} yet.</EmptyState>
              ) : (
                <div className="space-y-2">
                  {list.map((i) => (
                    <Card key={i.id}>
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{i.title}</div>
                          <div className="text-xs capitalize text-muted-foreground">{i.kind} · {new Date(i.createdAt).toLocaleString()}</div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setOpen(i)} aria-label="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteHistoryItem(i.id)} aria-label="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="pr-6">{open?.title}</DialogTitle>
          </DialogHeader>
          {open && <Markdown>{open.content}</Markdown>}
        </DialogContent>
      </Dialog>
    </div>
  );
}