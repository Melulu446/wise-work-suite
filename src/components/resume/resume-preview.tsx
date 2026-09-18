import { useEffect, useRef, useState } from "react";
import type { ResumeState } from "@/lib/resume";
import { ResumeDocument } from "./resume-document";

const A4_WIDTH_PX = 794; // 210mm at 96dpi

export function ResumePreview({ state }: { state: ResumeState }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(1123);

  useEffect(() => {
    const wrap = wrapRef.current;
    const page = pageRef.current;
    if (!wrap || !page) return;
    const update = () => {
      setScale(Math.min(1, wrap.clientWidth / A4_WIDTH_PX));
      setHeight(page.offsetHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    ro.observe(page);
    return () => ro.disconnect();
  }, [state]);

  return (
    <div ref={wrapRef} className="w-full overflow-hidden" style={{ height: height * scale }}>
      <div
        id="resume-print"
        ref={pageRef}
        style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: A4_WIDTH_PX }}
        className="shadow-[0_18px_50px_-20px_rgba(15,23,42,0.45)] ring-1 ring-black/10"
      >
        <ResumeDocument state={state} />
      </div>
    </div>
  );
}
