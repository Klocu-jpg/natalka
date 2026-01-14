import { useState } from "react";
import { UtensilsCrossed, Plus, Loader2, ChefHat, X, ShoppingCart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useMeals, Meal } from "@/hooks/useMeals";
import { useShoppingItems } from "@/hooks/useShoppingItems";
import { toast } from "sonner";
import WidgetWrapper from "./WidgetWrapper";

const DAYS = [
  { id: 0, short: "Pn", full: "Poniedziałek" },
  { id: 1, short: "Wt", full: "Wtorek" },
  { id: 2, short: "Śr", full: "Środa" },
  { id: 3, short: "Cz", full: "Czwartek" },
  { id: 4, short: "Pt", full: "Piątek" },
  { id: 5, short: "So", full: "Sobota" },
  { id: 6, short: "Nd", full: "Niedziela" },
];

const MealsPlanner = () => {
  const { meals, isLoading, addMeal, deleteMeal, getMealsForDay } = useMeals();
  const { addItem } = useShoppingItems();
  const [selectedDay, setSelectedDay] = useState(0);
  const [newMeal, setNewMeal] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const handleAddMeal = () => {
    if (newMeal.trim()) {
      addMeal.mutate({ name: newMeal, dayOfWeek: selectedDay });
      setNewMeal("");
      setAddDialogOpen(false);
    }
  };

  const handleAddIngredientsToShoppingList = async (meal: Meal) => {
    if (!meal.ingredients || meal.ingredients.length === 0) {
      toast.error("Brak składników do dodania");
      return;
    }

    for (const ingredient of meal.ingredients) {
      await addItem.mutateAsync(`${ingredient.name} (${ingredient.amount})`);
    }
    toast.success(`Dodano ${meal.ingredients.length} składników do listy zakupów! 🛒`);
  };

  const openRecipe = (meal: Meal) => {
    setSelectedMeal(meal);
    setRecipeDialogOpen(true);
  };

  return (
    <WidgetWrapper
      title="Plan Obiadów"
      icon={<UtensilsCrossed className="w-5 h-5 text-primary-foreground" />}
      iconBg="gradient-primary"
      actions={
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="soft" className="h-8 w-8">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                Dodaj obiad na {DAYS[selectedDay].full}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Np. Spaghetti bolognese..."
                value={newMeal}
                onChange={(e) => setNewMeal(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !addMeal.isPending && handleAddMeal()}
                className="rounded-xl"
              />
              <p className="text-sm text-muted-foreground">
                AI automatycznie wygeneruje przepis i listę składników 🤖
              </p>
              <Button 
                onClick={handleAddMeal} 
                className="w-full" 
                disabled={addMeal.isPending || !newMeal.trim()}
              >
                {addMeal.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generuję przepis...
                  </>
                ) : (
                  "Dodaj obiad"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <Tabs value={String(selectedDay)} onValueChange={(v) => setSelectedDay(Number(v))}>
        <TabsList className="w-full grid grid-cols-7 mb-4">
          {DAYS.map((day) => (
            <TabsTrigger
              key={day.id}
              value={String(day.id)}
              className="text-xs px-1"
            >
              {day.short}
            </TabsTrigger>
          ))}
        </TabsList>

        {DAYS.map((day) => {
          const dayMeals = getMealsForDay(day.id);
          return (
            <TabsContent key={day.id} value={String(day.id)} className="mt-0">
              <div className="space-y-2">
                <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-3">
                  {day.full}
                </h3>

                {isLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                ) : dayMeals.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6 text-sm">
                    Brak zaplanowanych obiadów 🍽️
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {dayMeals.map((meal) => (
                      <li
                        key={meal.id}
                        className="bg-secondary rounded-xl p-3 group hover:shadow-card transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openRecipe(meal)}
                            className="flex-1 text-left flex items-center gap-2 hover:text-primary transition-colors"
                          >
                            <BookOpen className="w-4 h-4 text-primary" />
                            <span className="font-medium">{meal.name}</span>
                          </button>
                          <button
                            onClick={() => deleteMeal.mutate(meal.id)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {meal.ingredients && meal.ingredients.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1 ml-6">
                            {meal.ingredients.length} składników
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Recipe Dialog */}
      <Dialog open={recipeDialogOpen} onOpenChange={setRecipeDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedMeal && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-primary" />
                  {selectedMeal.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                {/* Ingredients */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-heading font-semibold">Składniki</h4>
                    <Button
                      variant="soft"
                      size="sm"
                      onClick={() => handleAddIngredientsToShoppingList(selectedMeal)}
                      disabled={addItem.isPending}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Do listy zakupów
                    </Button>
                  </div>
                  <ul className="bg-secondary rounded-xl p-3 space-y-1">
                    {selectedMeal.ingredients?.map((ing, idx) => (
                      <li key={idx} className="text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        <span className="flex-1">{ing.name}</span>
                        <span className="text-muted-foreground">{ing.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recipe */}
                <div>
                  <h4 className="font-heading font-semibold mb-2">Przepis</h4>
                  <div className="bg-rose-light/50 rounded-xl p-4">
                    <p className="text-sm whitespace-pre-wrap">{selectedMeal.recipe}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </WidgetWrapper>
  );
};

export default MealsPlanner;
