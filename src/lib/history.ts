export type HistoryKind = "email" | "summary" | "schedule" | "research" | "chat";

export type HistoryItem = {
  id: string;
  kind: HistoryKind;
  title: string;
  content: string;
  createdAt: number;
};

const KEY = "workwise-history";
const STATS_KEY = "workwise-stats";

export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveHistoryItem(item: Omit<HistoryItem, "id" | "createdAt">) {
  const items = loadHistory();
  const next: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  items.unshift(next);
  window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, 200)));
  bumpStat(item.kind);
  window.dispatchEvent(new Event("workwise-history-updated"));
  return next;
}

export function deleteHistoryItem(id: string) {
  const items = loadHistory().filter((i) => i.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("workwise-history-updated"));
}

export function clearHistory() {
  window.localStorage.removeItem(KEY);
  window.localStorage.removeItem(STATS_KEY);
  window.dispatchEvent(new Event("workwise-history-updated"));
}

export type Stats = Record<HistoryKind, number>;

export function loadStats(): Stats {
  const base: Stats = { email: 0, summary: 0, schedule: 0, research: 0, chat: 0 };
  if (typeof window === "undefined") return base;
  try {
    return { ...base, ...JSON.parse(window.localStorage.getItem(STATS_KEY) ?? "{}") };
  } catch {
    return base;
  }
}

function bumpStat(kind: HistoryKind) {
  const s = loadStats();
  s[kind] = (s[kind] ?? 0) + 1;
  window.localStorage.setItem(STATS_KEY, JSON.stringify(s));
}

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}