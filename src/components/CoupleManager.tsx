import { useState } from "react";
import { Users, Copy, Check, UserPlus, Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCouple } from "@/hooks/useCouple";
import { toast } from "sonner";

const CoupleManager = () => {
  const { couple, isLoading, createCouple, joinCouple, hasPartner } = useCouple();
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateCouple = async () => {
    try {
      await createCouple.mutateAsync();
      toast.success("Para utworzona! Podziel się kodem ze swoją drugą połówką 💕");
    } catch (error) {
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
      toast.success("Dołączyłeś/aś do pary! 💕");
      setDialogOpen(false);
      setInviteCode("");
    } catch (error: any) {
      toast.error(error.message || "Nieprawidłowy kod");
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

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-card p-6 animate-slide-up">
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Already in a couple with partner
  if (couple && hasPartner) {
    return (
      <div className="bg-card rounded-2xl shadow-card p-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
          </div>
          <h2 className="text-xl font-heading font-semibold">Wasza Para</h2>
        </div>
        <div className="flex items-center justify-center gap-2 py-4">
          <div className="w-12 h-12 rounded-full bg-rose-light flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <Heart className="w-6 h-6 text-primary animate-heart-beat" fill="currentColor" />
          <div className="w-12 h-12 rounded-full bg-coral-light flex items-center justify-center">
            <Users className="w-6 h-6 text-coral" />
          </div>
        </div>
        <p className="text-center text-muted-foreground text-sm">
          Jesteście połączeni! Wszystkie dane są współdzielone 💕
        </p>
      </div>
    );
  }

  // Created couple but waiting for partner
  if (couple && !hasPartner) {
    return (
      <div className="bg-card rounded-2xl shadow-card p-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-light flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-heading font-semibold">Zaproś partnera</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Podziel się tym kodem ze swoją drugą połówką:
        </p>
        <div className="flex gap-2">
          <div className="flex-1 bg-secondary rounded-xl p-3 font-mono text-lg text-center font-bold tracking-wider">
            {couple.invite_code.toUpperCase()}
          </div>
          <Button onClick={copyCode} size="icon" variant="soft">
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Partner musi się zarejestrować i wpisać ten kod
        </p>
      </div>
    );
  }

  // No couple yet
  return (
    <div className="bg-card rounded-2xl shadow-card p-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-rose-light flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-heading font-semibold">Połącz się z partnerem</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Utwórz parę lub dołącz do istniejącej, żeby współdzielić dane.
      </p>
      <div className="space-y-3">
        <Button onClick={handleCreateCouple} className="w-full" disabled={createCouple.isPending}>
          {createCouple.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Utwórz parę"}
        </Button>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              Mam kod zaproszenia
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">Dołącz do pary</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Kod zaproszenia</label>
                <Input
                  placeholder="np. a1b2c3d4"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="rounded-xl font-mono uppercase"
                />
              </div>
              <Button onClick={handleJoinCouple} className="w-full" disabled={joinCouple.isPending}>
                {joinCouple.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Dołącz 💕"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CoupleManager;
