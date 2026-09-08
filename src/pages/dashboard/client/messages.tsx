import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { useConversations, useMessages, useSendMessage } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { timeAgo, getInitials, cn } from "@/lib/utils";

export function ClientMessages() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: conversations } = useConversations();
  const selectedUserId = searchParams.get("to") ?? undefined;
  const { data: messages } = useMessages(selectedUserId);
  const sendMessage = useSendMessage();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const companyId = searchParams.get("company") ?? undefined;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedUserId) return;
    sendMessage.mutate(
      { receiverId: selectedUserId, content: input.trim(), companyId: companyId ?? undefined },
      { onSuccess: () => setInput("") }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Mensagens</h1>
        <p className="text-muted-foreground mt-1">Fale com a equipa JABOQUE sobre o seu evento</p>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-4 h-[600px]">
        {/* Conversations list */}
        <Card className="p-3 overflow-y-auto">
          {conversations && conversations.length > 0 ? (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.otherUser.id}
                  onClick={() => setSearchParams({ to: conv.otherUser.id, ...(conv.company?.id ? { company: conv.company.id } : {}) })}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                    selectedUserId === conv.otherUser.id ? "bg-primary/10" : "hover:bg-muted"
                  )}
                >
                  <Avatar className="h-10 w-10">
                    {conv.otherUser.avatar_url ? <AvatarImage src={conv.otherUser.avatar_url} /> : null}
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(conv.otherUser.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{conv.otherUser.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage.content}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold px-1.5">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground text-center">Nenhuma conversa ainda</p>
            </div>
          )}
        </Card>

        {/* Chat area */}
        <Card className="flex flex-col overflow-hidden">
          {selectedUserId ? (
            <>
              <div className="p-4 border-b border-border flex items-center gap-3">
                {conversations && (() => {
                  const conv = conversations.find((c) => c.otherUser.id === selectedUserId);
                  if (!conv) return null;
                  return (
                    <>
                      <Avatar className="h-10 w-10">
                        {conv.otherUser.avatar_url ? <AvatarImage src={conv.otherUser.avatar_url} /> : null}
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(conv.otherUser.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{conv.otherUser.full_name}</p>
                        <p className="text-xs text-muted-foreground">Equipa JABOQUE</p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.sender_id === profile?.id ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                        msg.sender_id === profile?.id
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      )}
                    >
                      {msg.content}
                      <div className={cn("text-xs mt-0.5", msg.sender_id === profile?.id ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {timeAgo(msg.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSend} className="p-3 border-t border-border flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escreva uma mensagem..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!input.trim() || sendMessage.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={MessageCircle}
                title="Selecione uma conversa"
                description="Escolha uma conversa à esquerda para falar com a equipa JABOQUE."
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
