import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, MapPin, SlidersHorizontal, X, Grid3x3, List, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompanyCard } from "@/components/company-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanies, useCategories, type CompanyFilters } from "@/lib/queries";
import { formatCurrency, cn } from "@/lib/utils";

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");

  const filters: CompanyFilters = {
    search: searchParams.get("search") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    minRating: searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined,
    sort: (searchParams.get("sort") as CompanyFilters["sort"]) ?? "featured",
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
  };

  const { data, isLoading } = useCompanies(filters);
  const { data: categories } = useCategories();

  const updateFilter = (key: string, value: string | undefined) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === undefined || value === "") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    if (key !== "page") newParams.delete("page");
    setSearchParams(newParams);
  };

  const clearFilters = () => setSearchParams({});

  const hasActiveFilters = ["search", "category", "city", "minRating"].some((k) => searchParams.has(k));

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Explorar fornecedores</h1>
        <p className="mt-1 text-muted-foreground">
          {data?.total ?? 0} empresas disponíveis
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            defaultValue={filters.search}
            key={filters.search}
            placeholder="Buscar por nome ou descrição..."
            className="pl-9"
            onChange={(e) => updateFilter("search", e.target.value || undefined)}
          />
        </div>
        <div className="relative w-40">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            defaultValue={filters.city}
            key={filters.city}
            placeholder="Cidade"
            className="pl-9"
            onChange={(e) => updateFilter("city", e.target.value || undefined)}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters((v) => !v)}
          className="lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filtros
        </Button>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar Filters */}
        <aside className={cn("space-y-5", showFilters ? "block" : "hidden lg:block")}>
          <Card className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold">Filtros</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7">
                  Limpar tudo
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select
                value={filters.category ?? ""}
                onValueChange={(v) => updateFilter("category", v || undefined)}
              >
                <SelectTrigger><SelectValue placeholder="Todas as categorias" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Avaliação mínima</label>
              <div className="flex gap-2">
                {[4, 3, 2].map((r) => (
                  <Button
                    key={r}
                    variant={filters.minRating === r ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilter("minRating", String(r))}
                    className="flex-1"
                  >
                    {r}+ ★
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ordenar por</label>
              <Select
                value={filters.sort ?? "featured"}
                onValueChange={(v) => updateFilter("sort", v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Destaque</SelectItem>
                  <SelectItem value="rating">Melhor avaliados</SelectItem>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                  <SelectItem value="price_asc">Preço: menor primeiro</SelectItem>
                  <SelectItem value="price_desc">Preço: maior primeiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </aside>

        {/* Results */}
        <div>
          {/* Active filter badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.category && (
                <Badge variant="secondary" className="gap-1">
                  {categories?.find((c) => c.id === filters.category)?.name}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("category", undefined)} />
                </Badge>
              )}
              {filters.city && (
                <Badge variant="secondary" className="gap-1">
                  {filters.city}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("city", undefined)} />
                </Badge>
              )}
              {filters.minRating && (
                <Badge variant="secondary" className="gap-1">
                  {filters.minRating}+ estrelas
                  <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("minRating", undefined)} />
                </Badge>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          ) : data && data.companies.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {data.companies.map((company, i) => (
                  <CompanyCard key={company.id} company={company} index={i} />
                ))}
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={(filters.page ?? 1) <= 1}
                    onClick={() => updateFilter("page", String((filters.page ?? 1) - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground px-3">
                    Página {filters.page ?? 1} de {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={(filters.page ?? 1) >= data.totalPages}
                    onClick={() => updateFilter("page", String((filters.page ?? 1) + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={Search}
              title="Nenhuma empresa encontrada"
              description="Tente ajustar os filtros ou buscar por outros termos."
              action={
                <Button onClick={clearFilters} variant="outline">
                  Limpar filtros
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
