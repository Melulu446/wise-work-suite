import type { CSSProperties, ReactNode } from "react";
import {
  FONTS,
  splitBullets,
  splitList,
  type ResumeState,
  type SectionKey,
  type TemplateId,
} from "@/lib/resume";

type Variant = {
  container?: CSSProperties;
  fontOverride?: string;
  header: (p: { state: ResumeState; accent: string }) => ReactNode;
  sectionTitle: (p: { label: string; accent: string }) => ReactNode;
  chips?: boolean;
  bulletChar?: string;
  order?: (keys: SectionKey[]) => SectionKey[];
};

const contactBits = (s: ResumeState) =>
  [s.data.email, s.data.phone, s.data.location, s.data.linkedin, s.data.portfolio].filter(Boolean);

function Row({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
      <div>{left}</div>
      <div style={{ whiteSpace: "nowrap", fontSize: "0.92em", opacity: 0.75 }}>{right}</div>
    </div>
  );
}

const VARIANTS: Record<TemplateId, Variant> = {
  modern: {
    header: ({ state, accent }) => (
      <div style={{ borderBottom: `3px solid ${accent}`, paddingBottom: 10, marginBottom: 14 }}>
        <div style={{ fontSize: "2em", fontWeight: 700, letterSpacing: "-0.02em" }}>
          {state.data.fullName || "Your Name"}
        </div>
        {state.data.title && (
          <div style={{ color: accent, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.85em", marginTop: 3 }}>
            {state.data.title}
          </div>
        )}
        <div style={{ marginTop: 6, fontSize: "0.9em", opacity: 0.8 }}>{contactBits(state).join("  •  ")}</div>
      </div>
    ),
    sectionTitle: ({ label, accent }) => (
      <div style={{ color: accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.82em", borderBottom: "1px solid #e5e7eb", paddingBottom: 3, marginBottom: 6 }}>
        {label}
      </div>
    ),
  },
  ats: {
    fontOverride: "Arial, Helvetica, sans-serif",
    header: ({ state }) => (
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: "1.7em", fontWeight: 700 }}>{state.data.fullName || "Your Name"}</div>
        {state.data.title && <div style={{ fontWeight: 600 }}>{state.data.title}</div>}
        <div style={{ fontSize: "0.92em" }}>{contactBits(state).join(" | ")}</div>
      </div>
    ),
    sectionTitle: ({ label }) => (
      <div style={{ fontWeight: 700, textTransform: "uppercase", borderBottom: "1px solid #111", paddingBottom: 2, marginBottom: 6 }}>
        {label}
      </div>
    ),
    bulletChar: "-",
  },
  executive: {
    fontOverride: "Georgia, 'Times New Roman', serif",
    header: ({ state }) => (
      <div style={{ textAlign: "center", borderBottom: "3px double #111", paddingBottom: 10, marginBottom: 14 }}>
        <div style={{ fontSize: "2.1em", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {state.data.fullName || "Your Name"}
        </div>
        {state.data.title && <div style={{ fontStyle: "italic", marginTop: 4, fontSize: "1.05em" }}>{state.data.title}</div>}
        <div style={{ marginTop: 6, fontSize: "0.9em" }}>{contactBits(state).join("  ·  ")}</div>
      </div>
    ),
    sectionTitle: ({ label }) => (
      <div style={{ textAlign: "center", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: "0.82em", borderBottom: "1px solid #111", paddingBottom: 4, marginBottom: 8 }}>
        {label}
      </div>
    ),
  },
  minimal: {
    header: ({ state }) => (
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: "1.9em", fontWeight: 300, letterSpacing: "0.02em" }}>
          {state.data.fullName || "Your Name"}
        </div>
        {state.data.title && <div style={{ opacity: 0.7, marginTop: 2 }}>{state.data.title}</div>}
        <div style={{ marginTop: 10, fontSize: "0.88em", opacity: 0.65 }}>{contactBits(state).join("   ")}</div>
      </div>
    ),
    sectionTitle: ({ label }) => (
      <div style={{ textTransform: "uppercase", letterSpacing: "0.22em", fontSize: "0.72em", opacity: 0.55, marginBottom: 8 }}>
        {label}
      </div>
    ),
    bulletChar: "–",
  },
  tech: {
    header: ({ state, accent }) => (
      <div style={{ marginBottom: 14, display: "flex", gap: 12, alignItems: "flex-end", justifyContent: "space-between", borderBottom: `1px dashed ${accent}`, paddingBottom: 10 }}>
        <div>
          <div style={{ fontSize: "1.8em", fontWeight: 700 }}>{state.data.fullName || "Your Name"}</div>
          {state.data.title && (
            <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", color: accent, fontSize: "0.9em" }}>
              {"<"}
              {state.data.title}
              {" />"}
            </div>
          )}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: "0.78em", textAlign: "right", lineHeight: 1.6 }}>
          {contactBits(state).map((c) => (
            <div key={c}>{c}</div>
          ))}
        </div>
      </div>
    ),
    sectionTitle: ({ label, accent }) => (
      <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", color: accent, fontSize: "0.8em", marginBottom: 6 }}>
        {"// "}
        {label.toLowerCase()}
      </div>
    ),
    chips: true,
    bulletChar: "▸",
  },
  creative: {
    header: ({ state, accent }) => (
      <div style={{ background: accent, color: "#fff", padding: "18px 20px", margin: "-16mm -16mm 16px", borderRadius: 0 }}>
        <div style={{ fontSize: "2.1em", fontWeight: 800, letterSpacing: "-0.02em" }}>
          {state.data.fullName || "Your Name"}
        </div>
        {state.data.title && <div style={{ opacity: 0.9, fontWeight: 600, marginTop: 2 }}>{state.data.title}</div>}
        <div style={{ marginTop: 8, fontSize: "0.85em", opacity: 0.9 }}>{contactBits(state).join("  •  ")}</div>
      </div>
    ),
    sectionTitle: ({ label, accent }) => (
      <div style={{ display: "inline-block", background: `${accent}1a`, color: accent, fontWeight: 700, padding: "3px 10px", borderRadius: 999, fontSize: "0.78em", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
        {label}
      </div>
    ),
    chips: true,
  },
  graduate: {
    header: ({ state, accent }) => (
      <div style={{ background: `${accent}12`, borderLeft: `4px solid ${accent}`, padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ fontSize: "1.85em", fontWeight: 700 }}>{state.data.fullName || "Your Name"}</div>
        {state.data.title && <div style={{ color: accent, fontWeight: 600 }}>{state.data.title}</div>}
        <div style={{ marginTop: 6, fontSize: "0.88em", opacity: 0.8 }}>{contactBits(state).join("  •  ")}</div>
      </div>
    ),
    sectionTitle: ({ label, accent }) => (
      <div style={{ fontWeight: 700, fontSize: "0.85em", textTransform: "uppercase", letterSpacing: "0.08em", color: "#111", borderBottom: `2px solid ${accent}33`, paddingBottom: 3, marginBottom: 6 }}>
        {label}
      </div>
    ),
    order: (keys) => {
      const rest = keys.filter((k) => k !== "education" && k !== "summary");
      return [
        ...(keys.includes("summary") ? (["summary"] as SectionKey[]) : []),
        ...(keys.includes("education") ? (["education"] as SectionKey[]) : []),
        ...rest,
      ];
    },
  },
  twocolumn: {
    header: () => null,
    sectionTitle: ({ label, accent }) => (
      <div style={{ color: accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.78em", marginBottom: 6 }}>
        {label}
      </div>
    ),
  },
};

function SectionBody({
  k,
  state,
  accent,
  chips,
  bulletChar,
}: {
  k: SectionKey;
  state: ResumeState;
  accent: string;
  chips?: boolean;
  bulletChar: string;
}) {
  const d = state.data;
  const bulletList = (text: string) => {
    const items = splitBullets(text);
    if (!items.length) return null;
    return (
      <ul style={{ margin: "4px 0 0", paddingLeft: 14, listStyle: "none" }}>
        {items.map((b, i) => (
          <li key={i} style={{ position: "relative", marginBottom: 2 }}>
            <span style={{ position: "absolute", left: -12, color: accent }}>{bulletChar}</span>
            {b}
          </li>
        ))}
      </ul>
    );
  };

  switch (k) {
    case "summary":
      return <p style={{ margin: 0 }}>{d.summary}</p>;
    case "experience":
      return (
        <div style={{ display: "grid", gap: 8 }}>
          {d.experience.map((e) => (
            <div key={e.id}>
              <Row
                left={
                  <>
                    <span style={{ fontWeight: 700 }}>{e.role}</span>
                    {e.company && <span> — {e.company}</span>}
                    {e.location && <span style={{ opacity: 0.7 }}> · {e.location}</span>}
                  </>
                }
                right={[e.start, e.end].filter(Boolean).join(" – ")}
              />
              {bulletList(e.bullets)}
            </div>
          ))}
        </div>
      );
    case "education":
      return (
        <div style={{ display: "grid", gap: 6 }}>
          {d.education.map((e) => (
            <div key={e.id}>
              <Row
                left={
                  <>
                    <span style={{ fontWeight: 700 }}>{e.degree}</span>
                    {e.school && <span> — {e.school}</span>}
                    {e.location && <span style={{ opacity: 0.7 }}> · {e.location}</span>}
                  </>
                }
                right={[e.start, e.end].filter(Boolean).join(" – ")}
              />
              {e.details && <div style={{ fontSize: "0.95em", opacity: 0.85 }}>{e.details}</div>}
            </div>
          ))}
        </div>
      );
    case "skills":
    case "languages": {
      const items = splitList(k === "skills" ? d.skills : d.languages);
      if (!items.length) return null;
      if (chips)
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {items.map((s) => (
              <span
                key={s}
                style={{
                  border: `1px solid ${accent}55`,
                  background: `${accent}0f`,
                  borderRadius: 4,
                  padding: "1px 7px",
                  fontSize: "0.88em",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        );
      return <div>{items.join(" • ")}</div>;
    }
    case "certifications":
      return (
        <div style={{ display: "grid", gap: 3 }}>
          {d.certifications.map((c) => (
            <Row
              key={c.id}
              left={
                <>
                  <span style={{ fontWeight: 600 }}>{c.name}</span>
                  {c.issuer && <span style={{ opacity: 0.8 }}> — {c.issuer}</span>}
                </>
              }
              right={c.year}
            />
          ))}
        </div>
      );
    case "projects":
      return (
        <div style={{ display: "grid", gap: 6 }}>
          {d.projects.map((p) => (
            <div key={p.id}>
              <Row left={<span style={{ fontWeight: 700 }}>{p.name}</span>} right={p.link} />
              {p.description && <div style={{ fontSize: "0.95em" }}>{p.description}</div>}
            </div>
          ))}
        </div>
      );
    case "references":
      return (
        <div style={{ display: "grid", gap: 3 }}>
          {d.references.map((r) => (
            <div key={r.id}>
              <span style={{ fontWeight: 600 }}>{r.name}</span>
              {r.title && <span style={{ opacity: 0.8 }}> — {r.title}</span>}
              {r.contact && <span style={{ opacity: 0.8 }}> — {r.contact}</span>}
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

function hasContent(k: SectionKey, state: ResumeState) {
  const d = state.data;
  switch (k) {
    case "summary":
      return d.summary.trim() !== "";
    case "experience":
      return d.experience.some((e) => e.role || e.company || e.bullets);
    case "education":
      return d.education.some((e) => e.degree || e.school);
    case "skills":
      return splitList(d.skills).length > 0;
    case "languages":
      return splitList(d.languages).length > 0;
    case "certifications":
      return d.certifications.some((c) => c.name);
    case "projects":
      return d.projects.some((p) => p.name);
    case "references":
      return d.references.some((r) => r.name);
  }
}

const SIDEBAR_KEYS: SectionKey[] = ["skills", "languages", "certifications"];

export function ResumeDocument({ state }: { state: ResumeState }) {
  const { style } = state;
  const variant = VARIANTS[style.template];
  const accent = style.accent;
  const fontStack = variant.fontOverride ?? FONTS.find((f) => f.id === style.font)?.stack ?? FONTS[0].stack;

  let keys = state.sections.filter((s) => s.enabled && hasContent(s.key, state)).map((s) => s.key);
  if (variant.order) keys = variant.order(keys);
  const labelOf = (k: SectionKey) => state.sections.find((s) => s.key === k)?.label ?? k;

  const base: CSSProperties = {
    fontFamily: fontStack,
    fontSize: `${style.fontSize}pt`,
    lineHeight: style.lineHeight,
    color: "#111827",
    background: "#ffffff",
    padding: "16mm",
    boxSizing: "border-box",
    width: "210mm",
    minHeight: "297mm",
    overflow: "hidden",
  };

  const block = (k: SectionKey) => (
    <div key={k} style={{ marginBottom: style.sectionSpacing, breakInside: "avoid" }}>
      {variant.sectionTitle({ label: labelOf(k), accent })}
      <SectionBody
        k={k}
        state={state}
        accent={accent}
        chips={variant.chips}
        bulletChar={variant.bulletChar ?? "•"}
      />
    </div>
  );

  if (style.template === "twocolumn") {
    const sidebar = keys.filter((k) => SIDEBAR_KEYS.includes(k));
    const main = keys.filter((k) => !SIDEBAR_KEYS.includes(k));
    return (
      <div style={{ ...base, padding: 0, display: "flex" }}>
        <aside
          style={{
            width: "62mm",
            background: "#f3f4f6",
            borderRight: `3px solid ${accent}`,
            padding: "16mm 8mm",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: "1.5em", fontWeight: 700, lineHeight: 1.15 }}>
            {state.data.fullName || "Your Name"}
          </div>
          {state.data.title && <div style={{ color: accent, fontWeight: 600, marginTop: 2 }}>{state.data.title}</div>}
          <div style={{ marginTop: 12, fontSize: "0.88em", display: "grid", gap: 3, wordBreak: "break-word" }}>
            {contactBits(state).map((c) => (
              <div key={c}>{c}</div>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>{sidebar.map(block)}</div>
        </aside>
        <main style={{ flex: 1, padding: "16mm 12mm", boxSizing: "border-box", minWidth: 0 }}>
          {main.map(block)}
        </main>
      </div>
    );
  }

  return (
    <div style={base}>
      {variant.header({ state, accent })}
      {keys.map(block)}
    </div>
  );
}
