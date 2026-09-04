import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  ShoppingBag,
  Sparkles,
  Shield,
  Star,
  Timer,
  Truck,
  User,
  Wallet,
  CreditCard,
  Phone,
  Calendar as CalendarIcon,
  X,
  Layers,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useCoupon, useCreateOrder, useProducts } from "@/lib/queries";

const defaultProducts = [
  {
    id: "hamburguer",
    emoji: "🍔",
    name: "Hambúrguer Gourmet",
    description: "Pão macio, carne suculenta, queijo cheddar, molho especial e crispy bacon.",
    price: 1550,
    prepTime: "25 min",
    available: 150,
    popularity: 96,
    image: "/hamburguer.jpg",
  },
  {
    id: "cachorro",
    emoji: "🌭",
    name: "Hot Dog Fest",
    description: "Salsicha especial, pão brioche, queijo, cebola caramelizada e molho barbecue.",
    price: 980,
    prepTime: "18 min",
    available: 120,
    popularity: 88,
    image: "/cachorro.jpg",
  },
  {
    id: "pizza",
    emoji: "🍕",
    name: "Pizza Party",
    description: "Massa fina, molho tomate artesanal, mozzarella e cobertura especial da casa.",
    price: 2980,
    prepTime: "30 min",
    available: 80,
    popularity: 99,
    image: "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "algodao",
    emoji: "🍭",
    name: "Algodão Doce",
    description: "Doce, leve e colorido: ideal para crianças e ambientes festivos.",
    price: 650,
    prepTime: "10 min",
    available: 60,
    popularity: 78,
    image: "/algodao-doce.jpg",
  },
  {
    id: "pipoca",
    emoji: "🍿",
    name: "Pipoca Gourmet",
    description: "Crocrante, amanteigada e preparada na hora para eventos e atrações.",
    price: 490,
    prepTime: "8 min",
    available: 200,
    popularity: 84,
    image: "/pipoca.jpg",
  },
  {
    id: "fahitas",
    emoji: "🌮",
    name: "Fajitas Fiesta",
    description: "Tiras de carne marinada, pimentões crocantes e guacamole fresco.",
    price: 1850,
    prepTime: "22 min",
    available: 100,
    popularity: 91,
    image: "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];

const availableTimes = [
  { value: "12:00", label: "12:00", available: true },
  { value: "13:30", label: "13:30", available: true },
  { value: "15:00", label: "15:00", available: false },
  { value: "17:00", label: "17:00", available: true },
  { value: "19:30", label: "19:30", available: true },
  { value: "21:00", label: "21:00", available: false },
];

type CartItem = {
  id: string;
  name: string;
  image: string;
  quantity: number;
  subtotal: number;
  price: number;
};

const paymentMethods = [
  { id: "delivery", label: "Pagamento na entrega", icon: Truck, description: "Pague em dinheiro ou cartão quando receber a encomenda." },
  { id: "banco", label: "Transferência Bancária", icon: Wallet, description: "Receba instruções para pagar antes da entrega." },
  { id: "cartao", label: "Cartão", icon: CreditCard, description: "Pagamento seguro com cartão em plataforma criptografada." },
  { id: "multicaixa", label: "Multicaixa Express", icon: Shield, description: "Pagamento rápido via Multicaixa do seu dispositivo móvel." },
  { id: "carteira", label: "Carteira Digital", icon: Layers, description: "Use a sua carteira digital favorita para pagar na hora." },
];

function formatDateValue(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date));
}

