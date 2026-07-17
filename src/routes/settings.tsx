import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { ResponsibleAINotice } from "@/components/responsible-ai";
import { useTheme } from "@/lib/theme";
import { clearHistory } from "@/lib/history";
import { useState } from "react";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [lang, setLang] = useState("en");
  const [notif, setNotif] = useState(true);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader icon={SettingsIcon} title="Settings" description="Customize your WorkWise AI experience." />

      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-base">Theme</Label>
              <p className="text-xs text-muted-foreground">Choose your interface appearance.</p>
            </div>
            <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-base">Language</Label>
              <p className="text-xs text-muted-foreground">Interface language.</p>
            </div>
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-base">Notifications</Label>
              <p className="text-xs text-muted-foreground">Get updates about your activity.</p>
            </div>
            <Switch checked={notif} onCheckedChange={setNotif} />
          </div>

          <div className="flex items-center justify-between gap-4 border-t pt-6">
            <div>
              <Label className="text-base">Clear History</Label>
              <p className="text-xs text-muted-foreground">Permanently delete all saved outputs.</p>
            </div>
            <Button variant="destructive" onClick={() => { clearHistory(); toast.success("History cleared."); }}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Responsible AI</h2>
        <ResponsibleAINotice />
      </div>
    </div>
  );
}