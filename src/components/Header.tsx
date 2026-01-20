import { useState } from "react";
import { Heart, LogOut, Users, Copy, Check, UserPlus, Loader2 } from "lucide-react";
import WidgetSettings from "@/components/WidgetSettings";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCouple } from "@/hooks/useCouple";
import { toast } from "sonner";
import CoupleConnectPopover from "@/components/CoupleConnectPopover";

const Header = () => {
  const { signOut, user } = useAuth();
  const { couple, isLoading, hasPartner } = useCouple();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Wylogowano! Do zobaczenia 💕");
  };


  const getCoupleIcon = () => {
    if (isLoading) return <Loader2 className="w-5 h-5 animate-spin" />;
    if (hasPartner) return <Users className="w-5 h-5 text-primary" />;
    if (couple) return <UserPlus className="w-5 h-5 text-amber-500" />;
    return <Users className="w-5 h-5 text-muted-foreground" />;
  };

  const getCoupleTooltip = () => {
    if (hasPartner) return "Para połączona 💕";
    if (couple) return "Czeka na partnera";
    return "Połącz się z partnerem";
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50 pt-safe">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 mobile-compact-header">
        <div className="flex items-center justify-between">
          {/* Logo - compact on mobile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-primary animate-heart-beat" fill="currentColor" />
            <h1 className="text-lg sm:text-2xl font-heading font-bold bg-gradient-to-r from-primary to-coral bg-clip-text text-transparent">
              Nasza Przestrzeń
            </h1>
          </div>
          
          {/* Actions - optimized for touch */}
          <div className="flex items-center gap-1 sm:gap-2">
            <CoupleConnectPopover
              trigger={() => (
                <Button variant="ghost" size="icon" title={getCoupleTooltip()} className="h-10 w-10">
                  {getCoupleIcon()}
                </Button>
              )}
            />
            
            <WidgetSettings />
            
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-10 w-10">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;