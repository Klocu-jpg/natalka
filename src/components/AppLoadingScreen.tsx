import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

const AppLoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        // Fast start, slow end
        const increment = prev < 50 ? 8 : prev < 80 ? 4 : 1;
        return Math.min(prev + increment, 95);
      });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden pb-[30vh]">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-pulse" />
      </div>

      {/* Heart animation */}
      <div className="relative mb-6 z-10">
        {/* Outer ring */}
        <div className="absolute -inset-4 rounded-full border-2 border-primary/20 animate-[spin_4s_linear_infinite]" />
        <div className="absolute -inset-6 rounded-full border border-primary/10 animate-[spin_6s_linear_infinite_reverse]" />
        
        {/* Heart with pulse */}
        <div className="relative">
          <Heart
            className="w-16 h-16 text-primary drop-shadow-lg"
            fill="hsl(var(--primary))"
            style={{
              animation: "heartbeat 1.2s ease-in-out infinite",
            }}
          />
          {/* Glow behind heart */}
          <div className="absolute inset-0 w-16 h-16 blur-xl bg-primary/30 rounded-full animate-pulse" />
        </div>
      </div>

      {/* App name */}
      <h1
        className="text-2xl font-heading font-bold text-foreground tracking-wide z-10 animate-fade-in"
        style={{ animationDelay: "0.2s", animationFillMode: "both" }}
      >
        LoveApp
      </h1>
      <p
        className="text-xs text-muted-foreground mt-1 z-10 animate-fade-in"
        style={{ animationDelay: "0.4s", animationFillMode: "both" }}
      >
        Ładowanie...
      </p>

      {/* Bottom progress bar */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <div className="h-1 w-full bg-muted/30">
          <div
            className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-r-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* CSS for heartbeat */}
      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.15); }
          30% { transform: scale(1); }
          45% { transform: scale(1.1); }
          60% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default AppLoadingScreen;
