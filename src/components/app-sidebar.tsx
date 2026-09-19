import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  FileText,
  CalendarClock,
  BookOpen,
  Bot,
  FileUser,
  History,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import logoAsset from "@/assets/workwise-logo.png.asset.json";

const nav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Smart Email Generator", url: "/email", icon: Mail },
  { title: "Meeting Notes Summarizer", url: "/meetings", icon: FileText },
  { title: "AI Task Planner", url: "/tasks", icon: CalendarClock },
  { title: "AI Research Assistant", url: "/research", icon: BookOpen },
  { title: "AI Chatbot", url: "/chat", icon: Bot },
  { title: "Resume Builder", url: "/resume", icon: FileUser },
] as const;

const secondary = [
  { title: "History", url: "/history", icon: History },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#0A0A0F] shadow-sm transition-transform duration-300 hover:scale-105 hover:rotate-3">
            <img
              src={logoAsset.url}
              alt="WorkWise AI logo"
              className="h-6 w-6 object-contain"
            />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">WorkWise AI</div>
              <div className="truncate text-[11px] text-muted-foreground">
                Productivity Assistant
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="group transition-all duration-200 hover:translate-x-0.5 data-[active=true]:shadow-sm"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu>
          {secondary.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                tooltip={item.title}
                className="group transition-all duration-200 hover:translate-x-0.5"
              >
                <Link to={item.url}>
                  <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}