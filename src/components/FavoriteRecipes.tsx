import { useState } from "react";
import { Star, Trash2, ChefHat, Loader2, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFavoriteRecipes, FavoriteRecipe } from "@/hooks/useFavoriteRecipes";
import { useShoppingItems } from "@/hooks/useShoppingItems";
import WidgetWrapper from "./WidgetWrapper";
import { toast } from "sonner";

const FavoriteRecipes = () => {
  const { favoriteRecipes, isLoading, deleteFavoriteRecipe } = useFavoriteRecipes();
  const { addItem } = useShoppingItems();
  const [selectedRecipe, setSelectedRecipe] = useState<FavoriteRecipe | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addedIngredients, setAddedIngredients] = useState<Set<string>>(new Set());

  const openRecipe = (recipe: FavoriteRecipe) => {
    setSelectedRecipe(recipe);
    setAddedIngredients(new Set());
    setIsDialogOpen(true);
  };

  const handleAddAllIngredients = () => {
    if (!selectedRecipe) return;
    selectedRecipe.ingredients.forEach((ingredient) => {
      addItem.mutate(`${ingredient.name} (${ingredient.amount})`);
    });
    toast.success("Wszystkie składniki dodane do listy zakupów! 🛒");
  };

  const handleAddSingleIngredient = (ingredientName: string, amount: string) => {
    addItem.mutate(`${ingredientName} (${amount})`);
    setAddedIngredients((prev) => new Set(prev).add(ingredientName));
  };

  return (
    <WidgetWrapper
      title="Ulubione przepisy"
      icon={<Star className="w-5 h-5 text-foreground" />}
      iconBg="bg-amber-100"
    >
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : favoriteRecipes.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Zapisz swoje ulubione przepisy! ⭐
        </p>
      ) : (
        <div className="space-y-2">
          {favoriteRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="flex items-center justify-between p-3 bg-secondary rounded-xl group hover:shadow-card-hover transition-all"
            >
              <button
                onClick={() => openRecipe(recipe)}
                className="flex items-center gap-3 flex-1 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-200 flex items-center justify-center">
                  <ChefHat className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <p className="font-medium text-sm">{recipe.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {recipe.ingredients.length} składników
                  </p>
                </div>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                onClick={() => deleteFavoriteRecipe.mutate(recipe.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              {selectedRecipe?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {selectedRecipe && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">Składniki:</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddAllIngredients}
                      className="text-xs"
                    >
                      Dodaj wszystkie do zakupów
                    </Button>
                  </div>
                  <ul className="space-y-1">
                    {selectedRecipe.ingredients.map((ing, idx) => {
                      const isAdded = addedIngredients.has(ing.name);
                      return (
                        <li
                          key={idx}
                          className="flex items-center justify-between text-sm text-muted-foreground py-1 px-2 rounded hover:bg-secondary/50"
                        >
                          <span>
                            • {ing.name} - {ing.amount}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => handleAddSingleIngredient(ing.name, ing.amount)}
                            disabled={isAdded}
                          >
                            {isAdded ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Plus className="w-3 h-3" />
                            )}
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Przygotowanie:</h4>
                  <div className="text-sm text-muted-foreground whitespace-pre-line">
                    {selectedRecipe.recipe}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </WidgetWrapper>
  );
};

export default FavoriteRecipes;
