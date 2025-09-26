
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  Facebook,
  Twitter,
  Instagram,
  Users,
  Mic,
  Music2,
} from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/calendar", label: "Calendário", icon: CalendarDays },
  { href: "/videos", label: "Vídeos", icon: Video },
];

const communityItems = [
    { href: "/semente-da-fe", label: "Semente da Fé", icon: Music2 },
    { href: "/louvores-de-siao", label: "Louvores de Sião", icon: Users },
    { href: "/grande-coral", label: "Grande Coral", icon: Mic },
]

function MainNav({ isMobile }: { isMobile: boolean }) {
  const pathname = usePathname();
  
  const navLinks = (
    <>
      {navItems.map((item) => (
        <Button
          key={item.href}
          asChild
          variant={pathname === item.href ? (isMobile ? 'secondary' : 'link') : "ghost"}
          className={cn(
            "justify-start",
            !isMobile && "text-primary-foreground hover:bg-transparent hover:text-primary-foreground/80"
          )}
        >
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Link>
        </Button>
      ))}
      
      {isMobile ? (
         <>
            <p className="px-4 text-sm font-medium text-muted-foreground pt-4 border-t">Comunidades</p>
            {communityItems.map((item) => (
                 <Button
                    key={item.href}
                    asChild
                    variant={pathname === item.href ? 'secondary' : "ghost"}
                    className="justify-start"
                    >
                    <Link href={item.href}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                    </Link>
                </Button>
            ))}
         </>
      ) : (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-primary-foreground hover:bg-transparent hover:text-primary-foreground/80">
                   <Users className="mr-2 h-4 w-4"/>
                   Comunidades
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {communityItems.map((item) => (
                     <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href}>
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );

  return (
    <nav className={cn(
        "items-center gap-2",
        isMobile ? "flex flex-col w-full" : "hidden md:flex"
    )}>
       {navLinks}
    </nav>
  );
}

function SiteHeader() {
  const { isAdmin, setIsAdmin } = useAdmin();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);


  // Hide header on auth pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }
  
  const handleAdminToggle = (checked: boolean) => {
    if (!user) {
      router.push('/login');
    } else {
      setIsAdmin(checked);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
             <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Music className="size-5" />
             </div>
            <span className="inline-block font-bold font-headline text-primary text-2xl">PROMUSIC</span>
          </Link>
          <MainNav isMobile={false} />
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="hidden items-center space-x-2 md:flex">
            <Label htmlFor="admin-mode" className="text-sm font-medium">Modo Admin</Label>
            <Switch
              id="admin-mode"
              checked={isAdmin}
              onCheckedChange={handleAdminToggle}
              aria-label="Toggle admin mode"
            />
          </div>
          <div className="hidden md:flex items-center gap-2">
            {user ? (
                <Button variant="ghost" size="sm" onClick={logout}>
                    Sair
                </Button>
            ) : (
                <>
                <Button asChild variant="ghost" size="sm">
                    <Link href="/login">Entrar</Link>
                </Button>
                <Button asChild size="sm">
                    <Link href="/signup">Cadastre-se</Link>
                </Button>
                </>
            )}
          </div>
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        className="md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="pr-0 pt-12">
                   <SheetHeader>
                     <SheetTitle className="sr-only">Menu Principal</SheetTitle>
                   </SheetHeader>
                  <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                    <div className="flex flex-col space-y-3">
                       <MainNav isMobile={true} />
                       <div className="flex flex-col space-y-2 pt-6 border-t">
                        <div className="flex items-center space-x-2 px-4">
                            <Label htmlFor="admin-mode-mobile">Modo Admin</Label>
                            <Switch
                            id="admin-mode-mobile"
                            checked={isAdmin}
                            onCheckedChange={handleAdminToggle}
                            aria-label="Toggle admin mode"
                            />
                        </div>
                        {user ? (
                           <>
                            <Button variant="ghost" onClick={() => { logout(); setIsMobileNavOpen(false);}}>
                                <LogOut className="mr-2 h-4 w-4" /> Sair
                            </Button>
                           </>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Button asChild onClick={() => setIsMobileNavOpen(false)}>
                                    <Link href="/login">
                                    <LogIn className="mr-2 h-4 w-4" /> Entrar
                                    </Link>
                                </Button>
                                 <Button asChild variant="outline" onClick={() => setIsMobileNavOpen(false)}>
                                    <Link href="/signup">
                                     Cadastre-se
                                    </Link>
                                </Button>
                            </div>
                        )}
                       </div>
                    </div>
                  </div>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  const pathname = usePathname();
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <footer className="w-full border-t bg-background">
      <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Music className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-lg text-primary">PROMUSIC</span>
        </div>
        <nav className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm font-medium">
          <Link href="#" className="text-foreground hover:text-primary transition-colors">
            Sobre Nós
          </Link>
          <Link href="#" className="text-foreground hover:text-primary transition-colors">
            Contato
          </Link>
          <Link href="#" className="text-foreground hover:text-primary transition-colors">
            Política de Privacidade
          </Link>
          <Link href="#" className="text-foreground hover:text-primary transition-colors">
            Termos de Serviço
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="#" aria-label="Facebook">
            <Facebook className="h-5 w-5 text-foreground hover:text-primary transition-colors" />
          </Link>
          <Link href="#" aria-label="Twitter">
            <Twitter className="h-5 w-5 text-foreground hover:text-primary transition-colors" />
          </Link>
          <Link href="#" aria-label="Instagram">
            <Instagram className="h-5 w-5 text-foreground hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
      <div className="border-t bg-background/50">
        <div className="container py-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} PROMUSIC. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SiteHeader />
        <div className="flex-1">
        {isAuthPage ? (
          <main>{children}</main>
        ) : (
          <main className="container p-4 sm:p-6 lg:p-8">{children}</main>
        )}
        </div>
      <SiteFooter />
    </div>
  );
}
