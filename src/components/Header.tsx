import { useState } from "react";
import { Heart, LogOut, Users, Copy, Check, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCouple } from "@/hooks/useCouple";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

const Header = () => {
  const { signOut, user } = useAuth();
  const { couple, isLoading, hasPartner, createCouple, joinCouple } = useCouple();
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Wylogowano! Do zobaczenia 💕");
  };

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
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-7 h-7 text-primary animate-heart-beat" fill="currentColor" />
            <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-coral bg-clip-text text-transparent">
              Nasza Przestrzeń
            </h1>
            <Heart className="w-7 h-7 text-primary animate-heart-beat" fill="currentColor" />
          </div>
          
          <div className="flex items-center gap-2">
            {user && (
              <span className="text-sm text-muted-foreground hidden sm:block mr-2">
                {user.email}
              </span>
            )}
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" title={getCoupleTooltip()}>
                  {getCoupleIcon()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
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
                    <p className="text-sm font-medium">Para połączona! 💕</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Wszystkie dane są współdzielone
                    </p>
                  </div>
                ) : couple ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Zaproś partnera</p>
                    <p className="text-xs text-muted-foreground">
                      Podziel się tym kodem ze swoją drugą połówką:
                    </p>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-secondary rounded-xl p-2 font-mono text-center font-bold tracking-wider">
                        {couple.invite_code.toUpperCase()}
                      </div>
                      <Button onClick={copyCode} size="icon" variant="ghost">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
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
                        className="font-mono uppercase text-sm"
                      />
                      <Button 
                        onClick={handleJoinCouple} 
                        variant="outline" 
                        className="w-full" 
                        size="sm"
                        disabled={joinCouple.isPending}
                      >
                        {joinCouple.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Dołącz do innej pary 💕"}
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      Partner musi się zarejestrować i wpisać Twój kod
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Połącz się z partnerem</p>
                    <p className="text-xs text-muted-foreground">
                      Utwórz parę lub dołącz do istniejącej.
                    </p>
                    <Button 
                      onClick={handleCreateCouple} 
                      className="w-full" 
                      size="sm"
                      disabled={createCouple.isPending}
                    >
                      {createCouple.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Utwórz parę"}
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
                        className="font-mono uppercase text-sm"
                      />
                      <Button 
                        onClick={handleJoinCouple} 
                        variant="outline" 
                        className="w-full" 
                        size="sm"
                        disabled={joinCouple.isPending}
                      >
                        {joinCouple.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Dołącz 💕"}
                      </Button>
                    </div>
                  </div>
                )}
              </PopoverContent>
            </Popover>
            
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
