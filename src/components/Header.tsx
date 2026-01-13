import { Heart } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-3">
          <Heart className="w-7 h-7 text-primary animate-heart-beat" fill="currentColor" />
          <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-coral bg-clip-text text-transparent">
            Nasza Przestrzeń
          </h1>
          <Heart className="w-7 h-7 text-primary animate-heart-beat" fill="currentColor" />
        </div>
      </div>
    </header>
  );
};

export default Header;
