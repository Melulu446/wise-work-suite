export type Id = string;

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);

export type ExperienceItem = {
  id: Id;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  bullets: string;
};

export type EducationItem = {
  id: Id;
  degree: string;
  school: string;
  location: string;
  start: string;
  end: string;
  details: string;
};

export type ProjectItem = { id: Id; name: string; link: string; description: string };
export type CertItem = { id: Id; name: string; issuer: string; year: string };
export type ReferenceItem = { id: Id; name: string; title: string; contact: string };

export type ResumeData = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string;
  certifications: CertItem[];
  projects: ProjectItem[];
  languages: string;
  references: ReferenceItem[];
};

export type SectionKey =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "certifications"
  | "projects"
  | "languages"
  | "references";

export type SectionConfig = { key: SectionKey; label: string; enabled: boolean };

export const SECTION_LABELS: Record<SectionKey, string> = {
  summary: "Professional Summary",
  experience: "Work Experience",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
  projects: "Projects",
  languages: "Languages",
  references: "References",
};

export const DEFAULT_SECTIONS: SectionConfig[] = (
  [
    "summary",
    "experience",
    "education",
    "skills",
    "certifications",
    "projects",
    "languages",
    "references",
  ] as SectionKey[]
).map((key) => ({ key, label: SECTION_LABELS[key], enabled: key !== "references" }));

export type TemplateId =
  | "modern"
  | "ats"
  | "executive"
  | "minimal"
  | "tech"
  | "creative"
  | "graduate"
  | "twocolumn";

export const TEMPLATES: { id: TemplateId; name: string; desc: string }[] = [
  { id: "modern", name: "Modern Professional", desc: "Accent header, clean structure" },
  { id: "ats", name: "ATS Classic", desc: "Plain, parser-friendly layout" },
  { id: "executive", name: "Executive", desc: "Serif, formal and authoritative" },
  { id: "minimal", name: "Minimal", desc: "Lots of whitespace, quiet typography" },
  { id: "tech", name: "Tech", desc: "Monospace accents, skill chips" },
  { id: "creative", name: "Creative", desc: "Bold colour band and cards" },
  { id: "graduate", name: "Graduate", desc: "Education-first for early careers" },
  { id: "twocolumn", name: "Professional Two-Column", desc: "Sidebar with contact and skills" },
];

export const FONTS = [
  { id: "inter", name: "Sans (Inter)", stack: "Inter, 'Helvetica Neue', Arial, sans-serif" },
  { id: "georgia", name: "Serif (Georgia)", stack: "Georgia, 'Times New Roman', serif" },
  { id: "times", name: "Times", stack: "'Times New Roman', Times, serif" },
  { id: "arial", name: "Arial", stack: "Arial, Helvetica, sans-serif" },
  { id: "mono", name: "Mono", stack: "'JetBrains Mono', 'Courier New', monospace" },
] as const;

export type ResumeStyle = {
  template: TemplateId;
  font: (typeof FONTS)[number]["id"];
  fontSize: number;
  lineHeight: number;
  sectionSpacing: number;
  accent: string;
};

export const DEFAULT_STYLE: ResumeStyle = {
  template: "modern",
  font: "inter",
  fontSize: 10.5,
  lineHeight: 1.45,
  sectionSpacing: 14,
  accent: "#2563eb",
};

export type ResumeState = {
  data: ResumeData;
  sections: SectionConfig[];
  style: ResumeStyle;
};

export const newExperience = (): ExperienceItem => ({
  id: uid(),
  role: "",
  company: "",
  location: "",
  start: "",
  end: "",
  bullets: "",
});
export const newEducation = (): EducationItem => ({
  id: uid(),
  degree: "",
  school: "",
  location: "",
  start: "",
  end: "",
  details: "",
});
export const newProject = (): ProjectItem => ({ id: uid(), name: "", link: "", description: "" });
export const newCert = (): CertItem => ({ id: uid(), name: "", issuer: "", year: "" });
export const newReference = (): ReferenceItem => ({ id: uid(), name: "", title: "", contact: "" });

export const emptyResumeData = (): ResumeData => ({
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  portfolio: "",
  summary: "",
  experience: [newExperience()],
  education: [newEducation()],
  skills: "",
  certifications: [],
  projects: [],
  languages: "",
  references: [],
});

const KEY = "workwise-resume";

export function loadResume(): ResumeState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ResumeState;
    if (!parsed?.data) return null;
    return {
      data: { ...emptyResumeData(), ...parsed.data },
      sections: parsed.sections?.length ? parsed.sections : DEFAULT_SECTIONS,
      style: { ...DEFAULT_STYLE, ...parsed.style },
    };
  } catch {
    return null;
  }
}

export function saveResume(state: ResumeState) {
  window.localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("workwise-resume-updated"));
}

export function splitList(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function splitBullets(value: string): string[] {
  return value
    .split(/\n+/)
    .map((s) => s.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

/** Plain-text version used for AI context and text export. */
export function resumeToText(state: ResumeState): string {
  const d = state.data;
  const lines: string[] = [d.fullName, d.title, [d.email, d.phone, d.location].filter(Boolean).join(" | ")];
  if (d.linkedin) lines.push(`LinkedIn: ${d.linkedin}`);
  if (d.portfolio) lines.push(`Portfolio: ${d.portfolio}`);
  for (const s of state.sections.filter((x) => x.enabled)) {
    lines.push("", s.label.toUpperCase());
    if (s.key === "summary") lines.push(d.summary);
    if (s.key === "experience")
      d.experience.forEach((e) => {
        lines.push(`${e.role} — ${e.company} (${e.start} - ${e.end}) ${e.location}`);
        splitBullets(e.bullets).forEach((b) => lines.push(`- ${b}`));
      });
    if (s.key === "education")
      d.education.forEach((e) => lines.push(`${e.degree} — ${e.school} (${e.start} - ${e.end}) ${e.details}`));
    if (s.key === "skills") lines.push(splitList(d.skills).join(", "));
    if (s.key === "certifications")
      d.certifications.forEach((c) => lines.push(`${c.name} — ${c.issuer} ${c.year}`));
    if (s.key === "projects")
      d.projects.forEach((p) => lines.push(`${p.name} ${p.link}\n${p.description}`));
    if (s.key === "languages") lines.push(splitList(d.languages).join(", "));
    if (s.key === "references")
      d.references.forEach((r) => lines.push(`${r.name} — ${r.title} — ${r.contact}`));
  }
  return lines.filter((l) => l !== undefined).join("\n");
}
