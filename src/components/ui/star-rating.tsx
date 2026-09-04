import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  count?: number;
  className?: string;
}

export function StarRating({ rating, size = "md", showValue = false, count, className }: StarRatingProps) {
  const sizes = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" };
  const starSize = sizes[size];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starSize,
              star <= Math.round(rating)
                ? "fill-accent text-accent"
                : "fill-muted text-muted-foreground/30"
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-foreground">
          {rating.toFixed(1)}
        </span>
      )}
      {count != null && count > 0 && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
