export interface OpsTask {
  id: string;
  title: string;
  owner: string;
  priority: "alta" | "media" | "baixa";
  deadline: string;
  status: "pendente" | "em andamento" | "concluida";
}

export const opsSeed: OpsTask[] = [
  {
    id: "ops-1",
    title: "Revisar calendário de eventos da próxima semana",
    owner: "Operações",
    priority: "alta",
    deadline: "2026-09-04",
    status: "em andamento",
  },
  {
    id: "ops-2",
    title: "Confirmar fornecedores para festas corporativas",
    owner: "Comercial",
    priority: "media",
    deadline: "2026-09-05",
    status: "pendente",
  },
  {
    id: "ops-3",
    title: "Validar entrega de materiais de decoração",
    owner: "Logística",
    priority: "alta",
    deadline: "2026-09-06",
    status: "pendente",
  },
];

export async function fetchOpsTasks(): Promise<OpsTask[]> {
  try {
    const response = await fetch("http://localhost:4000/api/operations");
    if (!response.ok) return getOpsTasks();

    const payload = (await response.json()) as { tasks?: OpsTask[] };
    return payload.tasks ?? getOpsTasks();
  } catch {
    return getOpsTasks();
  }
}

export function getOpsTasks() {
  return opsSeed;
}
