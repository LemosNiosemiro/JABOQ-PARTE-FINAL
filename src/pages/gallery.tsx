import { useMemo, useState } from "react";
import { Image, Play, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type MediaType = "photo" | "video";

interface GalleryItem {
  id: number;
  title: string;
  event: string;
  location: string;
  type: MediaType;
  image: string;
  date: string;
  duration?: string;
  video?: string;
}

const galleryItems: GalleryItem[] = [
  { id: 1, title: "Memórias JABOQUE 01", event: "Momentos do nosso evento", location: "Luanda", type: "photo", image: "/gallery/photo-1.jpeg", date: "Setembro de 2026" },
  { id: 2, title: "Memórias JABOQUE 02", event: "Momentos do nosso evento", location: "Luanda", type: "photo", image: "/gallery/photo-2.jpeg", date: "Setembro de 2026" },
  { id: 3, title: "Memórias JABOQUE 03", event: "Momentos do nosso evento", location: "Luanda", type: "photo", image: "/gallery/photo-3.jpeg", date: "Setembro de 2026" },
  { id: 4, title: "Memórias JABOQUE 04", event: "Momentos do nosso evento", location: "Luanda", type: "photo", image: "/gallery/photo-4.jpeg", date: "Setembro de 2026" },
  { id: 5, title: "Memórias JABOQUE 05", event: "Momentos do nosso evento", location: "Luanda", type: "photo", image: "/gallery/photo-5.jpeg", date: "Setembro de 2026" },
  { id: 6, title: "Memórias JABOQUE 06", event: "Momentos do nosso evento", location: "Luanda", type: "photo", image: "/gallery/photo-6.jpeg", date: "Setembro de 2026" },
  { id: 7, title: "Memórias JABOQUE 07", event: "Momentos do nosso evento", location: "Luanda", type: "photo", image: "/gallery/photo-7.jpeg", date: "Setembro de 2026" },
  { id: 8, title: "Memórias JABOQUE 08", event: "Momentos do nosso evento", location: "Luanda", type: "photo", image: "/gallery/photo-8.jpeg", date: "Setembro de 2026" },
  { id: 9, title: "Memórias JABOQUE 09", event: "Momentos do nosso evento", location: "Luanda", type: "photo", image: "/gallery/photo-9.jpeg", date: "Setembro de 2026" },
  { id: 10, title: "Memórias JABOQUE 10", event: "Momentos do nosso evento", location: "Luanda", type: "photo", image: "/gallery/photo-10.jpeg", date: "Setembro de 2026" },
  { id: 11, title: "Memórias JABOQUE 11", event: "Momentos do nosso evento", location: "Luanda", type: "photo", image: "/gallery/photo-11.jpeg", date: "Setembro de 2026" },
  { id: 12, title: "Vídeo JABOQUE 01", event: "Momentos do nosso evento", location: "Luanda", type: "video", image: "/gallery/photo-1.jpeg", date: "Setembro de 2026", video: "/gallery/video-1.mp4" },
  { id: 13, title: "Vídeo JABOQUE 02", event: "Momentos do nosso evento", location: "Luanda", type: "video", image: "/gallery/photo-2.jpeg", date: "Setembro de 2026", video: "/gallery/video-2.mp4" },
  { id: 14, title: "Vídeo JABOQUE 03", event: "Momentos do nosso evento", location: "Luanda", type: "video", image: "/gallery/photo-3.jpeg", date: "Setembro de 2026", video: "/gallery/video-3.mp4" },
  { id: 15, title: "Vídeo JABOQUE 04", event: "Momentos do nosso evento", location: "Luanda", type: "video", image: "/gallery/photo-4.jpeg", date: "Setembro de 2026", video: "/gallery/video-4.mp4" },
  { id: 16, title: "Vídeo JABOQUE 05", event: "Momentos do nosso evento", location: "Luanda", type: "video", image: "/gallery/photo-5.jpeg", date: "Setembro de 2026", video: "/gallery/video-5.mp4" },
  { id: 17, title: "Vídeo JABOQUE 06", event: "Momentos do nosso evento", location: "Luanda", type: "video", image: "/gallery/photo-6.jpeg", date: "Setembro de 2026", video: "/gallery/video-6.mp4" },
];

const filters: { label: string; value: "all" | MediaType }[] = [
  { label: "Tudo", value: "all" },
  { label: "Fotografias", value: "photo" },
  { label: "Vídeos", value: "video" },
];

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]["value"]>("all");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const visibleItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return galleryItems.filter((item) => {
      const matchesType = activeFilter === "all" || item.type === activeFilter;
      const matchesSearch = !normalizedSearch || `${item.title} ${item.event} ${item.location}`.toLowerCase().includes(normalizedSearch);
      return matchesType && matchesSearch;
    });
  }, [activeFilter, search]);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b border-border bg-muted/30">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,hsl(var(--accent)/0.18),transparent_32%),radial-gradient(circle_at_bottom_left,hsl(var(--primary)/0.12),transparent_36%)]" />
        <div className="container py-16 md:py-24">
          <Badge variant="accent" className="mb-5 gap-1.5"><Image className="h-3.5 w-3.5" /> Memórias JABOQUE</Badge>
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Cada evento tem uma história.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">Um olhar sobre as celebrações, pessoas e momentos que tornam a comunidade JABOQUE especial.</p>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span><strong className="font-display text-2xl text-foreground">{galleryItems.length}</strong> registos publicados</span>
            <span><strong className="font-display text-2xl text-foreground">{galleryItems.filter((item) => item.type === "video").length}</strong> histórias em vídeo</span>
            <span><strong className="font-display text-2xl text-foreground">2026</strong> em movimento</span>
          </div>
        </div>
      </section>

      <section className="container py-10 md:py-14">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {filters.map((filter) => (
              <Button key={filter.value} variant={activeFilter === filter.value ? "default" : "outline"} size="sm" onClick={() => setActiveFilter(filter.value)} className="shrink-0">
                {filter.value === "photo" && <Image className="h-4 w-4" />}
                {filter.value === "video" && <Play className="h-4 w-4" />}
                {filter.label}
              </Button>
            ))}
          </div>
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Procurar um evento..." className="pl-9" />
          </div>
        </div>

        {visibleItems.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item, index) => (
              <button key={item.id} type="button" onClick={() => setSelectedItem(item)} className={cn("group relative overflow-hidden rounded-2xl bg-card text-left shadow-sm ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", index === 0 && "sm:col-span-2 lg:col-span-2")}>
                <div className={cn("relative aspect-[4/3] overflow-hidden", index === 0 && "lg:aspect-[8/5]")}>
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <Badge className="gap-1 border-0 bg-background/85 text-foreground backdrop-blur-sm">{item.type === "video" ? <Play className="h-3 w-3 fill-current" /> : <Image className="h-3 w-3" />}{item.type === "video" ? "Vídeo" : "Fotografia"}</Badge>
                    {item.duration && <span className="rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">{item.duration}</span>}
                  </div>
                  <div className="absolute inset-x-4 bottom-4 text-white">
                    <p className="text-xs font-medium uppercase tracking-wider text-white/75">{item.date} · {item.location}</p>
                    <h2 className="mt-1 font-display text-xl font-bold">{item.title}</h2>
                    <p className="mt-1 text-sm text-white/80">{item.event}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-20 text-center">
            <Search className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <h2 className="mt-4 font-display text-xl font-semibold">Nenhum registo encontrado</h2>
            <p className="mt-2 text-sm text-muted-foreground">Experimente outro termo ou altere o filtro de media.</p>
          </div>
        )}
      </section>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={selectedItem.title} onClick={() => setSelectedItem(null)}>
          <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-card shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <Button variant="ghost" size="icon" className="absolute right-3 top-3 z-10 bg-black/50 text-white hover:bg-black/70 hover:text-white" onClick={() => setSelectedItem(null)} aria-label="Fechar galeria"><X className="h-5 w-5" /></Button>
            {selectedItem.type === "video" && selectedItem.video ? (
              <video controls poster={selectedItem.image} className="max-h-[72vh] w-full bg-black object-contain" src={selectedItem.video}>
                O seu navegador não suporta a reprodução de vídeo.
              </video>
            ) : (
              <img src={selectedItem.image} alt={selectedItem.title} className="max-h-[72vh] w-full object-cover" />
            )}
            <div className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{selectedItem.date} · {selectedItem.location}</p>
              <h2 className="mt-1 font-display text-2xl font-bold">{selectedItem.title}</h2>
              <p className="mt-1 text-muted-foreground">{selectedItem.event}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}