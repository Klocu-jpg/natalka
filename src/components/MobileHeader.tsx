import { Heart, LogOut, Users, Loader2, UserPlus, Bell, BellOff } from "lucide-react";
import WidgetSettings from "@/components/WidgetSettings";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { TABS } from "@/config/tabs";
import CoupleConnectPopover from "@/components/CoupleConnectPopover";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface MobileHeaderProps {
  activeTab: number;
}

const MobileHeader = ({ activeTab }: MobileHeaderProps) => {
  const { signOut } = useAuth();
  const { isSupported, isSubscribed, subscribe, unsubscribe, permission } = usePushNotifications();

  const handleTogglePush = async () => {
    if (isSubscribed) {
      await unsubscribe();
      toast.success("Powiadomienia wyłączone");
    } else {
      if (permission === "denied") {
        toast.error("Powiadomienia są zablokowane w ustawieniach przeglądarki/telefonu. Odblokuj je w ustawieniach.");
        return;
      }
      const success = await subscribe();
      if (success) {
        toast.success("Powiadomienia włączone! 🔔");
      } else if (typeof Notification !== "undefined" && Notification.permission === "denied") {
        toast.error("Powiadomienia są zablokowane. Zmień uprawnienia w ustawieniach.");
      } else {
        toast.error("Nie udało się włączyć powiadomień. Upewnij się, że aplikacja jest dodana do ekranu głównego.");
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Wylogowano!");
  };

  const currentTab = TABS[activeTab];

  return (
    <header className="sticky top-0 z-50 bg-card/98 backdrop-blur-xl border-b border-border/30 pt-safe shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Title with tab icon */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {currentTab?.icon || <Heart className="w-5 h-5" fill="currentColor" />}
          </div>
           <h1 className="text-lg font-heading font-bold text-foreground">
            {currentTab?.label || "Love App"}
          </h1>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <CoupleConnectPopover
            trigger={({ isLoading, hasPartner, hasCouple }) => (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl"
                title={hasPartner ? "Para połączona" : hasCouple ? "Czeka na partnera" : "Połącz się z partnerem"}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : hasPartner ? (
                  <Users className="w-4 h-4 text-primary" />
                ) : hasCouple ? (
                  <UserPlus className="w-4 h-4 text-amber-500" />
                ) : (
                  <Users className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            )}
          />
          {isSupported && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleTogglePush}
              className="h-9 w-9 rounded-xl"
              title={isSubscribed ? "Wyłącz powiadomienia" : "Włącz powiadomienia"}
            >
              {isSubscribed ? (
                <Bell className="w-4 h-4 text-primary" />
              ) : (
                <BellOff className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          )}
          <WidgetSettings />
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-9 w-9 rounded-xl">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;