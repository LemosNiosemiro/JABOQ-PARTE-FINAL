import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Search,
  Sparkles,
  PartyPopper,
  Utensils,
  Camera,
  Music,
  Cake,
  Mail,
  Building2,
  Volume2,
  Lightbulb,
  Gamepad2,
  Heart,
  Baby,
  Briefcase,
  GraduationCap,
  Mic2,
  Truck,
  Gift,
  Palette,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/lib/queries";

const categoryIcons: Record<string, React.ElementType> = {
  decoracao: Palette,
  buffet: Utensils,
  dj: Music,
  fotografia: Camera,
  filmagem: Camera,
  bolos: Cake,
  doces: Cake,
  convites: Mail,
  espacos: Building2,
  som: Volume2,
  iluminacao: Lightbulb,
  brinquedos: Gamepad2,
  casamentos: Heart,
  batizados: Baby,
  aniversarios: PartyPopper,
  "eventos-corporativos": Briefcase,
  formaturas: GraduationCap,
  shows: Mic2,
  transporte: Truck,
  brindes: Gift,
};

const fallbackCategories = [
  {
    id: "decoracao",
    slug: "decoracao",
    name: "Decoração",
    description:
      "Decorações, balões, painéis e temas para transformar o seu evento.",
  },
  {
    id: "buffet",
    slug: "buffet",
    name: "Alimentação",
    description:
      "Encontre opções de comida e serviços de catering para o seu evento.",
  },
  {
    id: "entretenimento",
    slug: "entretenimento",
    name: "Entretenimento",
    description:
      "Música, animação, jogos e atrações para tornar o evento inesquecível.",
  },
  {
    id: "fotografia",
    slug: "fotografia",
    name: "Fotografia",
    description:
      "Profissionais para registrar os melhores momentos do seu evento.",
  },
  {
    id: "bolos",
    slug: "bolos",
    name: "Bolos e Doces",
    description:
      "Bolos, doces, sobremesas e opções personalizadas para a sua festa.",
  },
  {
    id: "espacos",
    slug: "espacos",
    name: "Espaços",
    description:
      "Encontre espaços preparados para diferentes tipos de eventos.",
  },
  {
    id: "som",
    slug: "som",
    name: "Som e Música",
    description:
      "Equipamentos de som, DJs e soluções musicais para o seu evento.",
  },
  {
    id: "iluminacao",
    slug: "iluminacao",
    name: "Iluminação",
    description:
      "Iluminação profissional para criar o ambiente perfeito.",
  },
  {
    id: "brinquedos",
    slug: "brinquedos",
    name: "Brinquedos",
    description:
      "Diversão para crianças com brinquedos e atrações especiais.",
  },
  {
    id: "transporte",
    slug: "transporte",
    name: "Transporte",
    description:
      "Soluções de transporte e logística para facilitar o seu evento.",
  },
  {
    id: "brindes",
    slug: "brindes",
    name: "Brindes",
    description:
      "Lembranças e produtos personalizados para os seus convidados.",
  },
  {
    id: "convites",
    slug: "convites",
    name: "Convites",
    description:
      "Convites personalizados para anunciar o seu evento com estilo.",
  },
];

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();

  const [search, setSearch] = useState("");

  const availableCategories =
    categories && categories.length > 0 ? categories : fallbackCategories;

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return availableCategories;

    return availableCategories.filter((category) => {
      const name = category.name?.toLowerCase() ?? "";
      const description = category.description?.toLowerCase() ?? "";
      const slug = category.slug?.toLowerCase() ?? "";

      return (
        name.includes(query) ||
        description.includes(query) ||
        slug.includes(query)
      );
    });
  }, [availableCategories, search]);

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

        <div className="container relative py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-7 w-7" />
            </div>

            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Encontre tudo para o seu{" "}
              <span className="text-primary">evento</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Explore produtos, serviços e soluções para criar um evento
              inesquecível. Escolha uma categoria e encontre o que precisa.
            </p>

            {/* SEARCH */}
            <div className="relative mx-auto mt-8 max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="O que você procura para o seu evento?"
                className="h-14 rounded-2xl border-border bg-background pl-12 pr-12 text-base shadow-sm"
              />

              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Limpar pesquisa"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
              <span>Experimente:</span>

              {["Decoração", "Buffet", "Fotografia", "Bolos"].map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setSearch(suggestion)}
                    className="rounded-full border bg-background px-3 py-1.5 transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {suggestion}
                  </button>
                ),
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container py-12 md:py-16">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-primary">
              Explore o JABOQUE
            </p>

            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              {search
                ? `Resultados para "${search}"`
                : "Explore por categoria"}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {search
                ? `${filteredCategories.length} categoria(s) encontrada(s)`
                : "Encontre rapidamente o que precisa para organizar o seu evento."}
            </p>
          </div>

          {!search && (
            <div className="rounded-full border bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
              {availableCategories.length} categorias
            </div>
          )}
        </div>

        {/* LOADING */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="h-52 animate-pulse rounded-2xl border bg-muted/40"
              />
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!isLoading && filteredCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-dashed p-12 text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>

            <h3 className="mt-5 font-display text-xl font-semibold">
              Nenhuma categoria encontrada
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Não encontramos nenhuma categoria correspondente à sua pesquisa.
              Tente procurar por outro termo.
            </p>

            <button
              type="button"
              onClick={clearSearch}
              className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Ver todas as categorias
            </button>
          </motion.div>
        )}

        {/* GRID */}
        {!isLoading && filteredCategories.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {filteredCategories.map((category, index) => {
              const Icon =
                categoryIcons[category.slug?.toLowerCase()] ?? Sparkles;

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(index * 0.04, 0.4),
                  }}
                >
                  <Link
                    to={`/explore?category=${category.id}`}
                    className="group block h-full"
                  >
                    <Card className="relative flex h-full min-h-[210px] flex-col overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl sm:p-6">
                      {/* DECORATIVE */}
                      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />

                      {/* ICON */}
                      <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-7 w-7" />
                      </div>

                      {/* CONTENT */}
                      <div className="flex-1">
                        <h3 className="font-display text-lg font-semibold transition-colors group-hover:text-primary">
                          {category.name}
                        </h3>

                        {category.description ? (
                          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                            {category.description}
                          </p>
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground">
                            Explore produtos e serviços desta categoria.
                          </p>
                        )}
                      </div>

                      {/* ACTION */}
                      <div className="mt-5 flex items-center justify-between border-t pt-4">
                        <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
                          Explorar
                        </span>

                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* EVENT CTA */}
      {!search && (
        <section className="container pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-primary px-6 py-10 text-primary-foreground sm:px-10 md:py-14"
          >
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-black/10 blur-2xl" />

            <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium opacity-90">
                  <PartyPopper className="h-5 w-5" />
                  JABOQUE
                </div>

                <h2 className="font-display text-2xl font-bold sm:text-3xl">
                  Não sabe por onde começar?
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 opacity-90 sm:text-base">
                  Explore todas as opções disponíveis e encontre produtos e
                  serviços para montar o evento que você imaginou.
                </p>
              </div>

              <Link
                to="/explore"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-background px-5 py-3 text-sm font-semibold text-foreground transition-transform hover:scale-105"
              >
                Explorar tudo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </section>
      )}
    </main>
  );
}