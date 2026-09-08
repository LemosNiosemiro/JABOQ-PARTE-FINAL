import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  PartyPopper,
  Heart,
  Shield,
  Star,
  CheckCircle2,
  Users,
  Calendar,
  Quote,
  Zap,
  Award,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StarRating } from "@/components/ui/star-rating";
import { useCategories } from "@/lib/queries";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const categoryIcons: Record<string, string> = {
  decoracao: "🌸", buffet: "🍽️", dj: "🎧", fotografia: "📸", filmagem: "🎥",
  bolos: "🎂", doces: "🍬", convites: "✉️", espacos: "🏛️", som: "🔊",
  iluminacao: "💡", brinquedos: "🎈", casamentos: "💍", batizados: "👶",
  aniversarios: "🎉", "eventos-corporativos": "💼", formaturas: "🎓", shows: "🎤",
};

export default function LandingPage() {
  const { data: categories } = useCategories();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.pexels.com/photos/10360899/pexels-photo-10360899.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Celebração elegante"
            className="h-full w-full object-cover opacity-20"
          />
        </div>
        <div className="container py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge variant="accent" className="mb-6 animate-fade-in">
              <Sparkles className="h-3 w-3" /> A plataforma nº1 para festas e eventos
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-balance">
              Organize eventos <span className="gradient-text">impecáveis</span> sem complicação
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Conte com a JABOQUE para organizar decoração, buffet, música, fotografia e muito mais.
              Uma equipa acompanha o seu evento do planeamento à celebração.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 max-w-4xl mx-auto"
          >
            <Card className="p-4 shadow-xl">
              <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="O que procura? (DJ, decoração, buffet...)"
                    className="pl-9"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Cidade"
                    className="pl-9 md:w-40"
                  />
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="md:w-48">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" size="lg" className="gap-2">
                  <Search className="h-4 w-4" /> Buscar
                </Button>
              </div>
            </Card>
          </motion.form>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" /> Soluções completas para o seu evento
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" /> Reservas online seguras
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" /> Orçamentos gratuitos
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold">Explore por categoria</h2>
          <p className="mt-2 text-muted-foreground">Encontre exatamente o que precisa para o seu evento</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories?.slice(0, 12).map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Link to={`/explore?category=${cat.id}`}>
                <Card className="p-4 text-center hover:shadow-md hover:border-primary/40 transition-all hover:-translate-y-0.5 cursor-pointer group h-full">
                  <div className="text-3xl mb-2">{categoryIcons[cat.slug] ?? "✨"}</div>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{cat.name}</p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Button variant="outline" asChild>
            <Link to="/categorias">Ver todas as categorias <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* JABOQUE services */}
      <section className="container py-16">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold">Tudo para o seu evento</h2>
            <p className="mt-2 text-muted-foreground">Escolha o que precisa e deixe a proposta com a JABOQUE</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/explore">Ver soluções <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories?.slice(0, 8).map((category, i) => (
            <Link key={category.id} to={`/explore?category=${category.id}`}>
              <Card className="p-6 h-full hover:shadow-md hover:border-primary/40 transition-all">
                <div className="text-3xl mb-4">{categoryIcons[category.slug] ?? "✨"}</div>
                <h3 className="font-display font-semibold">{category.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">Incluído na proposta personalizada da JABOQUE.</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Simples e rápido</Badge>
            <h2 className="font-display text-3xl font-bold">Como funciona a JABOQUE</h2>
            <p className="mt-2 text-muted-foreground">Em 3 passos simples, organize o seu evento</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Search, title: "1. Conte-nos o que precisa", desc: "Registe o seu evento com a data, local, convidados e o resultado que deseja." },
              { icon: Calendar, title: "2. Receba a proposta JABOQUE", desc: "A nossa equipa combina os serviços e prepara uma solução ajustada ao seu evento." },
              { icon: PartyPopper, title: "3. Celebre", desc: "Acompanhe tudo pelo seu painel e desfrute do evento sem coordenar várias equipas." },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Users, value: "1", label: "Equipa JABOQUE" },
            { icon: Calendar, value: "+2.000", label: "Eventos realizados" },
            { icon: Star, value: "4.8", label: "Avaliação média" },
            { icon: MapPin, value: "18", label: "Cidades cobertas" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="font-display text-3xl font-bold gradient-text">{stat.value}</div>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold">Quem usa, recomenda</h2>
            <p className="mt-2 text-muted-foreground">Histórias reais de eventos inesquecíveis</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Mariana Domingos", event: "Casamento", text: "A JABOQUE tratou de toda a organização do meu casamento. Tive uma única equipa para acompanhar cada detalhe.", rating: 5 },
              { name: "Carlos Mendes", event: "Aniversário infantil", text: "Expliquei o que queria e a JABOQUE cuidou do resto. Foi simples, claro e o evento foi um sucesso.", rating: 5 },
              { name: "Sofia Lopes", event: "Evento corporativo", text: "Ter uma equipa responsável por toda a experiência tornou o planeamento muito mais eficiente.", rating: 5 },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="p-6 h-full">
                  <Quote className="h-8 w-8 text-primary/20 mb-3" />
                  <p className="text-sm text-foreground leading-relaxed mb-4">{t.text}</p>
                  <StarRating rating={t.rating} size="sm" />
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.event}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl gradient-primary p-10 lg:p-16 text-center text-primary-foreground"
        >
          <div className="absolute inset-0 -z-10 opacity-20">
            <img
              src="https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1920"
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <Sparkles className="h-10 w-10 mx-auto mb-4 text-accent" />
          <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
            Pronto para começar o seu evento?
          </h2>
          <p className="text-lg text-primary-foreground/90 max-w-xl mx-auto mb-8">
            Crie o seu evento e deixe a JABOQUE preparar uma solução completa para si.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="xl" variant="accent" asChild>
              <Link to="/registar">Criar o meu evento <ArrowRight className="h-5 w-5" /></Link>
            </Button>
            <Button size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link to="/como-funciona">Como funciona</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
