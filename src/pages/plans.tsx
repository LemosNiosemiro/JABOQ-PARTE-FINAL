import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { formatCurrency, cn } from "@/lib/utils";

const plans = [
  {
    name: "Grátis",
    description: "Para empresas que estão a começar",
    price: 0,
    billing_cycle: "monthly" as const,
    features: [
      "Listagem no marketplace",
      "Até 3 serviços cadastrados",
      "Resposta a pedidos de orçamento",
      "Perfil básico",
    ],
    is_featured: false,
  },
  {
    name: "Premium",
    description: "Para empresas em crescimento",
    price: 5000,
    billing_cycle: "monthly" as const,
    features: [
      "Tudo do plano Grátis",
      "Serviços ilimitados",
      "Destaque nas buscas",
      "Página personalizada",
      "Galeria de fotos ilimitada",
      "Estatísticas avançadas",
      "Selo de verificação",
    ],
    is_featured: true,
  },
  {
    name: "Pro",
    description: "Para empresas estabelecidas",
    price: 15000,
    billing_cycle: "monthly" as const,
    features: [
      "Tudo do plano Premium",
      "Posição prioritária nas buscas",
      "Banner patrocinado",
      "Acesso a leads premium",
      "Relatórios financeiros",
      "Gestor de conta dedicado",
      "API de integração",
    ],
    is_featured: false,
  },
];

export default function PlansPage() {
  const { profile } = useAuth();

  return (
    <div className="container py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <Badge variant="accent" className="mb-4">
          <Sparkles className="h-3 w-3" /> Planos para empresas
        </Badge>
        <h1 className="font-display text-4xl font-bold">Escolha o plano ideal</h1>
        <p className="mt-3 text-muted-foreground">
          Comece gratuitamente e faça upgrade quando precisar de mais recursos.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={cn(plan.is_featured && "md:-mt-4")}
          >
            <Card className={cn(
              "p-8 h-full flex flex-col relative overflow-hidden",
              plan.is_featured && "border-primary shadow-xl ring-2 ring-primary/20"
            )}>
              {plan.is_featured && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-bl-lg">
                    MAIS POPULAR
                  </div>
                </div>
              )}
              <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              <div className="mt-4 mb-6">
                <span className="font-display text-4xl font-bold">{formatCurrency(plan.price)}</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 text-success shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.is_featured ? "default" : "outline"}
                size="lg"
                className="w-full"
                asChild
              >
                <Link to={profile ? "/registar?tipo=empresa" : "/registar?tipo=empresa"}>
                  {plan.price === 0 ? "Começar grátis" : "Assinar plano"} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-10">
        <p className="text-sm text-muted-foreground">
          Todos os planos incluem suporte por email. Cancele quando quiser.
        </p>
      </div>
    </div>
  );
}
