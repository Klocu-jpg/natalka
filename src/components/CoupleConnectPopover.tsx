import { useState } from "react";
import { Heart, Users, Copy, Check, UserPlus, Loader2, LogOut, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  const { couple, isLoading, hasPartner, createCouple, joinCouple, leaveCouple, memberCount, isFull } = useCouple();
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);

  const inviteUrl = couple
    ? `${window.location.origin}/zaproszenie/${couple.invite_code}`
    : "";

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
    // Allow pasting the full invite URL too
    const match = inviteCode.match(/\/zaproszenie\/([^/?#\s]+)/i);
    const code = (match ? match[1] : inviteCode).trim();
    try {
      await joinCouple.mutateAsync(code);
      toast.success("Dołączono do pary!");
      setInviteCode("");
    } catch (error: any) {
      console.error("[joinCouple] error", error);
      toast.error(error?.message || "Nieprawidłowy kod");
    }
  };

  const copyLink = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Link skopiowany!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLink = async () => {
    if (!inviteUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Dołącz do mnie w LoveApp 💕",
          text: "Kliknij, żeby połączyć się ze mną w LoveApp:",
          url: inviteUrl,
        });
        return;
      } catch {
        // user cancelled — fall back to copy
      }
    }
    copyLink();
  };

  const handleLeaveCouple = async () => {
    try {
      await leaveCouple.mutateAsync();
      toast.success("Opuszczono parę");
    } catch (error: any) {
      toast.error(error?.message || "Nie udało się opuścić pary");
    }
  };

  const leaveButton = (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-12 text-destructive hover:text-destructive"
          disabled={leaveCouple.isPending}
        >
          {leaveCouple.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <LogOut className="w-4 h-4 mr-2" />
              Opuść parę
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Opuścić parę?</AlertDialogTitle>
          <AlertDialogDescription>
            {hasPartner
              ? "Stracisz dostęp do wspólnych danych. Partner zostanie w parze i otrzyma nowy kod zaproszenia."
              : "Para zostanie usunięta. Będziesz mógł utworzyć nową lub dołączyć do innej."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={handleLeaveCouple}>Opuść</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

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
        ) : hasPartner && isFull ? (
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
            <p className="text-sm font-medium">Grupa pełna ({memberCount}/4)</p>
            <p className="text-xs text-muted-foreground mt-1">Wszystkie dane są współdzielone</p>
            <div className="mt-4">{leaveButton}</div>
          </div>
        ) : couple ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {hasPartner ? `Zaproś kolejną osobę` : `Zaproś partnera`}
              </p>
              <span className="text-xs text-muted-foreground">{memberCount}/4</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Wyślij ten link — kliknięcie automatycznie dołączy do Waszej grupy (do 4 osób):
            </p>
            <div className="flex items-center gap-2 bg-secondary rounded-xl p-2 pl-3">
              <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 text-xs font-mono truncate" title={inviteUrl}>
                {inviteUrl.replace(/^https?:\/\//, "")}
              </div>
              <Button onClick={copyLink} size="icon" variant="ghost" className="h-8 w-8 shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <Button onClick={shareLink} className="w-full h-11">
              <Share2 className="w-4 h-4 mr-2" />
              Udostępnij link
            </Button>

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
                placeholder="Wklej link lub kod zaproszenia"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="text-base h-12"
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
              Partner po kliknięciu w link założy konto i automatycznie dołączy do pary.
            </p>
            {leaveButton}
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
                placeholder="Wklej link lub kod zaproszenia"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="text-base h-12"
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
