import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  FileUser,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Wand2,
  ShieldCheck,
  Target,
  Save,
  Download,
  LayoutTemplate,
  UserRoundCog,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { ResponsibleAINotice } from "@/components/responsible-ai";
import { LoadingInline } from "@/components/loading-inline";
import { Markdown } from "@/components/markdown";
import { ResumePreview } from "@/components/resume/resume-preview";
import { ResumeDocument } from "@/components/resume/resume-document";
import { runAI } from "@/lib/ai.functions";
import { atsPrompt, improvePrompt, parseAtsScore, tailorPrompt } from "@/lib/resume-prompts";
import { loadProfile, profileIsEmpty } from "@/lib/profile";
import { downloadText, saveHistoryItem } from "@/lib/history";
import { exportResumePdf, resumePdfFilename } from "@/lib/resume-pdf";
import {
  DEFAULT_SECTIONS,
  DEFAULT_STYLE,
  FONTS,
  TEMPLATES,
  emptyResumeData,
  loadResume,
  newCert,
  newEducation,
  newExperience,
  newProject,
  newReference,
  resumeToText,
  saveResume,
  type ResumeState,
  type SectionKey,
  type TemplateId,
} from "@/lib/resume";

export const Route = createFileRoute("/resume")({
  head: () => ({
    meta: [
      { title: "Resume Builder — WorkWise AI" },
      {
        name: "description",
        content:
          "Build a professional, ATS-friendly resume from your WorkWise AI profile with 8 templates, AI wording help and PDF download.",
      },
      { property: "og:title", content: "Resume Builder — WorkWise AI" },
      {
        property: "og:description",
        content: "Pick a template, edit every section, check your ATS score and download a polished PDF resume.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResumeBuilder,
});

const JOBS_KEY = "workwise-jobs";
type SavedJob = { id: string; title: string; description: string };

function loadJobs(): SavedJob[] {
  try {
    return JSON.parse(window.localStorage.getItem(JOBS_KEY) ?? "[]") as SavedJob[];
  } catch {
    return [];
  }
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  rows,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
  id: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      {textarea ? (
        <Textarea id={id} value={value} rows={rows ?? 3} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function Block({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Card className="hover-lift">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function ResumeBuilder() {
  const ai = useServerFn(runAI);
  const [state, setState] = useState<ResumeState>({
    data: emptyResumeData(),
    sections: DEFAULT_SECTIONS,
    style: DEFAULT_STYLE,
  });
  const [chosen, setChosen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [ats, setAts] = useState<{ score: number | null; body: string } | null>(null);
  const [job, setJob] = useState("");
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [tailor, setTailor] = useState("");
  const hydrated = useRef(false);

  useEffect(() => {
    const saved = loadResume();
    if (saved) {
      setState(saved);
      setChosen(true);
    }
    setJobs(loadJobs());
    hydrated.current = true;
  }, []);

  const setData = <K extends keyof ResumeState["data"]>(key: K, value: ResumeState["data"][K]) =>
    setState((s) => ({ ...s, data: { ...s.data, [key]: value } }));
  const setStyle = <K extends keyof ResumeState["style"]>(key: K, value: ResumeState["style"][K]) =>
    setState((s) => ({ ...s, style: { ...s.style, [key]: value } }));

  const text = useMemo(() => resumeToText(state), [state]);

  function importProfile(silent = false) {
    const p = loadProfile();
    if (profileIsEmpty(p)) {
      if (!silent)
        toast.error("No profile details saved yet. Add them in Settings → Your Profile, then import again.");
      return;
    }
    setState((s) => ({
      ...s,
      data: {
        ...s.data,
        fullName: p.fullName || s.data.fullName,
        title: p.title || s.data.title,
        email: p.email || s.data.email,
        phone: p.phone || s.data.phone,
        location: p.location || s.data.location,
        linkedin: p.linkedin || s.data.linkedin,
        portfolio: p.portfolio || s.data.portfolio,
        summary: p.summary || s.data.summary,
        skills: p.skills || s.data.skills,
        languages: p.languages || s.data.languages,
      },
    }));
    if (!silent) toast.success("Profile details imported.");
  }

  function pickTemplate(id: TemplateId) {
    setStyle("template", id);
    if (!chosen) {
      setChosen(true);
      importProfile(true);
    }
  }

  async function improve(label: string, value: string, apply: (v: string) => void, tag: string) {
    if (!value.trim()) {
      toast.error(`Please add some ${label.toLowerCase()} text first.`);
      return;
    }
    setBusy(tag);
    try {
      const { text: out } = await ai({ data: improvePrompt(label, value) });
      apply(out.trim());
      toast.success(`${label} improved.`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function runAts() {
    setBusy("ats");
    setAts(null);
    try {
      const { text: out } = await ai({ data: atsPrompt(text) });
      setAts(parseAtsScore(out));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function runTailor() {
    if (!job.trim()) {
      toast.error("Please paste a job description.");
      return;
    }
    setBusy("tailor");
    setTailor("");
    try {
      const { text: out } = await ai({ data: tailorPrompt(text, job) });
      setTailor(out);
      saveHistoryItem({ kind: "research", title: "Resume tailored to job", content: out });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function save() {
    saveResume(state);
    saveHistoryItem({
      kind: "research",
      title: `Resume — ${state.data.fullName || "Untitled"}`,
      content: text,
    });
    toast.success("Resume saved.");
  }

  function saveJob() {
    if (!job.trim()) return toast.error("Please paste a job description.");
    const next = [
      { id: Math.random().toString(36).slice(2), title: job.slice(0, 48).replace(/\s+/g, " ").trim(), description: job },
      ...jobs,
    ].slice(0, 20);
    setJobs(next);
    window.localStorage.setItem(JOBS_KEY, JSON.stringify(next));
    toast.success("Job saved.");
  }

  function moveSection(i: number, dir: -1 | 1) {
    setState((s) => {
      const arr = [...s.sections];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return s;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...s, sections: arr };
    });
  }

  const templateGallery = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {TEMPLATES.map((t, i) => (
        <button
          key={t.id}
          onClick={() => pickTemplate(t.id)}
          style={{ animationDelay: `${i * 50}ms` }}
          className={`group hover-lift press animate-fade-in overflow-hidden rounded-xl border bg-card text-left shadow-sm ${
            state.style.template === t.id ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/40"
          }`}
        >
          <div className="h-40 overflow-hidden bg-white">
            <div style={{ transform: "scale(0.24)", transformOrigin: "top left", width: 794 }}>
              <ResumeDocument
                state={{
                  ...state,
                  style: { ...state.style, template: t.id },
                  data: {
                    ...state.data,
                    fullName: state.data.fullName || "Alex Kim",
                    title: state.data.title || "Product Manager",
                  },
                }}
              />
            </div>
          </div>
          <div className="border-t p-3">
            <div className="text-sm font-semibold">{t.name}</div>
            <div className="text-xs text-muted-foreground">{t.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );

  if (!chosen) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          icon={FileUser}
          title="Resume Builder"
          description="Choose a professional template to start. Your profile details are filled in automatically."
        />
        <ResponsibleAINotice />
        {templateGallery}
      </div>
    );
  }

  const d = state.data;
  const canExport = d.fullName.trim() !== "" && (d.email.trim() !== "" || d.phone.trim() !== "");

  const exportPdf = async () => {
    if (!canExport) {
      toast.error("Add your full name and an email or phone number before exporting.");
      return;
    }
    setExporting(true);
    try {
      await exportResumePdf(state);
      toast.success(`Downloaded ${resumePdfFilename(state)}`);
    } catch {
      toast.error("Couldn't generate the PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <PageHeader
        icon={FileUser}
        title="Resume Builder"
        description="Edit on the left, see your A4 resume update live on the right."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="press" onClick={() => importProfile()}>
              <UserRoundCog className="mr-2 h-4 w-4" /> Import profile
            </Button>
            <Button variant="outline" size="sm" className="press" onClick={save}>
              <Save className="mr-2 h-4 w-4" /> Save Resume
            </Button>
            <Button
              size="sm"
              className="press"
              onClick={exportPdf}
              disabled={exporting || !canExport}
              title={canExport ? `Download ${resumePdfFilename(state)}` : "Enter your name and email or phone to export"}
            >
              <Download className="mr-2 h-4 w-4" /> {exporting ? "Preparing PDF..." : "Download PDF"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* LEFT: controls */}
        <div className="min-w-0 space-y-4">
          <Tabs defaultValue="content">
            <TabsList className="w-full">
              <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
              <TabsTrigger value="design" className="flex-1">Design</TabsTrigger>
              <TabsTrigger value="sections" className="flex-1">Sections</TabsTrigger>
              <TabsTrigger value="ai" className="flex-1">AI Tools</TabsTrigger>
            </TabsList>

            {/* CONTENT */}
            <TabsContent value="content" className="mt-4 space-y-4">
              <Block title="Personal details">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id="fullName" label="Full Name" value={d.fullName} onChange={(v) => setData("fullName", v)} placeholder="Alex Kim" />
                  <Field id="title" label="Professional Title" value={d.title} onChange={(v) => setData("title", v)} placeholder="Senior Product Manager" />
                  <Field id="email" label="Email" value={d.email} onChange={(v) => setData("email", v)} placeholder="alex@example.com" />
                  <Field id="phone" label="Phone" value={d.phone} onChange={(v) => setData("phone", v)} placeholder="+1 555 0100" />
                  <Field id="location" label="Location" value={d.location} onChange={(v) => setData("location", v)} placeholder="Berlin, Germany" />
                  <Field id="linkedin" label="LinkedIn" value={d.linkedin} onChange={(v) => setData("linkedin", v)} placeholder="linkedin.com/in/alexkim" />
                  <Field id="portfolio" label="Portfolio" value={d.portfolio} onChange={(v) => setData("portfolio", v)} placeholder="alexkim.dev" />
                </div>
              </Block>

              <Block
                title="Professional Summary"
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    className="press"
                    disabled={busy === "summary"}
                    onClick={() => improve("Professional Summary", d.summary, (v) => setData("summary", v), "summary")}
                  >
                    <Wand2 className="mr-2 h-3.5 w-3.5" /> Improve with AI
                  </Button>
                }
              >
                <Textarea
                  rows={5}
                  value={d.summary}
                  placeholder="A short paragraph about your experience, strengths and focus."
                  onChange={(e) => setData("summary", e.target.value)}
                />
                {busy === "summary" && <LoadingInline label="Improving..." />}
              </Block>

              <Block
                title="Work Experience"
                action={
                  <Button variant="outline" size="sm" className="press" onClick={() => setData("experience", [...d.experience, newExperience()])}>
                    <Plus className="mr-2 h-3.5 w-3.5" /> Add
                  </Button>
                }
              >
                <div className="space-y-4">
                  {d.experience.map((e, i) => (
                    <div key={e.id} className="space-y-3 rounded-lg border p-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field id={`role-${e.id}`} label="Role" value={e.role} onChange={(v) => setData("experience", d.experience.map((x) => (x.id === e.id ? { ...x, role: v } : x)))} />
                        <Field id={`company-${e.id}`} label="Company" value={e.company} onChange={(v) => setData("experience", d.experience.map((x) => (x.id === e.id ? { ...x, company: v } : x)))} />
                        <Field id={`loc-${e.id}`} label="Location" value={e.location} onChange={(v) => setData("experience", d.experience.map((x) => (x.id === e.id ? { ...x, location: v } : x)))} />
                        <div className="grid grid-cols-2 gap-2">
                          <Field id={`start-${e.id}`} label="Start" value={e.start} onChange={(v) => setData("experience", d.experience.map((x) => (x.id === e.id ? { ...x, start: v } : x)))} placeholder="2022" />
                          <Field id={`end-${e.id}`} label="End" value={e.end} onChange={(v) => setData("experience", d.experience.map((x) => (x.id === e.id ? { ...x, end: v } : x)))} placeholder="Present" />
                        </div>
                      </div>
                      <Field
                        id={`bullets-${e.id}`}
                        label="Achievements (one per line)"
                        textarea
                        rows={4}
                        value={e.bullets}
                        onChange={(v) => setData("experience", d.experience.map((x) => (x.id === e.id ? { ...x, bullets: v } : x)))}
                        placeholder={"Led a team of 6 engineers\nReduced onboarding time by 30%"}
                      />
                      {busy === `exp-${e.id}` && <LoadingInline label="Improving..." />}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="press"
                          disabled={busy === `exp-${e.id}`}
                          onClick={() =>
                            improve(
                              "Work Experience bullet points",
                              e.bullets,
                              (v) => setData("experience", d.experience.map((x) => (x.id === e.id ? { ...x, bullets: v } : x))),
                              `exp-${e.id}`,
                            )
                          }
                        >
                          <Wand2 className="mr-2 h-3.5 w-3.5" /> Improve with AI
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="press text-destructive"
                          onClick={() => setData("experience", d.experience.filter((x) => x.id !== e.id))}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                        </Button>
                        <div className="ml-auto flex gap-1">
                          <Button variant="ghost" size="icon" aria-label="Move up" disabled={i === 0} onClick={() => setData("experience", swap(d.experience, i, -1))}>
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" aria-label="Move down" disabled={i === d.experience.length - 1} onClick={() => setData("experience", swap(d.experience, i, 1))}>
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Block>

              <Block
                title="Education"
                action={
                  <Button variant="outline" size="sm" className="press" onClick={() => setData("education", [...d.education, newEducation()])}>
                    <Plus className="mr-2 h-3.5 w-3.5" /> Add
                  </Button>
                }
              >
                <div className="space-y-4">
                  {d.education.map((e, i) => (
                    <div key={e.id} className="space-y-3 rounded-lg border p-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field id={`deg-${e.id}`} label="Degree" value={e.degree} onChange={(v) => setData("education", d.education.map((x) => (x.id === e.id ? { ...x, degree: v } : x)))} />
                        <Field id={`school-${e.id}`} label="School" value={e.school} onChange={(v) => setData("education", d.education.map((x) => (x.id === e.id ? { ...x, school: v } : x)))} />
                        <Field id={`eloc-${e.id}`} label="Location" value={e.location} onChange={(v) => setData("education", d.education.map((x) => (x.id === e.id ? { ...x, location: v } : x)))} />
                        <div className="grid grid-cols-2 gap-2">
                          <Field id={`estart-${e.id}`} label="Start" value={e.start} onChange={(v) => setData("education", d.education.map((x) => (x.id === e.id ? { ...x, start: v } : x)))} />
                          <Field id={`eend-${e.id}`} label="End" value={e.end} onChange={(v) => setData("education", d.education.map((x) => (x.id === e.id ? { ...x, end: v } : x)))} />
                        </div>
                      </div>
                      <Field id={`edet-${e.id}`} label="Details" textarea rows={2} value={e.details} onChange={(v) => setData("education", d.education.map((x) => (x.id === e.id ? { ...x, details: v } : x)))} />
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="press text-destructive" onClick={() => setData("education", d.education.filter((x) => x.id !== e.id))}>
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                        </Button>
                        <div className="ml-auto flex gap-1">
                          <Button variant="ghost" size="icon" aria-label="Move up" disabled={i === 0} onClick={() => setData("education", swap(d.education, i, -1))}>
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" aria-label="Move down" disabled={i === d.education.length - 1} onClick={() => setData("education", swap(d.education, i, 1))}>
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Block>

              <Block
                title="Skills"
                action={
                  <Button variant="outline" size="sm" className="press" disabled={busy === "skills"} onClick={() => improve("Skills list", d.skills, (v) => setData("skills", v), "skills")}>
                    <Wand2 className="mr-2 h-3.5 w-3.5" /> Improve with AI
                  </Button>
                }
              >
                <Textarea rows={3} value={d.skills} placeholder="Product strategy, Roadmapping, SQL, Figma" onChange={(e) => setData("skills", e.target.value)} />
                <p className="text-xs text-muted-foreground">Separate with commas or new lines.</p>
              </Block>

              <Block title="Languages">
                <Textarea rows={2} value={d.languages} placeholder="English (fluent), German (B2)" onChange={(e) => setData("languages", e.target.value)} />
              </Block>

              <Block
                title="Certifications"
                action={
                  <Button variant="outline" size="sm" className="press" onClick={() => setData("certifications", [...d.certifications, newCert()])}>
                    <Plus className="mr-2 h-3.5 w-3.5" /> Add
                  </Button>
                }
              >
                <div className="space-y-3">
                  {d.certifications.map((c) => (
                    <div key={c.id} className="grid items-end gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_90px_auto]">
                      <Field id={`cn-${c.id}`} label="Name" value={c.name} onChange={(v) => setData("certifications", d.certifications.map((x) => (x.id === c.id ? { ...x, name: v } : x)))} />
                      <Field id={`ci-${c.id}`} label="Issuer" value={c.issuer} onChange={(v) => setData("certifications", d.certifications.map((x) => (x.id === c.id ? { ...x, issuer: v } : x)))} />
                      <Field id={`cy-${c.id}`} label="Year" value={c.year} onChange={(v) => setData("certifications", d.certifications.map((x) => (x.id === c.id ? { ...x, year: v } : x)))} />
                      <Button variant="ghost" size="icon" aria-label="Delete certification" className="text-destructive" onClick={() => setData("certifications", d.certifications.filter((x) => x.id !== c.id))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {d.certifications.length === 0 && <p className="text-xs text-muted-foreground">No certifications added.</p>}
                </div>
              </Block>

              <Block
                title="Projects"
                action={
                  <Button variant="outline" size="sm" className="press" onClick={() => setData("projects", [...d.projects, newProject()])}>
                    <Plus className="mr-2 h-3.5 w-3.5" /> Add
                  </Button>
                }
              >
                <div className="space-y-3">
                  {d.projects.map((p) => (
                    <div key={p.id} className="space-y-3 rounded-lg border p-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field id={`pn-${p.id}`} label="Name" value={p.name} onChange={(v) => setData("projects", d.projects.map((x) => (x.id === p.id ? { ...x, name: v } : x)))} />
                        <Field id={`pl-${p.id}`} label="Link" value={p.link} onChange={(v) => setData("projects", d.projects.map((x) => (x.id === p.id ? { ...x, link: v } : x)))} />
                      </div>
                      <Field id={`pd-${p.id}`} label="Description" textarea rows={2} value={p.description} onChange={(v) => setData("projects", d.projects.map((x) => (x.id === p.id ? { ...x, description: v } : x)))} />
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="press" disabled={busy === `proj-${p.id}`} onClick={() => improve("Project description", p.description, (v) => setData("projects", d.projects.map((x) => (x.id === p.id ? { ...x, description: v } : x))), `proj-${p.id}`)}>
                          <Wand2 className="mr-2 h-3.5 w-3.5" /> Improve with AI
                        </Button>
                        <Button variant="ghost" size="sm" className="press text-destructive" onClick={() => setData("projects", d.projects.filter((x) => x.id !== p.id))}>
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                  {d.projects.length === 0 && <p className="text-xs text-muted-foreground">No projects added.</p>}
                </div>
              </Block>

              <Block
                title="References"
                action={
                  <Button variant="outline" size="sm" className="press" onClick={() => setData("references", [...d.references, newReference()])}>
                    <Plus className="mr-2 h-3.5 w-3.5" /> Add
                  </Button>
                }
              >
                <div className="space-y-3">
                  {d.references.map((r) => (
                    <div key={r.id} className="grid items-end gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                      <Field id={`rn-${r.id}`} label="Name" value={r.name} onChange={(v) => setData("references", d.references.map((x) => (x.id === r.id ? { ...x, name: v } : x)))} />
                      <Field id={`rt-${r.id}`} label="Title" value={r.title} onChange={(v) => setData("references", d.references.map((x) => (x.id === r.id ? { ...x, title: v } : x)))} />
                      <Field id={`rc-${r.id}`} label="Contact" value={r.contact} onChange={(v) => setData("references", d.references.map((x) => (x.id === r.id ? { ...x, contact: v } : x)))} />
                      <Button variant="ghost" size="icon" aria-label="Delete reference" className="text-destructive" onClick={() => setData("references", d.references.filter((x) => x.id !== r.id))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {d.references.length === 0 && <p className="text-xs text-muted-foreground">No references added. Enable the section in the Sections tab to show them.</p>}
                </div>
              </Block>
            </TabsContent>

            {/* DESIGN */}
            <TabsContent value="design" className="mt-4 space-y-4">
              <Block
                title="Template"
                action={
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="press">
                        <LayoutTemplate className="mr-2 h-3.5 w-3.5" /> Browse all 8
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl">
                      <DialogHeader>
                        <DialogTitle>Choose a template</DialogTitle>
                      </DialogHeader>
                      {templateGallery}
                    </DialogContent>
                  </Dialog>
                }
              >
                <Select value={state.style.template} onValueChange={(v) => setStyle("template", v as TemplateId)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TEMPLATES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Block>

              <Block title="Typography & spacing">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Font</Label>
                    <Select value={state.style.font} onValueChange={(v) => setStyle("font", v as ResumeState["style"]["font"])}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FONTS.map((f) => (
                          <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Font size — {state.style.fontSize}pt</Label>
                    <Slider min={8} max={13} step={0.5} value={[state.style.fontSize]} onValueChange={([v]) => setStyle("fontSize", v)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Line height — {state.style.lineHeight}</Label>
                    <Slider min={1.1} max={1.9} step={0.05} value={[state.style.lineHeight]} onValueChange={([v]) => setStyle("lineHeight", v)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Section spacing — {state.style.sectionSpacing}px</Label>
                    <Slider min={6} max={30} step={1} value={[state.style.sectionSpacing]} onValueChange={([v]) => setStyle("sectionSpacing", v)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="accent" className="text-xs">Accent colour</Label>
                    <div className="flex items-center gap-3">
                      <input
                        id="accent"
                        type="color"
                        value={state.style.accent}
                        onChange={(e) => setStyle("accent", e.target.value)}
                        className="h-9 w-14 cursor-pointer rounded-md border bg-background"
                      />
                      <span className="text-xs text-muted-foreground">{state.style.accent}</span>
                    </div>
                  </div>
                </div>
              </Block>
            </TabsContent>

            {/* SECTIONS */}
            <TabsContent value="sections" className="mt-4 space-y-4">
              <Block title="Show, hide and reorder sections">
                <ul className="divide-y">
                  {state.sections.map((s, i) => (
                    <li key={s.key} className="flex items-center gap-3 py-2.5">
                      <Switch
                        checked={s.enabled}
                        aria-label={`Show ${s.label}`}
                        onCheckedChange={(v) =>
                          setState((st) => ({
                            ...st,
                            sections: st.sections.map((x) => (x.key === s.key ? { ...x, enabled: v } : x)),
                          }))
                        }
                      />
                      <Input
                        value={s.label}
                        aria-label={`${s.label} heading`}
                        className="h-8 flex-1"
                        onChange={(e) =>
                          setState((st) => ({
                            ...st,
                            sections: st.sections.map((x) => (x.key === s.key ? { ...x, label: e.target.value } : x)),
                          }))
                        }
                      />
                      <Button variant="ghost" size="icon" aria-label="Move section up" disabled={i === 0} onClick={() => moveSection(i, -1)}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Move section down" disabled={i === state.sections.length - 1} onClick={() => moveSection(i, 1)}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </Block>
            </TabsContent>

            {/* AI */}
            <TabsContent value="ai" className="mt-4 space-y-4">
              <ResponsibleAINotice />
              <Block
                title="ATS Check"
                action={
                  <Button size="sm" className="press" disabled={busy === "ats"} onClick={runAts}>
                    <ShieldCheck className="mr-2 h-3.5 w-3.5" /> Run check
                  </Button>
                }
              >
                {busy === "ats" && <LoadingInline label="Checking..." />}
                {!ats && busy !== "ats" && (
                  <p className="text-sm text-muted-foreground">
                    Your ATS score and improvement suggestions will appear here.
                  </p>
                )}
                {ats && (
                  <div className="space-y-3 animate-fade-in">
                    {ats.score !== null && (
                      <div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-medium">ATS score</span>
                          <span className="text-2xl font-semibold tabular-nums">{ats.score}/100</span>
                        </div>
                        <Progress value={ats.score} className="mt-2" />
                      </div>
                    )}
                    <Markdown>{ats.body}</Markdown>
                    <Button variant="outline" size="sm" className="press" onClick={() => { downloadText("ats-report.txt", ats.body); toast.success("Download complete."); }}>
                      <Download className="mr-2 h-3.5 w-3.5" /> Download report
                    </Button>
                  </div>
                )}
              </Block>

              <Block title="Tailor Resume to Job">
                <div className="space-y-3">
                  {jobs.length > 0 && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Saved jobs</Label>
                      <Select onValueChange={(v) => setJob(jobs.find((j) => j.id === v)?.description ?? "")}>
                        <SelectTrigger><SelectValue placeholder="Select a saved job" /></SelectTrigger>
                        <SelectContent>
                          {jobs.map((j) => (
                            <SelectItem key={j.id} value={j.id}>{j.title || "Untitled job"}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Textarea rows={7} value={job} placeholder="Paste the job description here..." onChange={(e) => setJob(e.target.value)} />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="press" disabled={busy === "tailor"} onClick={runTailor}>
                      <Target className="mr-2 h-3.5 w-3.5" /> Analyze & tailor
                    </Button>
                    <Button variant="outline" size="sm" className="press" onClick={saveJob}>
                      <Save className="mr-2 h-3.5 w-3.5" /> Save job
                    </Button>
                  </div>
                  {busy === "tailor" && <LoadingInline label="Analyzing..." />}
                  {tailor && (
                    <div className="space-y-3 rounded-xl border bg-card/60 p-4 animate-fade-in">
                      <Markdown>{tailor}</Markdown>
                      <Button variant="outline" size="sm" className="press" onClick={() => { downloadText("tailored-resume-suggestions.txt", tailor); toast.success("Download complete."); }}>
                        <Download className="mr-2 h-3.5 w-3.5" /> Download suggestions
                      </Button>
                    </div>
                  )}
                </div>
              </Block>
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT: live preview */}
        <div className="min-w-0">
          <div className="xl:sticky xl:top-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Eye className="h-4 w-4" /> Live preview — A4
            </div>
            <div className="rounded-xl border bg-muted/40 p-3">
              <ResumePreview state={state} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Download PDF exports the resume exactly as previewed, in your selected template, as an A4 file named after you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function swap<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const next = [...arr];
  const j = i + dir;
  if (j < 0 || j >= next.length) return arr;
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export type { SectionKey };
