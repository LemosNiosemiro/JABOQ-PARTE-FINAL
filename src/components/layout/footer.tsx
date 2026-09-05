import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, Phone, MapPin, Sparkles } from "lucide-react";
import { Logo } from "./logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-20">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Logo className="h-8 w-8" />
              <span className="font-display text-xl font-bold">JABOQUE</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              A plataforma completa para organizar e personalizar festas e eventos. Encontre os melhores
              Pacotes num só lugar.
            </p>
            <div className="flex gap-3">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sm">Plataforma</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/explore" className="hover:text-primary transition-colors">Explorar</Link></li>
              <li><Link to="/categorias" className="hover:text-primary transition-colors">Categorias</Link></li>
              <li><Link to="/planos" className="hover:text-primary transition-colors">Planos</Link></li>
              <li><Link to="/como-funciona" className="hover:text-primary transition-colors">Como Funciona</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sm">Para Empresas</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/registar?tipo=empresa" className="hover:text-primary transition-colors">Cadastrar Empresa</Link></li>
              <li><Link to="/planos" className="hover:text-primary transition-colors">Planos Premium</Link></li>
              <li><Link to="/empresa" className="hover:text-primary transition-colors">Painel da Empresa</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sm">Newsletter</h4>
            <p className="text-sm text-muted-foreground">Receba novidades e dicas para os seus eventos.</p>
            <div className="flex gap-2">
              <Input placeholder="Seu email" type="email" className="h-9 text-sm" />
              <Button size="sm" className="shrink-0">OK</Button>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} JABOQUE. Todos os direitos reservados.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
            <a href="#" className="hover:text-primary transition-colors">LGPD</a>
            <Link to="/programador" className="font-semibold hover:text-primary transition-colors">Programador</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
