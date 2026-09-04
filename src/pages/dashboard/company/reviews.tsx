import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/lib/auth";
import { useCompanyByOwner, useCompanyReviews } from "@/lib/queries";
import { timeAgo, getInitials } from "@/lib/utils";

export function CompanyReviews() {
  const { profile } = useAuth();
  const { data: company } = useCompanyByOwner(profile?.id);
  const { data: reviews } = useCompanyReviews(company?.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Avaliações</h1>
        <p className="text-muted-foreground mt-1">Feedback dos seus clientes</p>
      </div>

      {company && (
        <Card className="p-6 flex items-center gap-6">
          <div className="text-center">
            <p className="font-display text-4xl font-bold">{company.rating.toFixed(1)}</p>
            <StarRating rating={company.rating} size="sm" className="mt-1 justify-center" />
            <p className="text-xs text-muted-foreground mt-1">{company.review_count} avaliações</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews?.filter((r) => r.rating === star).length ?? 0;
              const pct = reviews?.length ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs w-6 text-muted-foreground">{star}★</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs w-8 text-muted-foreground text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {reviews && reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review, i) => (
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
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Star}
          title="Nenhuma avaliação ainda"
          description="As avaliações dos clientes aparecerão aqui."
        />
      )}
    </div>
  );
}
