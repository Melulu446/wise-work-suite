import { Mail, Linkedin, Globe } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="animate-fade-in border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-6 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">
            Built by Melusi Nkosi
          </p>
          <p className="text-xs text-muted-foreground">
            WorkWise AI — AI Workplace Productivity Assistant
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
          <a
            href="mailto:melusinkosi446@gmail.com"
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
          >
            <Mail className="h-3.5 w-3.5" />
            melusinkosi446@gmail.com
          </a>
          <a
            href="https://www.linkedin.com/in/melusi-nkosi-154723254"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
          >
            <Linkedin className="h-3.5 w-3.5" />
            linkedin.com/in/melusi-nkosi-154723254
          </a>
          <a
            href="https://melusi-one.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
          >
            <Globe className="h-3.5 w-3.5" />
            Portfolio
          </a>
        </div>
      </div>
    </footer>
  );
}
