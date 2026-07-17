import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { downloadText } from "@/lib/history";

export function AIActions({ text, filename }: { text: string; filename: string }) {
  return (
    <div className="flex flex-wrap gap-2 animate-fade-in">
      <Button
        variant="outline"
        size="sm"
        className="press transition-all duration-200 hover:border-primary/40 hover:text-primary"
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          toast.success("Copied successfully!");
        }}
      >
        <Copy className="mr-2 h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110" /> Copy
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="press transition-all duration-200 hover:border-primary/40 hover:text-primary"
        onClick={() => {
          downloadText(filename, text);
          toast.success("Download complete.");
        }}
      >
        <Download className="mr-2 h-3.5 w-3.5" /> Download
      </Button>
    </div>
  );
}