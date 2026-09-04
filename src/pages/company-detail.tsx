import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Phone, Mail, Globe, Instagram, Facebook, MessageCircle,
  Heart, BadgeCheck, Star, Clock, ChevronRight, Share2, Calendar,
  Package as PackageIcon, Camera as CameraIcon, Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toaster";
import {
  useCompanyBySlug, useCompanyPhotos, useCompanyServices, useCompanyPackages,
  useCompanyReviews, useToggleFavorite, useIsFavorited, useClientEvents,
  useCreateBooking, useCreateReview,
} from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate, timeAgo, getInitials, cn } from "@/lib/utils";

export default function CompanyDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const { toast } = useToast();
  const { data: company, isLoading } = useCompanyBySlug(slug);
  const { data: photos } = useCompanyPhotos(company?.id);
  const { data: services } = useCompanyServices(company?.id);
  const { data: packages } = useCompanyPackages(company?.id);
  const { data: reviews } = useCompanyReviews(company?.id);
  const toggleFav = useToggleFavorite();
  const { data: isFavorited } = useIsFavorited(company?.id);
  const { data: events } = useClientEvents();
  const createBooking = useCreateBooking();
  const createReview = useCreateReview();

  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const handleFavorite = () => {
    if (!session) {
      toast({ title: "Faça login para favoritar", variant: "destructive" });
      navigate("/entrar");
      return;
    }
    toggleFav.mutate(company!.id, {
      onSuccess: (res) => toast({ title: res.favorited ? "Adicionado aos favoritos" : "Removido dos favoritos" }),
    });
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast({ title: "Faça login para solicitar orçamento", variant: "destructive" });
      navigate("/entrar");
      return;
    }
    const service = services?.find((s) => s.id === selectedService);
    const event = events?.find((ev) => ev.id === selectedEvent);
    if (!event) {
      toast({ title: "Selecione um evento", variant: "destructive" });
      return;
    }
    createBooking.mutate({
      event_id: event.id,
      company_id: company!.id,
      service_id: selectedService || null,
      event_date: event.event_date,
      price: service?.price ?? 0,
      notes: bookingNotes || null,
    }, {
      onSuccess: () => {
        toast({ title: "Orçamento solicitado com sucesso!", variant: "success" });
        setBookingOpen(false);
        setBookingNotes("");
        navigate("/painel/pedidos");
      },
      onError: (err) => toast({ title: "Erro ao solicitar orçamento", description: err.message, variant: "destructive" }),
    });
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast({ title: "Faça login para avaliar", variant: "destructive" });
      navigate("/entrar");
      return;
    }
    createReview.mutate({
      company_id: company!.id,
      rating: reviewRating,
      comment: reviewComment,
    }, {
      onSuccess: () => {
        toast({ title: "Avaliação publicada!", variant: "success" });
        setReviewComment("");
        setReviewRating(5);
      },
      onError: (err) => toast({ title: "Erro ao publicar avaliação", description: err.message, variant: "destructive" }),
    });
  };

  const handleContact = () => {
    if (!session) {
      toast({ title: "Faça login para enviar mensagem", variant: "destructive" });
      navigate("/entrar");
      return;
    }
    if (company?.owner_id) {
      navigate(`/painel/mensagens?to=${company.owner_id}&company=${company.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 space-y-4">
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-12 w-64" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container py-16">
        <EmptyState
          title="Empresa não encontrada"
          description="A empresa que procura pode ter sido removida ou não existe."
          action={<Button asChild><Link to="/explore">Voltar a explorar</Link></Button>}
        />
      </div>
    );
  }

  const galleryPhotos = [company.cover_url, ...(photos ?? []).map((p) => p.url)].filter(Boolean) as string[];

  return (
    <div>
      {/* Cover */}
      <div className="relative h-72 lg:h-96 overflow-hidden bg-muted">
        <img
          src={company.cover_url ?? galleryPhotos[0]}
          alt={company.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="ghost" size="icon" className="bg-black/30 backdrop-blur text-white hover:bg-black/50" onClick={() => navigator.share?.({ title: company.name }).catch(() => {})}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="bg-black/30 backdrop-blur text-white hover:bg-black/50" onClick={handleFavorite}>
            <Heart className={cn("h-4 w-4", isFavorited && "fill-destructive text-destructive")} />
          </Button>
        </div>
      </div>

      <div className="container">
        {/* Header info */}
        <div className="flex flex-col sm:flex-row gap-4 -mt-16 relative z-10">
          <div className="shrink-0">
            {company.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="h-28 w-28 rounded-2xl object-cover border-4 border-card shadow-lg" />
            ) : (
              <div className="h-28 w-28 rounded-2xl bg-primary/10 border-4 border-card shadow-lg flex items-center justify-center">
                <span className="font-display font-bold text-primary text-3xl">{company.name.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="flex-1 pt-4 sm:pt-16 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-bold text-white drop-shadow sm:text-foreground">{company.name}</h1>
              {company.is_verified && (
                <Badge variant="default" className="gap-1"><BadgeCheck className="h-3 w-3" /> Verificado</Badge>
              )}
              {company.is_sponsored && <Badge variant="accent">Patrocinado</Badge>}
            </div>
            {company.category && <p className="text-sm text-white/80 drop-shadow sm:text-muted-foreground">{company.category.name}</p>}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <StarRating rating={company.rating} showValue count={company.review_count} />
              {company.city && (
                <span className="flex items-center gap-1 text-white/80 sm:text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {company.city}, {company.province}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-4 sm:pt-16">
            <Button onClick={() => setBookingOpen(true)} size="lg" className="gap-2">
              <Calendar className="h-4 w-4" /> Solicitar orçamento
            </Button>
            <Button variant="outline" onClick={handleContact} className="gap-2">
              <MessageCircle className="h-4 w-4" /> Enviar mensagem
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="overview">
            <TabsList className="w-full justify-start overflow-x-auto scrollbar-hide">
              <TabsTrigger value="overview">Visão geral</TabsTrigger>
              <TabsTrigger value="gallery">Galeria</TabsTrigger>
              <TabsTrigger value="services">Serviços</TabsTrigger>
              <TabsTrigger value="packages">Pacotes</TabsTrigger>
              <TabsTrigger value="reviews">Avaliações ({company.review_count})</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="p-6">
                    <h2 className="font-display text-xl font-semibold mb-3">Sobre</h2>
                    <p className="text-muted-foreground leading-relaxed">{company.description}</p>
                  </Card>

                  {galleryPhotos.length > 0 && (
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-display text-xl font-semibold">Galeria</h2>
                        <Button variant="ghost" size="sm" onClick={() => (document.querySelector('[value="gallery"]') as HTMLElement | null)?.click()}>
                          Ver todas <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {galleryPhotos.slice(0, 6).map((url, i) => (
                          <button key={i} onClick={() => setActivePhoto(url)} className="aspect-square overflow-hidden rounded-lg group">
                            <img src={url} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                          </button>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>

                <div className="space-y-4">
                  <Card className="p-6 space-y-4">
                    <h3 className="font-display font-semibold">Contacto</h3>
                    {company.phone && (
                      <a href={`tel:${company.phone}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                        <Phone className="h-4 w-4 text-muted-foreground" /> {company.phone}
                      </a>
                    )}
                    {company.email && (
                      <a href={`mailto:${company.email}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                        <Mail className="h-4 w-4 text-muted-foreground" /> {company.email}
                      </a>
                    )}
                    {company.website && (
                      <a href={company.website} target="_blank" rel="noopener" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                        <Globe className="h-4 w-4 text-muted-foreground" /> Website
                      </a>
                    )}
                    {company.whatsapp && (
                      <a href={`https://wa.me/${company.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener" className="flex items-center gap-3 text-sm hover:text-success transition-colors">
                        <MessageCircle className="h-4 w-4 text-success" /> WhatsApp
                      </a>
                    )}
                    {company.instagram && (
                      <a href={`https://instagram.com/${company.instagram}`} target="_blank" rel="noopener" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                        <Instagram className="h-4 w-4 text-muted-foreground" /> @{company.instagram}
                      </a>
                    )}
                    {company.facebook && (
                      <a href={company.facebook} target="_blank" rel="noopener" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                        <Facebook className="h-4 w-4 text-muted-foreground" /> Facebook
                      </a>
                    )}
                  </Card>

                  {company.opening_hours && (
                    <Card className="p-6 space-y-3">
                      <h3 className="font-display font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Horário
                      </h3>
                      <div className="space-y-1.5 text-sm">
                        {Object.entries(company.opening_hours as Record<string, string>).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className="capitalize text-muted-foreground">{day}</span>
                            <span className={hours === "Fechado" ? "text-destructive" : ""}>{hours}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {company.price_from != null && (
                    <Card className="p-6 text-center">
                      <p className="text-sm text-muted-foreground">Preço a partir de</p>
                      <p className="font-display text-2xl font-bold text-primary mt-1">
                        {formatCurrency(company.price_from)}
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Gallery */}
            <TabsContent value="gallery" className="mt-6">
              {galleryPhotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {galleryPhotos.map((url, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setActivePhoto(url)}
                      className="aspect-[4/3] overflow-hidden rounded-xl group"
                    >
                      <img src={url} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                    </motion.button>
                  ))}
                </div>
              ) : (
                <EmptyState icon={CameraIcon} title="Nenhuma foto disponível" />
              )}
            </TabsContent>

            {/* Services */}
            <TabsContent value="services" className="mt-6">
              {services && services.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {services.map((service, i) => (
                    <motion.div key={service.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="p-5 flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{service.name}</h4>
                          {service.description && <p className="text-sm text-muted-foreground mb-2">{service.description}</p>}
                          <p className="text-sm text-muted-foreground">Unidade: {service.unit}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-display text-lg font-bold text-primary">{formatCurrency(service.price)}</p>
                          <Button size="sm" className="mt-2" onClick={() => { setSelectedService(service.id); setBookingOpen(true); }}>
                            Reservar
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Wrench} title="Nenhum serviço cadastrado" />
              )}
            </TabsContent>

            {/* Packages */}
            <TabsContent value="packages" className="mt-6">
              {packages && packages.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-4">
                  {packages.map((pkg, i) => (
                    <motion.div key={pkg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="p-6 h-full flex flex-col">
                        <PackageIcon className="h-8 w-8 text-primary mb-3" />
                        <h4 className="font-display font-semibold text-lg mb-1">{pkg.name}</h4>
                        {pkg.description && <p className="text-sm text-muted-foreground mb-4">{pkg.description}</p>}
                        <ul className="space-y-2 mb-4 flex-1">
                          {(pkg.items as string[]).map((item, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm">
                              <BadgeCheck className="h-4 w-4 text-success shrink-0 mt-0.5" /> {item}
                            </li>
                          ))}
                        </ul>
                        <div className="pt-4 border-t border-border">
                          <p className="font-display text-2xl font-bold text-primary mb-3">{formatCurrency(pkg.price)}</p>
                          <Button className="w-full" onClick={() => setBookingOpen(true)}>Solicitar pacote</Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={PackageIcon} title="Nenhum pacote disponível" />
              )}
            </TabsContent>

            {/* Reviews */}
            <TabsContent value="reviews" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {reviews && reviews.length > 0 ? (
                    reviews.map((review, i) => (
                      <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <Card className="p-5">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              {review.profiles?.avatar_url ? <AvatarImage src={review.profiles.avatar_url} /> : null}
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getInitials(review.profiles?.full_name ?? "U")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-sm">{review.profiles?.full_name}</p>
                                <span className="text-xs text-muted-foreground">{timeAgo(review.created_at)}</span>
                              </div>
                              <StarRating rating={review.rating} size="sm" className="mt-1" />
                              <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <EmptyState icon={Star} title="Ainda não há avaliações" description="Seja o primeiro a avaliar esta empresa." />
                  )}
                </div>

                {/* Review form */}
                <div>
                  <Card className="p-6">
                    <h3 className="font-display font-semibold mb-4">Deixe a sua avaliação</h3>
                    <form onSubmit={handleReview} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nota</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                            >
                              <Star className={cn(
                                "h-7 w-7 transition-colors",
                                star <= reviewRating ? "fill-accent text-accent" : "text-muted-foreground/30"
                              )} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="comment">Comentário</Label>
                        <Textarea
                          id="comment"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Conte a sua experiência..."
                          required
                          rows={4}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={createReview.isPending}>
                        {createReview.isPending ? "Publicando..." : "Publicar avaliação"}
                      </Button>
                    </form>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar orçamento</DialogTitle>
            <DialogDescription>
              Selecione o evento e o serviço desejado. A empresa responderá em breve.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBooking} className="space-y-4">
            {!session ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">Faça login para solicitar orçamento</p>
                <Button asChild><Link to="/entrar">Entrar</Link></Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Evento</Label>
                  <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                    <SelectTrigger><SelectValue placeholder="Selecione um evento" /></SelectTrigger>
                    <SelectContent>
                      {events && events.length > 0 ? (
                        events.map((ev) => (
                          <SelectItem key={ev.id} value={ev.id}>
                            {ev.title} - {formatDate(ev.event_date)}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>Nenhum evento. Crie um primeiro.</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {events && events.length === 0 && (
                    <Button asChild variant="link" className="p-0 h-auto">
                      <Link to="/painel/eventos">Criar evento</Link>
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Serviço</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger><SelectValue placeholder="Selecione um serviço (opcional)" /></SelectTrigger>
                    <SelectContent>
                      {services?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Descreva detalhes do que precisa..."
                    rows={3}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setBookingOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createBooking.isPending}>
                    {createBooking.isPending ? "Enviando..." : "Solicitar orçamento"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* Photo lightbox */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-fade-in"
          onClick={() => setActivePhoto(null)}
        >
          <img src={activePhoto} alt="" className="max-h-full max-w-full object-contain rounded-lg" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white"
            onClick={() => setActivePhoto(null)}
          >
            <span className="text-2xl">×</span>
          </Button>
        </div>
      )}
    </div>
  );
}
