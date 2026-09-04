import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOpsTasks } from "@/features/operations/operations-service";
import { Activity, Clock3 } from "lucide-react";

export function OperationalAdminPage() {
  const tasks = getOpsTasks();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Operacional</p>
        <h2 className="font-display text-3xl font-bold">Gestão operacional</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Em curso", value: tasks.filter((task) => task.status === "em andamento").length },
          { label: "Pendentes", value: tasks.filter((task) => task.status === "pendente").length },
          { label: "Concluídas", value: tasks.filter((task) => task.status === "concluida").length },
        ].map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-3 text-3xl font-bold">{item.value}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {tasks.map((task, index) => (
          <motion.div key={task.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card className="p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Activity className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">{task.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Responsável: {task.owner}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={task.priority === "alta" ? "destructive" : task.priority === "media" ? "warning" : "secondary"}>
                    {task.priority}
                  </Badge>
                  <Badge variant={task.status === "concluida" ? "success" : task.status === "em andamento" ? "default" : "outline"}>
                    {task.status}
                  </Badge>
                  <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    {task.deadline}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
