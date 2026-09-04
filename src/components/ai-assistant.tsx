import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, X, Bot, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Recommendation {
  text: string;
  estimate?: string;
}

const QUICK_PROMPTS = [
  "Quero organizar um casamento",
  "Preciso de um DJ para aniversário",
  "Qual o orçamento para 100 pessoas?",
  "Como funciona a plataforma?",
];

// Simple rule-based AI assistant
function generateResponse(userMessage: string): Recommendation {
  const msg = userMessage.toLowerCase();

  if (msg.includes("casamento") || msg.includes("casamentos")) {
    return {
      text: "Para organizar um casamento na JABOQUE, recomendo combinar os seguintes serviços:\n\n1. **Espaço para eventos** - Salão Cristal Eventos (a partir de Kz 100.000)\n2. **Decoração** - Decora Festas Angola (a partir de Kz 50.000)\n3. **Buffet** - Sabores Buffet Premium (a partir de Kz 80.000)\n4. **Fotografia** - FotoMemória Estúdio (a partir de Kz 40.000)\n5. **DJ** - DJ Luís Mixmaster (a partir de Kz 30.000)\n\nPode solicitar orçamentos diretamente de cada empresa na página deles!",
      estimate: "Orçamento estimado: Kz 300.000 - Kz 800.000",
    };
  }

  if (msg.includes("dj") || msg.includes("música") || msg.includes("musica")) {
    return {
      text: "Para um DJ, recomendo o **DJ Luís Mixmaster** - avaliação 4.7★ com 38 avaliações.\n\nServiços disponíveis:\n- DJ 4 horas: Kz 50.000\n- DJ 6 horas: Kz 80.000\n- DJ + Iluminação: Kz 120.000\n\nTambém oferece o Pack Festa Animada (DJ + iluminação + efeitos) por Kz 150.000.\n\nAceda à página dele para solicitar orçamento!",
      estimate: "Orçamento: Kz 50.000 - Kz 150.000",
    };
  }

  if (msg.includes("buffet") || msg.includes("comida") || msg.includes("100 pessoas") || msg.includes("orçamento")) {
    return {
      text: "Para buffet, a **Sabores Buffet Premium** é a melhor opção (4.9★):\n\n- Buffet 50 pessoas: Kz 150.000\n- Buffet 100 pessoas: Kz 280.000\n- Buffet 200 pessoas: Kz 500.000\n\nTambém tem o Pack Buffet + Serviço (100 convidados com serviço de mesa) por Kz 350.000.\n\nPara um evento de 100 pessoas, recomendo o buffet de 100 pessoas ou o pack completo.",
      estimate: "Orçamento para 100 pessoas: Kz 280.000 - Kz 350.000",
    };
  }

  if (msg.includes("aniversário") || msg.includes("aniversario")) {
    return {
      text: "Para um aniversário, sugiro esta combinação:\n\n1. **Decoração** - Decora Festas Angola (Pack Aniversário Completo: Kz 200.000)\n2. **Bolo** - Doce Vida Bolos Artísticos (a partir de Kz 15.000)\n3. **DJ** - DJ Luís Mixmaster (a partir de Kz 50.000)\n4. **Fotografia** - FotoMemória Estúdio (a partir de Kz 60.000)\n\nPode também alugar um espaço: Salão Cristal Eventos (a partir de Kz 100.000).",
      estimate: "Orçamento estimado: Kz 100.000 - Kz 400.000",
    };
  }

  if (msg.includes("como funciona") || msg.includes("plataforma") || msg.includes("ajuda")) {
    return {
      text: "A JABOQUE é simples de usar:\n\n1. **Pesquise** fornecedores por categoria, cidade e preço\n2. **Compare** avaliações e preços\n3. **Solicite orçamento** diretamente da página da empresa\n4. **Converse** com os fornecedores pelo chat\n5. **Celebre** o seu evento!\n\nPara empresas: cadastre-se gratuitamente e comece a receber pedidos. Tem planos Premium para maior destaque.\n\nPrecisa de ajuda com algo específico?",
    };
  }

  if (msg.includes("decoração") || msg.includes("decoracao")) {
    return {
      text: "Para decoração, recomendo a **Decora Festas Angola** (4.8★, 47 avaliações):\n\n- Decoração Básica: Kz 50.000\n- Decoração Premium: Kz 150.000\n- Decoração Luxo: Kz 300.000\n- Pack Aniversário Completo: Kz 200.000\n\nEspecialistas em balões, flores, iluminação e ambientação completa.",
      estimate: "Orçamento: Kz 50.000 - Kz 300.000",
    };
  }

  if (msg.includes("bolo") || msg.includes("bolos") || msg.includes("doces")) {
    return {
      text: "Para bolos e doces, a **Doce Vida Bolos Artísticos** (4.8★) é excelente:\n\n- Bolo 1 andar: Kz 15.000\n- Bolo 3 andares: Kz 65.000\n- Mesa de Doces (200 doces): Kz 35.000\n\nCada bolo é feito sob medida. Acede à página deles para ver a galeria!",
      estimate: "Orçamento: Kz 15.000 - Kz 100.000",
    };
  }

  if (msg.includes("espaço") || msg.includes("espaco") || msg.includes("salão") || msg.includes("salao")) {
    return {
      text: "Para espaços, o **Salão Cristal Eventos** (4.6★) é a melhor opção:\n\n- Aluguel 4h: Kz 100.000\n- Aluguel dia todo: Kz 250.000\n- Pack Salão + Decoração: Kz 400.000\n- Pack Evento Chave-na-Mão: Kz 800.000\n\nCapacidade para 500 pessoas, climatizado, com estacionamento.",
      estimate: "Orçamento: Kz 100.000 - Kz 800.000",
    };
  }

  if (msg.includes("fotografia") || msg.includes("fotógrafo") || msg.includes("fotografo") || msg.includes("filmagem")) {
    return {
      text: "Para fotografia, a **FotoMemória Estúdio** (4.9★) é altamente recomendada:\n\n- Fotografia 4h: Kz 60.000\n- Fotografia + Filmagem: Kz 150.000\n- Pack Casamento Premium: Kz 250.000\n\nInclui álbum digital, prints e entrega rápida.",
      estimate: "Orçamento: Kz 60.000 - Kz 250.000",
    };
  }

  return {
    text: "Sou a JABOQUE, assistente virtual para ajudar a organizar o seu evento!\n\nPosso ajudar com:\n- Recomendações de fornecedores ( decoração, buffet, fotografia...)\n- Estimativas de orçamento\n- Combinações de serviços para o seu evento\n- Dúvidas sobre a plataforma\n\nO que precisa para o seu evento?",
  };
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! Sou a JABOQUE, a sua assistente virtual. Posso recomendar fornecedores, estimar orçamentos e ajudar a planear o seu evento. Como posso ajudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const response = generateResponse(text);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.estimate ? `${response.text}\n\n💡 ${response.estimate}` : response.text,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setTyping(false);
    }, 800 + Math.random() * 500);
  };

  return (
    <>
      {/* Toggle button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            <Sparkles className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px] font-bold animate-pulse">
              IA
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[600px] max-h-[80vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border gradient-primary text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display font-bold">JABOQUE IA</p>
                  <p className="text-xs text-primary-foreground/80 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse" /> Online
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card border border-border rounded-bl-sm"
                    )}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {typing && (
                <div className="flex gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="p-3 border-t border-border flex gap-2 bg-card"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escreva a sua mensagem..."
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!input.trim() || typing}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
