import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Search,
  Heart,
  MessageCircle,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  Settings,
  Moon,
  Sun,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useNotifications } from "@/lib/queries";
import { cn, getInitials } from "@/lib/utils";
import { Logo } from "./logo";

export function Header() {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/explore?search=${encodeURIComponent(searchValue)}`);
  };

  const dashboardLink =
    profile?.role === "admin" ? "/admin" : profile?.role === "company" ? "/empresa" : "/painel";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled ? "glass border-b border-border shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Logo className="h-8 w-8" />
          <span className="font-display text-xl font-bold tracking-tight">JABOQUE</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Buscar soluções JABOQUE..."
              className="pl-9 bg-muted/50 border-transparent focus-visible:border-input"
            />
          </div>
        </form>

        <nav className="hidden lg:flex items-center gap-1 ml-auto">
          <NavLink to="/encomendas" label="Encomendas" />
          <NavLink to="/explore" label="Explorar" />
          <NavLink to="/galeria" label="Galeria" />
          <NavLink to="/categorias" label="Categorias" />
          <NavLink to="/planos" label="Planos" />
          <NavLink to="/como-funciona" label="Como Funciona" />
        </nav>

        <div className="flex items-center gap-2 ml-auto lg:ml-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="shrink-0">
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          {profile ? (
            <>
              <Button variant="ghost" size="icon" asChild className="hidden sm:flex shrink-0">
                <Link to="/painel/mensagens" className="relative">
                  <MessageCircle className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:flex shrink-0 relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {unreadCount}
                  </span>
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2 shrink-0">
                    <Avatar className="h-8 w-8">
                      {profile.avatar_url ? (
                        <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(profile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
                      {profile.full_name.split(" ")[0]}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="font-display">{profile.full_name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{profile.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(dashboardLink)}>
                    <LayoutDashboard className="h-4 w-4" /> Painel
                  </DropdownMenuItem>                  {profile.role === "client" && (
                    <DropdownMenuItem onClick={() => navigate("/painel/historico")}>
                      <Sparkles className="h-4 w-4" /> Histórico
                    </DropdownMenuItem>
                  )}                  <DropdownMenuItem onClick={() => navigate("/painel/perfil")}>
                    <User className="h-4 w-4" /> Meu Perfil
                  </DropdownMenuItem>
                  {profile.role === "client" && (
                    <DropdownMenuItem onClick={() => navigate("/painel/favoritos")}>
                      <Heart className="h-4 w-4" /> Favoritos
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate("/painel/configuracoes")}>
                    <Settings className="h-4 w-4" /> Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/entrar">Entrar</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/registar">Criar Conta</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-card animate-fade-in">
          <div className="container py-4 space-y-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Buscar soluções JABOQUE..."
                  className="pl-9"
                />
              </div>
            </form>
            <MobileLink to="/encomendas" label="Encomendas" />
            {profile && <MobileLink to={dashboardLink} label="Painel" />}
            {profile && <MobileLink to="/painel/historico" label="Histórico" />}
            <MobileLink to="/explore" label="Explorar" />
            <MobileLink to="/galeria" label="Galeria" />
            <MobileLink to="/categorias" label="Categorias" />
            <MobileLink to="/planos" label="Planos" />
            <MobileLink to="/como-funciona" label="Como Funciona" />
            {!profile && (
              <div className="flex gap-2 pt-2 border-t border-border">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/entrar">Entrar</Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link to="/registar">Criar Conta</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ to, label }: { to: string; label: string }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={cn(
        "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        active ? "text-primary bg-primary/10" : "text-foreground/70 hover:text-foreground hover:bg-muted"
      )}
    >
      {label}
    </Link>
  );
}

function MobileLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="block py-2 px-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
      {label}
    </Link>
  );
}
