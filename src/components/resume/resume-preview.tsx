import { useEffect, useRef, useState } from "react";
import type { ResumeState } from "@/lib/resume";
import { ResumeDocument } from "./resume-document";

const A4_WIDTH_PX = 794; // 210mm at 96dpi

export function ResumePreview({ state }: { state: ResumeState }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / A4_WIDTH_PX));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="w-full overflow-hidden">
      <div
        id="resume-print"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: A4_WIDTH_PX,
          height: scale < 1 ? undefined : undefined,
        }}
        className="shadow-[0_18px_50px_-20px_rgba(15,23,42,0.45)] ring-1 ring-black/10"
      >
        <ResumeDocument state={state} />
      </div>
      {/* keeps layout height correct while the page is visually scaled */}
      <div style={{ height: 0 }} />
    </div>
  );
}
