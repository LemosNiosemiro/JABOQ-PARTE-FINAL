import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Building2, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { useAdminProfiles } from "@/lib/queries";
import { formatDate, getInitials } from "@/lib/utils";

export function AdminUsers() {
  const { data: profiles } = useAdminProfiles();
  const [search, setSearch] = useState("");

  const filtered = profiles?.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleLabels: Record<string, string> = {
    client: "Cliente",
    company: "Empresa",
    admin: "Admin",
  };

  const roleVariants: Record<string, string> = {
    client: "secondary",
    company: "default",
    admin: "accent",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Utilizadores</h1>
        <p className="text-muted-foreground mt-1">{profiles?.length ?? 0} utilizadores registados</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar utilizador..." className="pl-9" />
      </div>

      {filtered && filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((profile, i) => (
            <motion.div key={profile.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10">
                    {profile.avatar_url ? <AvatarImage src={profile.avatar_url} /> : null}
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{profile.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(profile.created_at)}</p>
                  </div>
                </div>
                <Badge variant={roleVariants[profile.role] as any} className="shrink-0">
                  {profile.role === "company" && <Building2 className="h-3 w-3 mr-1" />}
                  {profile.role === "client" && <User className="h-3 w-3 mr-1" />}
                  {roleLabels[profile.role]}
                </Badge>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Users} title="Nenhum utilizador encontrado" />
      )}
    </div>
  );
}
