import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Calendar,
  PartyPopper,
  Heart,
  Shield,
  Star,
  MessageCircle,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HowItWorksPage() {
  return (
    <div className="container py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <Badge variant="secondary" className="mb-4">
          Guia completo
        </Badge>

        <h1 className="font-display text-4xl font-bold">
          Como funciona a JABOQUE
        </h1>

        <p className="mt-3 text-muted-foreground">
          A plataforma que simplifica a organização de eventos. Encontre
          fornecedores, compare preços e celebre.
        </p>
      </div>

      {/* Steps for clients */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="font-display text-2xl font-bold mb-8 text-center">
          Para clientes
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Search,
              title: "Pesquise fornecedores",
              desc: "Use filtros por categoria, cidade, preço e avaliação para encontrar o fornecedor perfeito.",
            },
            {
              icon: MessageCircle,
              title: "Solicite orçamento",
              desc: "Entre em contacto direto com os fornecedores, tire dúvidas e receba propostas personalizadas.",
            },
            {
              icon: PartyPopper,
              title: "Celebre o seu evento",
              desc: "Confirme a reserva, acompanhe os detalhes e desfrute do seu evento sem preocupações.",
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <Card className="p-6 text-center h-full">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <step.icon className="h-6 w-6" />
                </div>

                <div className="text-sm font-bold text-primary mb-2">
                  Passo {i + 1}
                </div>

                <h3 className="font-display font-semibold mb-2">
                  {step.title}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {step.desc}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Steps for companies */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="font-display text-2xl font-bold mb-8 text-center">
          Para empresas
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: FileText,
              title: "Cadastre sua empresa",
              desc: "Crie o perfil da sua empresa, adicione fotos, serviços e pacotes para atrair clientes.",
            },
            {
              icon: MessageCircle,
              title: "Receba pedidos",
              desc: "Receba solicitações de orçamento de clientes interessados e responda diretamente.",
            },
            {
              icon: Star,
              title: "Cresça com avaliações",
              desc: "Receba avaliações dos seus clientes e destaque-se na plataforma com o selo de verificação.",
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <Card className="p-6 text-center h-full">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <step.icon className="h-6 w-6" />
                </div>

                <div className="text-sm font-bold text-accent mb-2">
                  Passo {i + 1}
                </div>

                <h3 className="font-display font-semibold mb-2">
                  {step.title}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {step.desc}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto">
        <h2 className="font-display text-2xl font-bold mb-8 text-center">
          Porquê a JABOQUE?
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              icon: Shield,
              title: "Segurança garantida",
              desc: "Fornecedores verificados e pagamentos seguros.",
            },
            {
              icon: Star,
              title: "Avaliações reais",
              desc: "Feedback de clientes reais para tomar a melhor decisão.",
            },
            {
              icon: Heart,
              title: "Favoritos",
              desc: "Salve os seus fornecedores preferidos para comparar depois.",
            },
            {
              icon: Calendar,
              title: "Gestão de eventos",
              desc: "Organize todos os seus eventos num só painel.",
            },
          ].map((feat, i) => (
            <Card
              key={i}
              className="p-5 flex items-start gap-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <feat.icon className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-semibold mb-1">
                  {feat.title}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {feat.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="text-center mt-12">
        <Button size="xl" asChild>
          <Link to="/explore">
            Começar agora
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}