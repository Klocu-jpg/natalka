import { useState } from "react";
import { Heart, Users, Copy, Check, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCouple } from "@/hooks/useCouple";

type TriggerRender = (args: {
  isLoading: boolean;
  hasPartner: boolean;
  hasCouple: boolean;
}) => React.ReactNode;

interface CoupleConnectPopoverProps {
  trigger: TriggerRender;
}

const CoupleConnectPopover = ({ trigger }: CoupleConnectPopoverProps) => {
  const { couple, isLoading, hasPartner, createCouple, joinCouple } = useCouple();
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCreateCouple = async () => {
    try {
      await createCouple.mutateAsync();
      toast.success("Para utworzona! Podziel się kodem");
    } catch {
      toast.error("Nie udało się utworzyć pary");
    }
  };

  const handleJoinCouple = async () => {
    if (!inviteCode.trim()) {
      toast.error("Wpisz kod zaproszenia");
      return;
    }
    try {
      await joinCouple.mutateAsync(inviteCode);
      toast.success("Dołączono do pary!");
      setInviteCode("");
    } catch (error: any) {
      console.error("[joinCouple] error", error);
      toast.error(error?.message || "Nieprawidłowy kod");
    }
  };

  const copyCode = () => {
    if (couple?.invite_code) {
      navigator.clipboard.writeText(couple.invite_code);
      setCopied(true);
      toast.success("Kod skopiowany!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger({ isLoading, hasPartner, hasCouple: !!couple })}
      </PopoverTrigger>

      <PopoverContent className="w-80 mx-3" align="end">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : hasPartner ? (
          <div className="text-center py-2">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-light flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <Heart className="w-5 h-5 text-primary animate-heart-beat" fill="currentColor" />
              <div className="w-10 h-10 rounded-full bg-coral-light flex items-center justify-center">
                <Users className="w-5 h-5 text-coral" />
              </div>
            </div>
            <p className="text-sm font-medium">Para połączona!</p>
            <p className="text-xs text-muted-foreground mt-1">Wszystkie dane są współdzielone</p>
          </div>
        ) : couple ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Zaproś partnera</p>
            <p className="text-xs text-muted-foreground">Podziel się tym kodem:</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-secondary rounded-xl p-3 font-mono text-center font-bold tracking-wider text-lg">
                {couple.invite_code.toUpperCase()}
              </div>
              <Button onClick={copyCode} size="icon" variant="ghost" className="h-12 w-12">
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-popover px-2 text-muted-foreground">lub dołącz do innej pary</span>
              </div>
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Wpisz kod zaproszenia"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="font-mono uppercase text-base h-12"
              />
              <Button
                onClick={handleJoinCouple}
                variant="outline"
                className="w-full h-12"
                disabled={joinCouple.isPending}
              >
                {joinCouple.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Dołącz do innej pary"
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Partner musi się zarejestrować i wpisać Twój kod
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium">Połącz się z partnerem</p>
            <p className="text-xs text-muted-foreground">Utwórz parę lub dołącz do istniejącej.</p>

            <Button onClick={handleCreateCouple} className="w-full h-12" disabled={createCouple.isPending}>
              {createCouple.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Utwórz parę"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-popover px-2 text-muted-foreground">lub</span>
              </div>
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Wpisz kod zaproszenia"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="font-mono uppercase text-base h-12"
              />
              <Button
                onClick={handleJoinCouple}
                variant="outline"
                className="w-full h-12"
                disabled={joinCouple.isPending}
              >
                {joinCouple.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Dołącz"}
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default CoupleConnectPopover;
