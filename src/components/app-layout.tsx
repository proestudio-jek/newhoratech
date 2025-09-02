"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdmin } from "@/contexts/AdminContext";
import {
  CalendarDays,
  Home,
  Menu,
  Music,
  Video,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/calendar", label: "Calendário", icon: CalendarDays },
  { href: "/videos", label: "Vídeos", icon: Video },
];

function MainNav() {
  const pathname = usePathname();
  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

function SiteHeader() {
  const { isAdmin, setIsAdmin } = useAdmin();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:justify-end">
      <div className="md:hidden">
        <SidebarTrigger>
          <Menu />
        </SidebarTrigger>
      </div>
      <div className="flex items-center gap-4">
        <Label htmlFor="admin-mode">Modo Admin</Label>
        <Switch
          id="admin-mode"
          checked={isAdmin}
          onCheckedChange={setIsAdmin}
          aria-label="Toggle admin mode"
        />
      </div>
    </header>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className="border-sidebar-border"
      >
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Music className="size-5" />
            </div>
            <h1 className="font-headline text-2xl font-bold text-sidebar-foreground">
              Semente da Fé
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
