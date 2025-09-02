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
import { useAuth } from "@/contexts/AuthContext";
import {
  CalendarDays,
  Home,
  Menu,
  Music,
  Video,
  LogIn,
  LogOut,
} from "lucide-react";
import { Button } from "./ui/button";

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/calendar", label: "Calendário", icon: CalendarDays },
  { href: "/videos", label: "Vídeos", icon: Video },
];

function MainNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

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
      <SidebarMenuItem>
        {user ? (
          <SidebarMenuButton onClick={logout} tooltip="Sair">
            <LogOut />
            <span>Sair</span>
          </SidebarMenuButton>
        ) : (
          <SidebarMenuButton asChild isActive={pathname === "/login"} tooltip="Entrar">
            <Link href="/login">
              <LogIn />
              <span>Entrar</span>
            </Link>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function SiteHeader() {
  const { isAdmin, setIsAdmin } = useAdmin();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Hide header on auth pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger>
          <Menu />
        </SidebarTrigger>
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Music className="size-5" />
          </div>
          <h1 className="hidden font-headline text-2xl font-bold text-primary sm:block">
            Semente da Fé
          </h1>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <Label htmlFor="admin-mode">Modo Admin</Label>
            <Switch
              id="admin-mode"
              checked={isAdmin}
              onCheckedChange={setIsAdmin}
              aria-label="Toggle admin mode"
            />
          </>
        )}
        {user ? (
          <Button variant="ghost" size="sm" onClick={logout}>
            Sair
          </Button>
        ) : (
          <Button asChild size="sm">
            <Link href="/login">Entrar</Link>
          </Button>
        )}
      </div>
    </header>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <SiteHeader />
        {isAuthPage ? (
          <main className="flex-1">{children}</main>
        ) : (
          <>
            <Sidebar
              variant="sidebar"
              collapsible="offcanvas"
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
            <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          </>
        )}
      </div>
    </SidebarProvider>
  );
}
