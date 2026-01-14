import { useState } from "react";
import { UtensilsCrossed, Plus, Loader2, ChefHat, X, ShoppingCart, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useMeals, Meal } from "@/hooks/useMeals";
import { useShoppingItems } from "@/hooks/useShoppingItems";
import { useFavoriteRecipes } from "@/hooks/useFavoriteRecipes";
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
  const { addFavoriteRecipe, isRecipeFavorite } = useFavoriteRecipes();
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

  const handleAddSingleIngredient = async (ingredientName: string, ingredientAmount: string) => {
    await addItem.mutateAsync(`${ingredientName} (${ingredientAmount})`);
    toast.success(`Dodano "${ingredientName}" do listy zakupów! 🛒`);
  };

  const openRecipe = (meal: Meal) => {
    setSelectedMeal(meal);
    setRecipeDialogOpen(true);
  };

  const handleSaveToFavorites = (meal: Meal) => {
    if (!meal.recipe || !meal.ingredients) {
      toast.error("Przepis nie jest kompletny");
      return;
    }
    addFavoriteRecipe.mutate({
      name: meal.name,
      recipe: meal.recipe,
      ingredients: meal.ingredients,
    });
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
          {DAYS.map((day) => {
            const hasMeals = getMealsForDay(day.id).length > 0;
            return (
              <TabsTrigger
                key={day.id}
                value={String(day.id)}
                className={cn(
                  "text-xs px-1 relative",
                  hasMeals && "font-semibold"
                )}
              >
                {day.short}
                {hasMeals && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary" />
                )}
              </TabsTrigger>
            );
          })}
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
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          {selectedMeal && (
            <>
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="font-heading text-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <ChefHat className="w-5 h-5 text-primary-foreground" />
                  </div>
                  {selectedMeal.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 pt-6">
                {/* Save to favorites */}
                <div className="flex gap-2">
                  <Button
                    variant={isRecipeFavorite(selectedMeal.name) ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => handleSaveToFavorites(selectedMeal)}
                    disabled={addFavoriteRecipe.isPending || isRecipeFavorite(selectedMeal.name)}
                    className="gap-2 flex-1"
                  >
                    <Star className={cn("w-4 h-4", isRecipeFavorite(selectedMeal.name) && "fill-amber-500 text-amber-500")} />
                    {isRecipeFavorite(selectedMeal.name) ? "W ulubionych" : "Zapisz do ulubionych"}
                  </Button>
                </div>

                {/* Ingredients */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-heading font-semibold text-lg">🧂 Składniki</h4>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAddIngredientsToShoppingList(selectedMeal)}
                      disabled={addItem.isPending}
                      className="gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Dodaj do zakupów
                    </Button>
                  </div>
                  <div className="bg-secondary rounded-2xl p-4">
                    <ul className="grid grid-cols-1 gap-2">
                      {selectedMeal.ingredients?.map((ing, idx) => (
                        <li key={idx} className="flex items-center gap-3 p-2 bg-background/60 rounded-xl group/item">
                          <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                            {idx + 1}
                          </span>
                          <span className="flex-1 font-medium text-sm">{ing.name}</span>
                          <span className="text-muted-foreground text-sm bg-muted px-2 py-0.5 rounded-lg shrink-0">{ing.amount}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 opacity-60 hover:opacity-100 hover:bg-primary/20 hover:text-primary"
                            onClick={() => handleAddSingleIngredient(ing.name, ing.amount)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recipe */}
                <div>
                  <h4 className="font-heading font-semibold text-lg mb-3">👨‍🍳 Przepis krok po kroku</h4>
                  <div className="bg-gradient-to-br from-rose-light/70 to-coral-light/50 rounded-2xl p-5 border border-primary/10">
                    <div className="prose prose-sm max-w-none">
                      {selectedMeal.recipe?.split('\n').map((line, idx) => {
                        const trimmed = line.trim();
                        if (!trimmed) return null;
                        
                        // Check if line starts with a number (step)
                        const isStep = /^\d+[\.\)]/.test(trimmed);
                        
                        return (
                          <p 
                            key={idx} 
                            className={cn(
                              "mb-2 last:mb-0",
                              isStep && "font-medium text-foreground pl-0"
                            )}
                          >
                            {trimmed}
                          </p>
                        );
                      })}
                    </div>
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
