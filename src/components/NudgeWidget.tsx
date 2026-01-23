import { useState } from "react";
import { Heart, Send, Sparkles, Coffee, Moon, Sun, X, Loader2, MessageCircleHeart } from "lucide-react";
import MobileWidgetCard from "@/components/MobileWidgetCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNudges } from "@/hooks/useNudges";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const QUICK_NUDGES = [
  { emoji: "❤️", message: "Kocham Cię!" },
  { emoji: "😘", message: "Buziaczek!" },
  { emoji: "🥰", message: "Myślę o Tobie" },
  { emoji: "☕", message: "Kawa?" },
  { emoji: "🌙", message: "Dobranoc kochanie" },
  { emoji: "☀️", message: "Dzień dobry słonko!" },
  { emoji: "🤗", message: "Przytulas!" },
  { emoji: "💋", message: "Całuski!" },
];

const NudgeWidget = () => {
  const { sendNudge, unreadNudges, markAllAsRead, hasPartner, isLoading } = useNudges();
  const [customMessage, setCustomMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showReceived, setShowReceived] = useState(false);

  const handleSendQuick = async (emoji: string, message: string) => {
    if (!hasPartner) {
      toast.error("Najpierw połącz się z partnerem! 💕");
      return;
    }
    
    setIsSending(true);
    try {
      await sendNudge.mutateAsync({ message, emoji });
      toast.success(`Wysłano: ${emoji} ${message}`);
    } catch (error) {
      toast.error("Nie udało się wysłać zaczepki");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendCustom = async () => {
    if (!customMessage.trim()) return;
    if (!hasPartner) {
      toast.error("Najpierw połącz się z partnerem! 💕");
      return;
    }

    setIsSending(true);
    try {
      await sendNudge.mutateAsync({ message: customMessage.trim(), emoji: "💬" });
      toast.success("Wiadomość wysłana! 💌");
      setCustomMessage("");
    } catch (error) {
      toast.error("Nie udało się wysłać wiadomości");
    } finally {
      setIsSending(false);
    }
  };

  const handleDismissNudges = async () => {
    await markAllAsRead.mutateAsync();
    setShowReceived(false);
  };

  return (
    <MobileWidgetCard
      title="Zaczepka"
      icon={<MessageCircleHeart className="w-5 h-5" />}
      badge={unreadNudges.length > 0 ? unreadNudges.length : undefined}
    >
      <div className="space-y-4">
        {/* Received nudges notification */}
        {unreadNudges.length > 0 && (
          <div 
            className={cn(
              "relative p-3 rounded-xl bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30",
              "border border-rose-200 dark:border-rose-800 cursor-pointer",
              "animate-pulse"
            )}
            onClick={() => setShowReceived(!showReceived)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span className="font-medium text-rose-700 dark:text-rose-300">
                  {unreadNudges.length} nowa zaczepka!
                </span>
              </div>
              <Sparkles className="w-4 h-4 text-rose-400" />
            </div>
            
            {showReceived && (
              <div className="mt-3 space-y-2">
                {unreadNudges.map((nudge) => (
                  <div 
                    key={nudge.id} 
                    className="p-2 bg-white/60 dark:bg-black/20 rounded-lg text-sm"
                  >
                    <span className="mr-2">{nudge.emoji}</span>
                    {nudge.message}
                  </div>
                ))}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="w-full mt-2"
                  onClick={handleDismissNudges}
                >
                  <X className="w-4 h-4 mr-1" />
                  Zamknij
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Quick nudges */}
        <div className="grid grid-cols-4 gap-2">
          {QUICK_NUDGES.map(({ emoji, message }) => (
            <button
              key={message}
              onClick={() => handleSendQuick(emoji, message)}
              disabled={isSending || !hasPartner}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl",
                "bg-secondary/50 hover:bg-secondary transition-all",
                "hover:scale-105 active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              title={message}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                {message.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>

        {/* Custom message */}
        <div className="flex gap-2">
          <Input
            placeholder="Napisz własną wiadomość..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendCustom()}
            disabled={isSending || !hasPartner}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSendCustom}
            disabled={isSending || !customMessage.trim() || !hasPartner}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {!hasPartner && (
          <p className="text-xs text-center text-muted-foreground">
            Połącz się z partnerem, aby wysyłać zaczepki 💕
          </p>
        )}
      </div>
    </MobileWidgetCard>
  );
};

export default NudgeWidget;
