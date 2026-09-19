import { createElement } from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { ResumeDocument } from "@/components/resume/resume-document";
import type { ResumeState } from "@/lib/resume";

const A4_WIDTH_PX = 794; // 210mm at 96dpi
const PAGE_W_MM = 210;
const PAGE_H_MM = 297;

export function resumePdfFilename(state: ResumeState): string {
  const name = state.data.fullName.trim();
  return name ? `${name} - Resume.pdf` : "Resume.pdf";
}

/** Renders the current resume state off-screen and exports it as a paged A4 PDF. */
export async function exportResumePdf(state: ResumeState): Promise<void> {
  // Off-screen host at true A4 pixel width so the capture matches the preview.
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.width = `${A4_WIDTH_PX}px`;
  host.style.background = "#ffffff";
  host.style.zIndex = "-1";
  document.body.appendChild(host);

  const root = createRoot(host);
  try {
    root.render(createElement(ResumeDocument, { state }));
    // Let React flush and fonts settle before capture.
    await new Promise((r) => setTimeout(r, 80));
    await document.fonts.ready;

    const target = host.firstElementChild as HTMLElement | null;
    if (!target) throw new Error("Nothing to export");

    const canvas = await html2canvas(target, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      width: A4_WIDTH_PX,
      windowWidth: A4_WIDTH_PX,
    });

    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pxPerMm = canvas.width / PAGE_W_MM;
    const pageHeightPx = Math.floor(PAGE_H_MM * pxPerMm);

    let offset = 0;
    let page = 0;
    while (offset < canvas.height) {
      const sliceHeight = Math.min(pageHeightPx, canvas.height - offset);
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = sliceHeight;
      const ctx = slice.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, offset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

      if (page > 0) pdf.addPage();
      pdf.addImage(
        slice.toDataURL("image/jpeg", 0.95),
        "JPEG",
        0,
        0,
        PAGE_W_MM,
        sliceHeight / pxPerMm,
      );
      offset += sliceHeight;
      page += 1;
    }

    pdf.save(resumePdfFilename(state));
  } finally {
    root.unmount();
    host.remove();
  }
}
