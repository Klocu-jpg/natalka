import { useState } from "react";
import { PiggyBank, Plus, Trash2, TrendingUp, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import { useCouple } from "@/hooks/useCouple";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "sonner";
import WidgetWrapper from "./WidgetWrapper";

const EMOJI_OPTIONS = ["💰", "🏠", "✈️", "🚗", "💍", "🎓", "📱", "🎁", "🏖️", "💎"];

const SavingsGoals = () => {
  const { couple } = useCouple();
  const { goals, contributions, isLoading, addGoal, addContribution, deleteGoal, totalSaved, totalTarget } = useSavingsGoals();
  
  const [isGoalOpen, setIsGoalOpen] = useState(false);
  const [isContribOpen, setIsContribOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  
  // Goal form
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("💰");
  
  // Contribution form
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const handleAddGoal = async () => {
    if (!title.trim() || !targetAmount) {
      toast.error("Wypełnij nazwę i kwotę");
      return;
    }
    try {
      await addGoal.mutateAsync({ 
        title: title.trim(), 
        target_amount: parseFloat(targetAmount),
        deadline: deadline || undefined,
        emoji: selectedEmoji
      });
      toast.success("Dodano cel! 💰");
      setTitle("");
      setTargetAmount("");
      setDeadline("");
      setSelectedEmoji("💰");
      setIsGoalOpen(false);
    } catch {
      toast.error("Nie udało się dodać");
    }
  };

  const handleAddContribution = async () => {
    if (!amount || !selectedGoalId) {
      toast.error("Podaj kwotę");
      return;
    }
    try {
      await addContribution.mutateAsync({ 
        goal_id: selectedGoalId,
        amount: parseFloat(amount),
        note: note || undefined
      });
      toast.success("Dodano wpłatę! 🎉");
      setAmount("");
      setNote("");
      setIsContribOpen(false);
    } catch {
      toast.error("Nie udało się dodać");
    }
  };

  const openContribution = (goalId: string) => {
    setSelectedGoalId(goalId);
    setIsContribOpen(true);
  };

  const getGoalContributions = (goalId: string) => 
    contributions.filter(c => c.goal_id === goalId);

  if (!couple) {
    return (
      <WidgetWrapper
        title="Oszczędności"
        icon={<PiggyBank className="w-5 h-5 text-primary" />}
        iconBg="bg-rose-light"
      >
        <p className="text-sm text-muted-foreground text-center py-4">
          Najpierw połącz się z partnerem 💕
        </p>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper
      title="Oszczędności"
      icon={<PiggyBank className="w-5 h-5 text-primary-foreground" />}
      iconBg="gradient-primary"
      actions={
        <Dialog open={isGoalOpen} onOpenChange={setIsGoalOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nowy cel oszczędnościowy</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="flex gap-2 flex-wrap">
                {EMOJI_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`text-2xl p-2 rounded-lg transition-colors ${
                      selectedEmoji === emoji ? "bg-primary/20" : "hover:bg-secondary"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Nazwa celu (np. Wakacje)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Kwota docelowa (PLN)"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                min="0"
              />
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              <Button onClick={handleAddGoal} className="w-full" disabled={addGoal.isPending}>
                {addGoal.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Dodaj cel"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Contribution dialog */}
      <Dialog open={isContribOpen} onOpenChange={setIsContribOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj wpłatę</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              type="number"
              placeholder="Kwota (PLN)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
            />
            <Input
              placeholder="Notatka (opcjonalne)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button onClick={handleAddContribution} className="w-full" disabled={addContribution.isPending}>
              {addContribution.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Dodaj wpłatę"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-6">
          <PiggyBank className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">
            Brak celów oszczędnościowych
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Dodaj wspólny cel, np. wakacje!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Total summary */}
          {totalTarget > 0 && (
            <div className="bg-gradient-to-r from-primary/10 to-coral/10 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Razem oszczędzone</span>
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">
                {totalSaved.toLocaleString()} / {totalTarget.toLocaleString()} PLN
              </div>
              <Progress value={(totalSaved / totalTarget) * 100} className="mt-2 h-2" />
            </div>
          )}

          {/* Goals list */}
          <div className="space-y-3">
            {goals.map((goal) => {
              const progress = goal.target_amount > 0 
                ? (Number(goal.current_amount) / Number(goal.target_amount)) * 100 
                : 0;
              const goalContributions = getGoalContributions(goal.id);
              const isExpanded = expandedGoal === goal.id;

              return (
                <Collapsible 
                  key={goal.id} 
                  open={isExpanded}
                  onOpenChange={() => setExpandedGoal(isExpanded ? null : goal.id)}
                >
                  <div className="bg-secondary/50 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{goal.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{goal.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {Number(goal.current_amount).toLocaleString()} / {Number(goal.target_amount).toLocaleString()} PLN
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openContribution(goal.id)}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Wpłać
                      </Button>
                    </div>
                    
                    <Progress value={progress} className="h-2" />
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{Math.round(progress)}% celu</span>
                      {goal.deadline && (
                        <span>Do: {format(new Date(goal.deadline), "d MMM yyyy", { locale: pl })}</span>
                      )}
                    </div>

                    {goalContributions.length > 0 && (
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full mt-2">
                          {isExpanded ? (
                            <><ChevronUp className="w-4 h-4 mr-1" /> Ukryj historię</>
                          ) : (
                            <><ChevronDown className="w-4 h-4 mr-1" /> Historia wpłat ({goalContributions.length})</>
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    )}
                  </div>

                  <CollapsibleContent>
                    <div className="mt-2 space-y-1 pl-4 border-l-2 border-primary/20">
                      {goalContributions.map((contrib) => (
                        <div key={contrib.id} className="flex items-center justify-between text-sm py-1">
                          <div>
                            <span className="text-primary font-medium">+{Number(contrib.amount).toLocaleString()} PLN</span>
                            {contrib.note && <span className="text-muted-foreground ml-2">• {contrib.note}</span>}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(contrib.created_at), "d MMM", { locale: pl })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </div>
      )}
    </WidgetWrapper>
  );
};

export default SavingsGoals;
