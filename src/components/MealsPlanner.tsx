import { useState } from "react";
import { UtensilsCrossed, Plus, Loader2, ChefHat, X, ShoppingCart, BookOpen, Star, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useMeals, Meal } from "@/hooks/useMeals";
import { useShoppingItems } from "@/hooks/useShoppingItems";
import { useFavoriteRecipes } from "@/hooks/useFavoriteRecipes";
import { toast } from "sonner";
import WidgetWrapper from "./WidgetWrapper";
import { useLoading } from "@/contexts/LoadingContext";

const DAYS = [
  { id: 0, short: "Pn", full: "Poniedziałek" },
  { id: 1, short: "Wt", full: "Wtorek" },
  { id: 2, short: "Śr", full: "Środa" },
  { id: 3, short: "Cz", full: "Czwartek" },
  { id: 4, short: "Pt", full: "Piątek" },
  { id: 5, short: "So", full: "Sobota" },
  { id: 6, short: "Nd", full: "Niedziela" },
];

type AddMode = "ai" | "simple" | "recipe";

const MealsPlanner = () => {
  const { meals, isLoading, addMeal, addMealFromFavorite, deleteMeal, clearDay, clearAllMeals, getMealsForDay } = useMeals();
  const { addItem, addItems } = useShoppingItems();
  const { favoriteRecipes, addFavoriteRecipe, isRecipeFavorite } = useFavoriteRecipes();
  const { withLoading } = useLoading();
  const [selectedDay, setSelectedDay] = useState(0);
  const [newMeal, setNewMeal] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>("simple");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");

  const handleAddMeal = async () => {
    if (addMode === "recipe") {
      const recipe = favoriteRecipes.find(r => r.id === selectedRecipeId);
      if (recipe) {
        await withLoading(
          () => addMealFromFavorite.mutateAsync({
            name: recipe.name,
            recipe: recipe.recipe,
            ingredients: recipe.ingredients,
            dayOfWeek: selectedDay,
          }),
          "Dodaję przepis..."
        );
        setSelectedRecipeId("");
        setAddDialogOpen(false);
      }
      return;
    }
    
    if (newMeal.trim()) {
      const msg = addMode === "ai" ? "AI generuje przepis..." : "Dodaję obiad...";
      await withLoading(
        () => addMeal.mutateAsync({ name: newMeal, dayOfWeek: selectedDay, useAI: addMode === "ai" }),
        msg
      );
      setNewMeal("");
      setAddDialogOpen(false);
    }
  };

  const handleAddIngredientsToShoppingList = async (meal: Meal) => {
    if (!meal.ingredients || meal.ingredients.length === 0) {
      toast.error("Brak składników do dodania");
      return;
    }

    const names = meal.ingredients.map(
      (ing) => `${ing.name} (${ing.amount})`
    );
    await addItems.mutateAsync(names);
    toast.success(`Dodano ${meal.ingredients.length} składników do listy zakupów`);
  };

  const handleAddSingleIngredient = async (ingredientName: string, ingredientAmount: string) => {
    await addItem.mutateAsync(`${ingredientName} (${ingredientAmount})`);
    toast.success(`Dodano "${ingredientName}" do listy zakupów`);
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

  const handleMarkAsEaten = (meal: Meal) => {
    deleteMeal.mutate(meal.id);
    toast.success(`${meal.name} oznaczony jako zjedzony`);
  };

  const handleClearWeek = () => {
    clearAllMeals.mutate();
  };

  const isPending = addMeal.isPending || addMealFromFavorite.isPending;

  return (
    <WidgetWrapper
      title="Plan Obiadów"
      icon={<UtensilsCrossed className="w-5 h-5 text-primary-foreground" />}
      iconBg="gradient-primary"
      actions={
        <div className="flex gap-1">
          {meals.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8" title="Wyczyść tydzień">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Wyczyścić cały tydzień?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Usunie to wszystkie zaplanowane obiady. Tej akcji nie można cofnąć.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearWeek}>Wyczyść</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
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
                {/* Mode selection */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={addMode === "simple" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAddMode("simple")}
                    className="text-xs"
                  >
                    Prosty
                  </Button>
                  <Button
                    variant={addMode === "ai" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAddMode("ai")}
                    className="text-xs"
                  >
                    Z AI
                  </Button>
                  <Button
                    variant={addMode === "recipe" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAddMode("recipe")}
                    className="text-xs"
                  >
                    Z książki
                  </Button>
                </div>

                {addMode === "recipe" ? (
                  <>
                    <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz przepis z książki kucharskiej..." />
                      </SelectTrigger>
                      <SelectContent>
                        {favoriteRecipes.length === 0 ? (
                          <SelectItem value="none" disabled>
                            Brak zapisanych przepisów
                          </SelectItem>
                        ) : (
                          favoriteRecipes.map((recipe) => (
                            <SelectItem key={recipe.id} value={recipe.id}>
                              {recipe.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Przepis zostanie dodany ze wszystkimi składnikami
                    </p>
                  </>
                ) : (
                  <>
                    <Input
                      placeholder="Np. Spaghetti bolognese..."
                      value={newMeal}
                      onChange={(e) => setNewMeal(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !isPending && handleAddMeal()}
                      className="rounded-xl"
                    />
                    <p className="text-sm text-muted-foreground">
                      {addMode === "ai" 
                        ? "AI wygeneruje przepis i listę składników"
                        : "Obiad zostanie dodany bez przepisu - możesz go uzupełnić później"
                      }
                    </p>
                  </>
                )}

                <Button 
                  onClick={handleAddMeal} 
                  className="w-full" 
                  disabled={isPending || (addMode === "recipe" ? !selectedRecipeId : !newMeal.trim())}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {addMode === "ai" ? "Generuję przepis..." : "Dodaję..."}
                    </>
                  ) : (
                    "Dodaj obiad"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <div>
        <div className="grid grid-cols-7 gap-1 mb-4 bg-muted rounded-lg p-1">
          {DAYS.map((day) => {
            const hasMeals = getMealsForDay(day.id).length > 0;
            const isActive = selectedDay === day.id;
            return (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={cn(
                  "text-xs py-2 rounded-md text-center transition-all font-medium",
                  isActive && hasMeals && "bg-primary text-primary-foreground shadow-sm",
                  isActive && !hasMeals && "bg-background text-foreground shadow-sm",
                  !isActive && hasMeals && "bg-primary/20 text-primary font-semibold",
                  !isActive && !hasMeals && "text-muted-foreground hover:text-foreground"
                )}
              >
                {day.short}
              </button>
            );
          })}
        </div>

        {(() => {
          const dayMeals = getMealsForDay(selectedDay);
          const day = DAYS[selectedDay];
          return (
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
                  Brak zaplanowanych obiadów
                </p>
              ) : (
                <ul className="space-y-2">
                  {dayMeals.map((meal) => (
                    <li
                      key={meal.id}
                      className="bg-secondary rounded-xl p-3 group hover:shadow-card transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openRecipe(meal)}
                          className="flex-1 text-left flex items-center gap-2 hover:text-primary transition-colors min-w-0"
                        >
                          <BookOpen className="w-4 h-4 text-primary shrink-0" />
                          <span className="font-medium truncate">{meal.name}</span>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 hover:bg-green-500/20 hover:text-green-600"
                          onClick={() => handleMarkAsEaten(meal)}
                          title="Oznacz jako zjedzone"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <button
                          onClick={() => deleteMeal.mutate(meal.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0"
                          title="Usuń"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {meal.ingredients && meal.ingredients.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          {meal.ingredients.length} składników
                        </p>
                      )}
                      {!meal.recipe && (
                        <p className="text-xs text-amber-600 mt-1 ml-6">
                          Bez przepisu
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })()}
      </div>

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
                {/* Save to favorites - only if has recipe */}
                {selectedMeal.recipe && (
                  <div className="flex gap-2">
                    <Button
                      variant={isRecipeFavorite(selectedMeal.name) ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => handleSaveToFavorites(selectedMeal)}
                      disabled={addFavoriteRecipe.isPending || isRecipeFavorite(selectedMeal.name)}
                      className="gap-2 flex-1"
                    >
                      <Star className={cn("w-4 h-4", isRecipeFavorite(selectedMeal.name) && "fill-amber-500 text-amber-500")} />
                      {isRecipeFavorite(selectedMeal.name) ? "W książce kucharskiej" : "Zapisz do książki"}
                    </Button>
                  </div>
                )}

                {/* Ingredients */}
                {selectedMeal.ingredients && selectedMeal.ingredients.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-heading font-semibold text-lg">🧂 Składniki</h4>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAddIngredientsToShoppingList(selectedMeal)}
                        disabled={addItems.isPending}
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
                )}

                {/* Recipe */}
                {selectedMeal.recipe ? (
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
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Ten obiad nie ma przepisu.</p>
                    <p className="text-sm mt-1">Możesz dodać go do książki kucharskiej i uzupełnić szczegóły.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </WidgetWrapper>
  );
};

export default MealsPlanner;
