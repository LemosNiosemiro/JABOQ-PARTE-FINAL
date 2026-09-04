import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFoundPage() {
  return (
    <div className="container py-20">
      <EmptyState
        title="Página não encontrada"
        description="A página que procura não existe ou foi movida."
        action={<Button asChild><Link to="/">Voltar ao início</Link></Button>}
        className="max-w-md mx-auto"
      />
    </div>
  );
}
