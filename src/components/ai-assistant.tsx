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
      text: "Para organizar um casamento na JABOQUE, podemos combinar espaço, decoração, buffet, fotografia e música numa solução completa.\n\nA nossa equipa prepara uma proposta de acordo com a data, o local, o número de convidados e o seu orçamento. Crie o evento no seu painel para começarmos!",
      estimate: "Orçamento estimado: Kz 300.000 - Kz 800.000",
    };
  }

  if (msg.includes("dj") || msg.includes("música") || msg.includes("musica")) {
    return {
      text: "A JABOQUE pode incluir música e animação no seu evento.\n\nPodemos preparar opções de DJ, iluminação e efeitos conforme a duração e o estilo da celebração. Crie o seu evento e indique o que pretende na descrição.",
      estimate: "Orçamento: Kz 50.000 - Kz 150.000",
    };
  }

  if (msg.includes("buffet") || msg.includes("comida") || msg.includes("100 pessoas") || msg.includes("orçamento")) {
    return {
      text: "A JABOQUE pode organizar o buffet do seu evento.\n\nPara 100 pessoas, a proposta depende do menu, do tipo de serviço e da duração. Registe o evento com o número de convidados para receber uma solução adequada.",
      estimate: "Orçamento para 100 pessoas: Kz 280.000 - Kz 350.000",
    };
  }

  if (msg.includes("aniversário") || msg.includes("aniversario")) {
    return {
      text: "Para um aniversário, a JABOQUE pode tratar da decoração, bolo, música, fotografia e espaço numa única proposta.\n\nIndique a data, o número de convidados e o ambiente que deseja para prepararmos as opções certas.",
      estimate: "Orçamento estimado: Kz 100.000 - Kz 400.000",
    };
  }

  if (msg.includes("como funciona") || msg.includes("plataforma") || msg.includes("ajuda")) {
    return {
      text: "A JABOQUE cuida do seu evento de ponta a ponta:\n\n1. **Crie** o seu evento com data, local e convidados\n2. **Descreva** o que gostaria de realizar\n3. **Receba** uma proposta da equipa JABOQUE\n4. **Acompanhe** tudo pelo seu painel\n5. **Celebre** sem ter de coordenar vários serviços!\n\nPrecisa de ajuda com algo específico?",
    };
  }

  if (msg.includes("decoração") || msg.includes("decoracao")) {
    return {
      text: "A JABOQUE prepara a decoração do seu evento com opções de balões, flores, iluminação e ambientação completa.\n\nAo criar o evento, descreva o estilo que deseja e a nossa equipa monta uma proposta para si.",
      estimate: "Orçamento: Kz 50.000 - Kz 300.000",
    };
  }

  if (msg.includes("bolo") || msg.includes("bolos") || msg.includes("doces")) {
    return {
      text: "A JABOQUE pode incluir bolos e doces feitos sob medida na proposta do seu evento.\n\nInforme o número de convidados e o estilo que deseja para receber uma sugestão adequada.",
      estimate: "Orçamento: Kz 15.000 - Kz 100.000",
    };
  }

  if (msg.includes("espaço") || msg.includes("espaco") || msg.includes("salão") || msg.includes("salao")) {
    return {
      text: "A JABOQUE pode ajudar a encontrar e preparar o espaço ideal para o seu evento, incluindo decoração e estrutura.\n\nDiga-nos a cidade, a data e o número de convidados para avaliarmos a melhor solução.",
      estimate: "Orçamento: Kz 100.000 - Kz 800.000",
    };
  }

  if (msg.includes("fotografia") || msg.includes("fotógrafo") || msg.includes("fotografo") || msg.includes("filmagem")) {
    return {
      text: "A JABOQUE pode incluir fotografia e filmagem no serviço do seu evento, com cobertura ajustada à duração e aos momentos que deseja guardar.\n\nIndique as suas prioridades na descrição do evento.",
      estimate: "Orçamento: Kz 60.000 - Kz 250.000",
    };
  }

  return {
    text: "Sou a JABOQUE, assistente virtual para ajudar a organizar o seu evento!\n\nPosso ajudar com:\n- Soluções completas de decoração, buffet e animação\n- Estimativas de orçamento\n- Combinações de serviços para o seu evento\n- Dúvidas sobre a plataforma\n\nO que precisa para o seu evento?",
  };
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! Sou a JABOQUE, a sua assistente virtual. Posso preparar soluções para o seu evento, estimar orçamentos e ajudar no planeamento. Como posso ajudar?",
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
