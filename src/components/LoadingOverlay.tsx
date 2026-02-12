import { useLoading } from "@/contexts/LoadingContext";
import { Heart } from "lucide-react";

const LoadingOverlay = () => {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/70 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card shadow-xl border border-border/50">
        <div className="relative">
          <Heart className="w-10 h-10 text-primary animate-pulse" fill="hsl(var(--primary))" />
          <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-primary/30 animate-ping" />
        </div>
        <p className="text-sm font-medium text-foreground max-w-[200px] text-center">
          {loadingMessage}
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
