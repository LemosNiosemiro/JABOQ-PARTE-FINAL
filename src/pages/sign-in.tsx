import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/layout/logo";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toaster";

export default function SignInPage() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao entrar", description: error, variant: "destructive" });
    } else {
      toast({ title: "Bem-vindo de volta!", variant: "success" });
      const redirectTo = new URLSearchParams(location.search).get("redirect");
      navigate(redirectTo ?? "/painel");
    }
  };

  const handleDemo = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("demo123456");
    setLoading(true);
    const { error } = await signIn(demoEmail, "demo123456");
    setLoading(false);
    if (error) {
      toast({ title: "Erro", description: error, variant: "destructive" });
    } else {
      toast({ title: "Sessão demo iniciada!", variant: "success" });
      navigate(demoEmail.includes("admin") ? "/admin" : demoEmail.includes("empresa") ? "/empresa" : "/painel");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <Logo className="h-10 w-10" />
            <span className="font-display text-2xl font-bold">JABOQUE</span>
          </Link>
        </div>

        <Card className="p-8 shadow-xl">
          <h1 className="font-display text-2xl font-bold text-center mb-2">Bem-vindo de volta</h1>
          <p className="text-center text-sm text-muted-foreground mb-6">Entre na sua conta para continuar</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"} <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">Contas demo</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => handleDemo("demo.cliente@jaboque.com") }>
              Cliente
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDemo("demo.buffet@jaboque.com") }>
              Empresa
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDemo("demo.admin@jaboque.com") }>
              Admin
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link to="/registar" className="font-semibold text-primary hover:underline">
              Criar conta
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
