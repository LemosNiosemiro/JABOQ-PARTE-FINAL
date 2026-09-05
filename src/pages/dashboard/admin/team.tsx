import { useMemo, useState } from "react";
import { Building2, BriefcaseBusiness, Search, ShieldCheck, Users, UserRound, UserRoundCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toaster";
import { useAdminProfiles, useUpdateAdminProfileType } from "@/lib/queries";
import { type AccountType, type Profile } from "@/lib/types";
import { formatDate, getInitials } from "@/lib/utils";

const accountTypeOptions: { value: AccountType; label: string; description: string; icon: typeof Users; color: string }[] = [
  { value: "standard", label: "Utilizador padrão", description: "Sem classificação interna", icon: UserRound, color: "secondary" },
  { value: "collaborator", label: "Colaborador", description: "Apoio e colaboração com a JABOQUE", icon: Users, color: "default" },
  { value: "fixed_employee", label: "Funcionário fixo", description: "Membro permanente da equipa", icon: BriefcaseBusiness, color: "accent" },
  { value: "institutional_client", label: "Cliente institucional", description: "Organização ou cliente empresarial", icon: Building2, color: "success" },
];

const roleLabels: Record<Profile["role"], string> = { admin: "Administrador", company: "Empresa", client: "Cliente" };

function getAccountType(type: AccountType | undefined) {
  return accountTypeOptions.find((option) => option.value === (type ?? "standard")) ?? accountTypeOptions[0];
}

export function AdminTeam() {
  const { data: profiles } = useAdminProfiles();
  const updateType = useUpdateAdminProfileType();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<AccountType | "all">("all");

  const counts = useMemo(() => accountTypeOptions.reduce<Record<AccountType, number>>((total, option) => {
    total[option.value] = profiles?.filter((profile) => (profile.account_type ?? "standard") === option.value).length ?? 0;
    return total;
  }, { standard: 0, collaborator: 0, fixed_employee: 0, institutional_client: 0 }), [profiles]);

  const filteredProfiles = profiles?.filter((profile) => {
    const term = search.toLowerCase();
    const matchesSearch = profile.full_name.toLowerCase().includes(term) || profile.email.toLowerCase().includes(term);
    const matchesFilter = filter === "all" || (profile.account_type ?? "standard") === filter;
    return matchesSearch && matchesFilter;
  });

  const handleTypeChange = (profile: Profile, accountType: AccountType) => {
    updateType.mutate({ id: profile.id, account_type: accountType }, {
      onSuccess: () => toast({ title: "Classificação atualizada", variant: "success" }),
      onError: (error) => toast({ title: "Não foi possível atualizar", description: error.message, variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Controle de funcionários</h1>
        <p className="mt-1 text-muted-foreground">Organize colaboradores, funcionários fixos e clientes institucionais.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {accountTypeOptions.map((option) => (
          <button key={option.value} type="button" onClick={() => setFilter(option.value)} className="text-left">
            <Card className={`h-full p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${filter === option.value ? "ring-2 ring-primary" : ""}`}>
              <div className="flex items-center justify-between">
                <option.icon className="h-5 w-5 text-primary" />
                <span className="font-display text-2xl font-bold">{counts[option.value]}</span>
              </div>
              <p className="mt-3 text-sm font-semibold">{option.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
            </Card>
          </button>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar por nome ou email..." className="pl-9" />
          </div>
          <Select value={filter} onValueChange={(value) => setFilter(value as AccountType | "all")}>
            <SelectTrigger className="w-full md:w-64"><SelectValue placeholder="Todos os perfis" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os perfis</SelectItem>
              {accountTypeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {filteredProfiles && filteredProfiles.length > 0 ? (
        <div className="space-y-3">
          {filteredProfiles.map((profile, index) => {
            const type = getAccountType(profile.account_type);
            return (
              <motion.div key={profile.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                <Card className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {profile.avatar_url ? <AvatarImage src={profile.avatar_url} /> : null}
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">{getInitials(profile.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{profile.full_name}</p>
                      <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{roleLabels[profile.role]} · Registado em {formatDate(profile.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 md:justify-end">
                    <Badge variant={type.color as "default"} className="gap-1"><type.icon className="h-3 w-3" />{type.label}</Badge>
                    <Select value={profile.account_type ?? "standard"} onValueChange={(value) => handleTypeChange(profile, value as AccountType)} disabled={updateType.isPending}>
                      <SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger>
                      <SelectContent>{accountTypeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <UserRoundCheck className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 font-semibold">Nenhum perfil encontrado</p>
          <p className="mt-1 text-sm text-muted-foreground">Ajuste a pesquisa ou selecione outra categoria.</p>
        </Card>
      )}
    </div>
  );
}