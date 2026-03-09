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
import { Button } from "./ui/button";
import React, { useState, useEffect } from "react";
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

function MainNav({ isMobile, onItemClick }: { isMobile: boolean; onItemClick?: () => void }) {
  const pathname = usePathname();
  
  const navLinks = (
    <>
      {navItems.map((item) => (
        <Button
          key={item.href}
          asChild
          variant={pathname === item.href ? (isMobile ? 'secondary' : 'ghost') : "ghost"}
          className={cn(
            "justify-start font-medium",
            isMobile ? "text-foreground" : "text-white hover:bg-white/20"
          )}
          onClick={onItemClick}
        >
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Link>
        </Button>
      ))}
      
      {isMobile ? (
         <>
            <p className="px-4 text-sm font-medium text-muted-foreground pt-4 border-t">Conjuntos</p>
            {communityItems.map((item) => (
                 <Button
                    key={item.href}
                    asChild
                    variant={pathname === item.href ? 'secondary' : "ghost"}
                    className="justify-start"
                    onClick={onItemClick}
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
                <Button variant="ghost" className="text-white hover:bg-white/20 font-medium">
                   <Users className="mr-2 h-4 w-4"/>
                   Conjuntos
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
  const { user, logout, isAdmin, setIsAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);


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

  const closeMobileNav = () => setIsMobileNavOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 shadow-md">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
             <div className="flex size-9 items-center justify-center rounded-lg bg-white text-blue-600">
                <Music className="size-5" />
             </div>
            <span className="inline-block font-bold font-headline text-white text-2xl">PROMUSIC</span>
          </Link>
          <MainNav isMobile={false} />
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden items-center space-x-2 md:flex border-l border-white/20 pl-4">
            <Label htmlFor="admin-mode" className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Modo Admin</Label>
            <Switch
              id="admin-mode"
              checked={isAdmin}
              onCheckedChange={handleAdminToggle}
              className="data-[state=checked]:bg-white data-[state=unchecked]:bg-blue-400"
            />
          </div>
          <div className="hidden md:flex items-center gap-2">
            {user ? (
                <Button variant="outline" size="sm" onClick={logout} className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent">
                    Sair
                </Button>
            ) : (
                <>
                <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <Link href="/login">Entrar</Link>
                </Button>
                <Button asChild size="sm" className="bg-white text-blue-600 hover:bg-white/90">
                    <Link href="/signup">Cadastre-se</Link>
                </Button>
                </>
            )}
          </div>
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        className="md:hidden text-white"
                    >
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Abrir Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="pr-0 pt-12">
                   <SheetHeader>
                     <SheetTitle className="sr-only">Menu Principal</SheetTitle>
                   </SheetHeader>
                  <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                    <div className="flex flex-col space-y-3">
                       <MainNav isMobile={true} onItemClick={closeMobileNav} />
                       <div className="flex flex-col space-y-2 pt-6 border-t mt-6">
                        <div className="flex items-center justify-between px-4 mb-4">
                            <Label htmlFor="admin-mode-mobile" className="text-sm">Modo Admin</Label>
                            <Switch
                            id="admin-mode-mobile"
                            checked={isAdmin}
                            onCheckedChange={handleAdminToggle}
                            />
                        </div>
                        {user ? (
                           <>
                            <Button variant="ghost" onClick={() => { logout(); closeMobileNav(); }} className="justify-start">
                                <LogOut className="mr-2 h-4 w-4" /> Sair
                            </Button>
                           </>
                        ) : (
                            <div className="flex flex-col gap-2 pr-6">
                                <Button asChild onClick={closeMobileNav}>
                                    <Link href="/login">
                                    <LogIn className="mr-2 h-4 w-4" /> Entrar
                                    </Link>
                                </Button>
                                 <Button asChild variant="outline" onClick={closeMobileNav}>
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
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <footer className="w-full border-t bg-background mt-auto">
      <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Music className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-lg text-primary">PROMUSIC</span>
        </div>
        <nav className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm font-medium">
          <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
            Sobre Nós
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
            Contato
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
            Privacidade
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
            Termos
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="#" aria-label="Facebook">
            <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
          </Link>
          <Link href="#" aria-label="Twitter">
            <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
          </Link>
          <Link href="#" aria-label="Instagram">
            <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
      <div className="border-t bg-muted/30">
        <div className="container py-4 text-center text-xs text-muted-foreground">
          © {year} PROMUSIC. Todos os direitos reservados.
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
          <main className="container py-6 sm:py-8 lg:py-10">{children}</main>
        )}
        </div>
      <SiteFooter />
    </div>
  );
}