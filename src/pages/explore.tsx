import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useCategories } from "@/lib/queries";

const categoryIcons: Record<string, string> = {
  decoracao: "🌸", buffet: "🍽️", dj: "🎧", fotografia: "📸", filmagem: "🎥",
  bolos: "🎂", doces: "🍬", convites: "✉️", espacos: "🏛️", som: "🔊",
  iluminacao: "💡", brinquedos: "🎈", casamentos: "💍", batizados: "👶",
  aniversarios: "🎉", "eventos-corporativos": "💼", formaturas: "🎓", shows: "🎤",
};

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categories } = useCategories();
  const search = searchParams.get("search") ?? "";
  const selectedCategory = searchParams.get("category");

  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();
    return (categories ?? []).filter((category) => {
      if (selectedCategory && category.id !== selectedCategory) return false;
      if (!normalizedSearch) return true;
      return `${category.name} ${category.description ?? ""}`.toLowerCase().includes(normalizedSearch);
    });
  }, [categories, search, selectedCategory]);

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Soluções JABOQUE</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold mt-2">Tudo para o seu evento</h1>
        <p className="mt-3 text-muted-foreground">
          Escolha o que gostaria de incluir e conte-nos os detalhes. A equipa JABOQUE prepara uma proposta completa.
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-10 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => {
            const nextParams = new URLSearchParams(searchParams);
            if (event.target.value) nextParams.set("search", event.target.value);
            else nextParams.delete("search");
            setSearchParams(nextParams);
          }}
          placeholder="Procure uma solução, como decoração ou buffet"
          className="pl-9"
        />
      </div>

      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="p-6 flex flex-col h-full hover:border-primary/40 transition-colors">
              <div className="text-4xl mb-4">{categoryIcons[category.slug] ?? "✨"}</div>
              <h2 className="font-display font-semibold">{category.name}</h2>
              <p className="text-sm text-muted-foreground mt-2 flex-1">
                {category.description ?? "Serviço coordenado pela equipa JABOQUE para o seu evento."}
              </p>
              <Button asChild variant="link" className="justify-start px-0 mt-4 gap-1">
                <Link to={`/registar?categoria=${category.id}`}>Incluir no meu evento <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="Nenhuma solução encontrada"
          description="Experimente procurar outra categoria ou crie o evento para falar com a equipa JABOQUE."
          action={<Button asChild><Link to="/registar">Criar o meu evento</Link></Button>}
        />
      )}

      <div className="mt-12 text-center">
        <Button size="lg" asChild>
          <Link to="/registar">Criar o meu evento <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}