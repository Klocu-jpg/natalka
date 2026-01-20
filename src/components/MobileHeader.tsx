import { Heart, LogOut, Users, Loader2 } from "lucide-react";
import WidgetSettings from "@/components/WidgetSettings";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCouple } from "@/hooks/useCouple";
import { toast } from "sonner";
import { TABS } from "@/config/tabs";

interface MobileHeaderProps {
  activeTab: number;
}

const MobileHeader = ({ activeTab }: MobileHeaderProps) => {
  const { signOut } = useAuth();
  const { isLoading, hasPartner, couple } = useCouple();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Wylogowano! Do zobaczenia 💕");
  };

  const getCoupleIcon = () => {
    if (isLoading) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (hasPartner) return <Users className="w-4 h-4 text-primary" />;
    if (couple) return <Users className="w-4 h-4 text-amber-500" />;
    return null;
  };

  const currentTab = TABS[activeTab];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border/50 pt-safe">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Title with tab icon */}
        <div className="flex items-center gap-2">
          <div className="text-primary">
            {currentTab?.icon || <Heart className="w-5 h-5" fill="currentColor" />}
          </div>
          <h1 className="text-lg font-heading font-bold">
            {currentTab?.label || "Nasza Przestrzeń"}
          </h1>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1">
          {getCoupleIcon()}
          <WidgetSettings />
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-9 w-9">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;