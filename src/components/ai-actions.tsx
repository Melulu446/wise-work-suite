import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { downloadText } from "@/lib/history";

export function AIActions({ text, filename }: { text: string; filename: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          toast.success("Copied successfully!");
        }}
      >
        <Copy className="mr-2 h-3.5 w-3.5" /> Copy
      </Button>
      <Button
        variant="outline"
        size="sm"
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