export default function EncomendasPage() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [province, setProvince] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [district, setDistrict] = useState("");
  const [street, setStreet] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [reference, setReference] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("delivery");
  const [validationError, setValidationError] = useState("");
  const [successOrder, setSuccessOrder] = useState<
    | {
        id: string;
        createdAt: string;
        status: string;
      }
    | null
  >(null);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const { session, profile } = useAuth();
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: couponData } = useCoupon(coupon.trim());
  const createOrder = useCreateOrder();

  const products = productsData ?? defaultProducts;

  useEffect(() => {
    if (!profile) return;
    if (!customerName) setCustomerName(profile.full_name);
    if (!customerPhone && profile.phone) setCustomerPhone(profile.phone);
    if (!customerEmail) setCustomerEmail(profile.email);
  }, [profile]);

  const cartItems = useMemo(
    () =>
      products
        .map((product) => {
          const image = (product as any).image ?? (product as any).image_url ?? "/hamburguer.jpg";
          return {
            id: product.id,
            name: product.name,
            description: (product as any).description ?? "",
            image,
            price: product.price,
            quantity: quantities[product.id] ?? 0,
            subtotal: (quantities[product.id] ?? 0) * product.price,
          };
        })
        .filter((item) => item.quantity > 0),
    [products, quantities]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.subtotal, 0),
    [cartItems]
  );

  const deliveryFee = cartItems.length > 0 ? 450 : 0;
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + tax - discount;

  const canConfirm =
    cartItems.length > 0 &&
    selectedDate &&
    selectedTime &&
    province &&
    municipality &&
    district &&
    street &&
    buildingNumber &&
    customerName &&
    customerPhone &&
    customerEmail;

  const handleAdd = (productId: string) => {
    setQuantities((current) => ({
      ...current,
      [productId]: (current[productId] ?? 0) + 1,
    }));
  };

  const handleChangeQuantity = (productId: string, value: number) => {
    setQuantities((current) => {
      const next = Math.max(0, (current[productId] ?? 0) + value);
      return { ...current, [productId]: next };
    });
  };

  const handleRemove = (productId: string) => {
    setQuantities((current) => {
      const next = { ...current };
      delete next[productId];
      return next;
    });
  };

  const handleClearCart = () => {
    setQuantities({});
    setCoupon("");
    setCouponApplied(false);
    setCouponMessage("");
  };

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) {
      setCouponApplied(false);
      setCouponMessage("Insira um código de cupão.");
      return;
    }

    if (couponData && subtotal >= couponData.min_order_value) {
      setCouponApplied(true);
      setCouponMessage(`Cupão aplicado com sucesso: ${couponData.discount_percent}% de desconto.`);
      return;
    }

    setCouponApplied(false);
    setCouponMessage("Cupão inválido ou mínimo de AOA 3.000 não atingido.");
  };

  const confirmOrder = async () => {
    if (!canConfirm) {
      setValidationError("Preencha todos os campos obrigatórios antes de confirmar a encomenda.");
      return;
    }
    setValidationError("");

    try {
      const order = await createOrder.mutateAsync({
        order: {
          client_id: session?.user?.id ?? null,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          payment_method: paymentMethod as any,
          coupon_id: couponData?.id ?? null,
          coupon_code: couponData?.code ?? null,
          delivery_fee: deliveryFee,
          discount,
          tax,
          total,
          distance_meters: 3400,
          estimated_arrival: "40 min",
          notes,
          event_date: selectedDate,
          event_time: selectedTime,
          province,
          municipality,
          district,
          street,
          number: buildingNumber,
          reference,
        },
        items: cartItems.map((item) => ({
          product_id: item.id,
          name: item.name,
          description: item.description,
          unit_price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
      });

      setSuccessOrder({
        id: order.id,
        createdAt: order.created_at,
        status: order.status,
      });
      handleClearCart();
    } catch (error) {
      setValidationError(
        error instanceof Error ? error.message : "Erro ao confirmar a encomenda. Tente novamente."
      );
    }
  };

  if (successOrder) {
    return (
      <div className="container py-12">
        <Card className="p-8">
          <h1 className="font-display text-2xl font-semibold">Encomenda confirmada</h1>
          <p className="text-sm text-muted-foreground">ID: {successOrder.id}</p>
        </Card>
      </div>
    );
  }
  return (
    <div className="container pb-12 pt-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-transparent p-8 shadow-[0_30px_80px_-50px_rgb(59,130,246,0.45)] sm:p-12">
        <div className="absolute inset-0 opacity-10 blur-3xl">
          <div className="h-full w-full rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.3),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(232,121,95,0.25),_transparent_40%)]" />
        </div>
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="space-y-6">
            <Badge className="bg-accent text-accent-foreground">Encomendas de festa</Badge>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
              Encomende alimentos para o seu evento de forma rápida, prática e segura.
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Planeje o cardápio do seu evento com os melhores pratos, controle quantidades, escolha data e hora, e acompanhe o valor em tempo real.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="#produtos">Fazer Encomenda</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="#resumo">Ver resumo</Link>
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-border bg-white/80 p-4 shadow-xl shadow-primary/10 backdrop-blur-xl">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-primary/5 p-5">
                <div className="flex items-center gap-3 text-primary"><ShoppingBag className="h-5 w-5" /><span className="font-semibold">6 pratos premium</span></div>
                <p className="mt-3 text-sm text-muted-foreground">Escolha entre hambúrguer, pizza, pipoca, algodão doce e muito mais.</p>
              </div>
              <div className="rounded-3xl bg-accent/5 p-5">
                <div className="flex items-center gap-3 text-accent"><Truck className="h-5 w-5" /><span className="font-semibold">Entrega inteligente</span></div>
                <p className="mt-3 text-sm text-muted-foreground">Taxa calculada automaticamente com base no endereço informado.</p>
              </div>
              <div className="rounded-3xl bg-secondary/5 p-5">
                <div className="flex items-center gap-3 text-secondary"><CalendarIcon className="h-5 w-5" /><span className="font-semibold">Horários disponíveis</span></div>
                <p className="mt-3 text-sm text-muted-foreground">Selecione a melhor data e horário sem perder tempo.</p>
              </div>
              <div className="rounded-3xl bg-emerald-500/10 p-5">
                <div className="flex items-center gap-3 text-emerald-600"><Sparkles className="h-5 w-5" /><span className="font-semibold">Pagamentos flexíveis</span></div>
                <p className="mt-3 text-sm text-muted-foreground">Cartão, Multicaixa, transferência ou carteira digital.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.4fr_0.9fr] xl:items-start mt-10">
        <div>
          <section id="produtos" className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Produtos disponíveis</p>
                <h2 className="font-display text-3xl font-bold">Escolha e personalize</h2>
              </div>
              <div className="rounded-3xl bg-muted px-4 py-3 text-sm text-muted-foreground shadow-sm">
                Adicione quantidades livres e veja o seu total atualizar em tempo real.
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {products.map((product, index) => {
                const quantity = quantities[product.id] ?? 0;
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img src={(product as any).image} alt={product.name} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                      <div className="absolute inset-x-0 bottom-0 rounded-b-[2rem] bg-gradient-to-t from-black/70 to-transparent px-5 py-4 text-white">
                        <p className="text-sm uppercase tracking-[0.2em] text-white/80">{(product as any).emoji} {product.name}</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-display text-xl font-semibold">{product.name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
                        </div>
                        <Badge className="bg-primary/10 text-primary">{product.popularity}% popular</Badge>
                      </div>
                      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] items-center">
                        <div className="space-y-2">
                          <p className="text-2xl font-semibold">{formatCurrency(product.price)}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2"><Clock3 className="h-4 w-4" /> {(product as any).prepTime}</p>
                          <p className="text-sm text-muted-foreground"><span className="font-medium">Disponível:</span> {(product as any).available} unidades</p>
                        </div>
                        <div className="space-y-3"> 
                          <Button onClick={() => handleAdd(product.id)} className="w-full">Adicionar</Button>
                          <div className="flex items-center rounded-full border border-border bg-muted p-1">
                            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleChangeQuantity(product.id, -1)}>
                              −
                            </Button>
                            <div className="flex-1 text-center text-sm font-semibold">{quantity}</div>
                            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleChangeQuantity(product.id, 1)}>
                              +
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">Subtotal: {formatCurrency(product.price * quantity)}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          <section className="mt-10 grid gap-6 md:grid-cols-2">
            <Card className="rounded-[2rem] p-6">
              <div className="flex items-center gap-3 text-primary">
                <CalendarIcon className="h-5 w-5" />
                <h3 className="font-display text-lg font-semibold">Data & Hora</h3>
              </div>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Data da entrega</label>
                  <Input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Horários disponíveis</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {availableTimes.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        disabled={!item.available}
                        onClick={() => item.available && setSelectedTime(item.value)}
                        className={`rounded-2xl border px-3 py-2 text-sm transition ${
                          item.available
                            ? selectedTime === item.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background hover:border-primary/60"
                            : "cursor-not-allowed border-muted bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedTime && (
                  <p className="text-sm text-muted-foreground">Previsão de preparação: {selectedTime} + 30 min</p>
                )}
              </div>
            </Card>

            <Card className="rounded-[2rem] p-6">
              <div className="flex items-center gap-3 text-secondary">
                <MapPin className="h-5 w-5" />
                <h3 className="font-display text-lg font-semibold">Local de entrega</h3>
              </div>
              <div className="mt-5 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Província" value={province} onChange={(e) => setProvince(e.target.value)} />
                  <Input placeholder="Município" value={municipality} onChange={(e) => setMunicipality(e.target.value)} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Distrito/Bairro" value={district} onChange={(e) => setDistrict(e.target.value)} />
                  <Input placeholder="Rua" value={street} onChange={(e) => setStreet(e.target.value)} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Número" value={buildingNumber} onChange={(e) => setBuildingNumber(e.target.value)} />
                  <Input placeholder="Referência" value={reference} onChange={(e) => setReference(e.target.value)} />
                </div>
                <div className="rounded-3xl border border-border bg-muted p-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Compass className="h-4 w-4" /> Distância estimada: 3,4 km</div>
                  <div className="flex items-center gap-2"><Truck className="h-4 w-4" /> Taxa de entrega calculada automaticamente</div>
                  <div className="mt-3 h-40 overflow-hidden rounded-3xl border border-border bg-black/5">
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Mapa interativo</div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          <section className="mt-10 grid gap-6 md:grid-cols-2">
            <Card className="rounded-[2rem] p-6">
              <div className="flex items-center gap-3 text-emerald-600">
                <User className="h-5 w-5" />
                <h3 className="font-display text-lg font-semibold">Informações do cliente</h3>
              </div>
              <div className="mt-5 grid gap-4">
                <Input placeholder="Nome completo" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                <Input placeholder="Telefone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                <Input placeholder="Email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
              </div>
            </Card>

            <Card className="rounded-[2rem] p-6">
              <div className="flex items-center gap-3 text-primary">
                <Phone className="h-5 w-5" />
                <h3 className="font-display text-lg font-semibold">Observações</h3>
              </div>
              <Textarea
                placeholder="Sem cebola; entregar na entrada principal; ligar antes de chegar..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Card>
          </section>

          <section className="mt-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Pagamento</p>
                <h2 className="font-display text-3xl font-bold">Escolha o método</h2>
              </div>
              <p className="max-w-2xl text-sm text-muted-foreground">Selecione uma opção para ver instruções específicas de pagamento.</p>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`rounded-[1.75rem] border p-5 text-left transition ${
                      paymentMethod === method.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-primary"><Icon className="h-5 w-5" /></span>
                      <div>
                        <p className="font-semibold">{method.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl font-semibold">Resumo do carrinho</h2>
              <Badge className="bg-primary/10 text-primary">{cartItems.length} itens</Badge>
            </div>
            <div className="mt-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="rounded-3xl bg-muted p-6 text-sm text-muted-foreground">
                  Adicione produtos para iniciar a sua encomenda.
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-border p-4">
                      <div className="flex items-start gap-4">
                        <div className="overflow-hidden rounded-3xl border border-border bg-muted">
                          <img src={item.image} alt={item.name} className="h-14 w-14 object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold">{item.name}</p>
                            <button
                              type="button"
                              onClick={() => handleRemove(item.id)}
                              className="text-sm text-destructive"
                            >
                              Remover
                            </button>
                          </div>
                          <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} cada</p>
                          <div className="mt-3 flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleChangeQuantity(item.id, -1)}>-</Button>
                            <span className="min-w-[2rem] text-center font-semibold">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleChangeQuantity(item.id, 1)}>+</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Card className="rounded-[2rem] p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-5 w-5" />
                <p className="text-sm">Taxa de entrega calculada automaticamente</p>
              </div>
              <div className="grid gap-3">
                <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between text-sm text-muted-foreground"><span>Entrega</span><span>{formatCurrency(deliveryFee)}</span></div>
                <div className="flex justify-between text-sm text-muted-foreground"><span>Impostos</span><span>{formatCurrency(tax)}</span></div>
                <div className="flex justify-between text-sm text-muted-foreground"><span>Descontos</span><span>-{formatCurrency(discount)}</span></div>
                <div className="border-t border-border pt-4 flex justify-between text-lg font-semibold"><span>Total</span><span>{formatCurrency(total)}</span></div>
              </div>
            </div>
          </Card>

          <Card className="rounded-[2rem] p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Star className="h-5 w-5" />
                <h2 className="font-display text-lg font-semibold">Cupões de desconto</h2>
              </div>
              <div className="grid gap-3">
                <Input
                  placeholder="Insira o código promocional"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
                <Button onClick={applyCoupon}>Aplicar cupão</Button>
                {couponMessage && (
                  <p className={`text-sm ${couponApplied ? "text-emerald-600" : "text-destructive"}`}>{couponMessage}</p>
                )}
              </div>
            </div>
          </Card>

          <div className="space-y-4 rounded-[2rem] border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5" />
              <p className="font-semibold">Pagamentos e suporte</p>
            </div>
            <p className="text-sm text-muted-foreground">Ao confirmar, o seu pedido será registado imediatamente no painel administrativo para alocação e acompanhamento.</p>
            <Button size="lg" onClick={confirmOrder} className="w-full">Confirmar Encomenda</Button>
            {validationError && <p className="text-sm text-destructive">{validationError}</p>}
          </div>
        </aside>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card className="rounded-[2rem] p-6">
          <div className="flex items-center gap-3 text-primary">
            <Sparkles className="h-5 w-5" />
            <div>
              <p className="font-semibold">Recomendações inteligentes</p>
              <p className="text-sm text-muted-foreground">Sugerimos quantidades ideais conforme o tamanho da festa.</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-[2rem] p-6">
          <div className="flex items-center gap-3 text-secondary">
            <Truck className="h-5 w-5" />
            <div>
              <p className="font-semibold">Taxa de entrega automática</p>
              <p className="text-sm text-muted-foreground">Calculada com base na distância e no horário selecionado.</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-[2rem] p-6">
          <div className="flex items-center gap-3 text-emerald-600">
            <Badge className="rounded-full bg-emerald-500/10 text-emerald-600">1ª</Badge>
            <div>
              <p className="font-semibold">Histórico rápido</p>
              <p className="text-sm text-muted-foreground">Veja pedidos anteriores e repita a sua encomenda com um toque.</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 block border-t border-border bg-background p-4 shadow-lg xl:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Carrinho</p>
            <p className="font-semibold">{cartItems.length} itens · {formatCurrency(total)}</p>
          </div>
          <Button variant="outline" onClick={() => setShowMobileCart((value) => !value)}>
            {showMobileCart ? "Fechar" : "Ver carrinho"}
          </Button>
        </div>
      </div>

      {showMobileCart && (
        <div className="fixed inset-x-0 bottom-16 z-50 rounded-t-3xl border border-border bg-card p-4 shadow-2xl xl:hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Carrinho</p>
              <button type="button" onClick={() => setShowMobileCart(false)} className="text-sm text-muted-foreground">Fechar</button>
            </div>
            {cartItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">O seu carrinho ainda está vazio.</p>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.quantity} x {formatCurrency(item.price)}</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

