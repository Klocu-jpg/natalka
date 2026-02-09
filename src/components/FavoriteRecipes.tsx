import { useState } from "react";
import { BookOpen, Trash2, ChefHat, Loader2, Plus, Check, CalendarPlus, Edit, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFavoriteRecipes, FavoriteRecipe } from "@/hooks/useFavoriteRecipes";
import { useShoppingItems } from "@/hooks/useShoppingItems";
import { useMeals, Ingredient } from "@/hooks/useMeals";
import WidgetWrapper from "./WidgetWrapper";
import { toast } from "sonner";

const DAYS = [
  { id: 0, name: "Poniedziałek" },
  { id: 1, name: "Wtorek" },
  { id: 2, name: "Środa" },
  { id: 3, name: "Czwartek" },
  { id: 4, name: "Piątek" },
  { id: 5, name: "Sobota" },
  { id: 6, name: "Niedziela" },
];

const FavoriteRecipes = () => {
  const { favoriteRecipes, isLoading, addFavoriteRecipe, updateFavoriteRecipe, deleteFavoriteRecipe } = useFavoriteRecipes();
  const { addItem, addItems } = useShoppingItems();
  const { addMealFromFavorite } = useMeals();
  
  const [selectedRecipe, setSelectedRecipe] = useState<FavoriteRecipe | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [addedIngredients, setAddedIngredients] = useState<Set<string>>(new Set());
  const [selectedDay, setSelectedDay] = useState<string>("");
  
  // Form state for add/edit
  const [formName, setFormName] = useState("");
  const [formRecipe, setFormRecipe] = useState("");
  const [formIngredients, setFormIngredients] = useState<Ingredient[]>([]);
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientAmount, setNewIngredientAmount] = useState("");

  const openRecipe = (recipe: FavoriteRecipe) => {
    setSelectedRecipe(recipe);
    setAddedIngredients(new Set());
    setSelectedDay("");
    setIsEditMode(false);
    setIsViewDialogOpen(true);
  };

  const openAddDialog = () => {
    setFormName("");
    setFormRecipe("");
    setFormIngredients([]);
    setIsAddDialogOpen(true);
  };

  const openEditMode = () => {
    if (!selectedRecipe) return;
    setFormName(selectedRecipe.name);
    setFormRecipe(selectedRecipe.recipe);
    setFormIngredients([...selectedRecipe.ingredients]);
    setIsEditMode(true);
  };

  const handleAddIngredient = () => {
    if (newIngredientName.trim() && newIngredientAmount.trim()) {
      setFormIngredients([...formIngredients, { name: newIngredientName.trim(), amount: newIngredientAmount.trim() }]);
      setNewIngredientName("");
      setNewIngredientAmount("");
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setFormIngredients(formIngredients.filter((_, i) => i !== index));
  };

  const handleSaveRecipe = () => {
    if (!formName.trim() || !formRecipe.trim()) {
      toast.error("Podaj nazwę i przepis");
      return;
    }
    
    addFavoriteRecipe.mutate({
      name: formName.trim(),
      recipe: formRecipe.trim(),
      ingredients: formIngredients,
    }, {
      onSuccess: () => setIsAddDialogOpen(false)
    });
  };

  const handleUpdateRecipe = () => {
    if (!selectedRecipe || !formName.trim() || !formRecipe.trim()) {
      toast.error("Podaj nazwę i przepis");
      return;
    }
    
    updateFavoriteRecipe.mutate({
      id: selectedRecipe.id,
      name: formName.trim(),
      recipe: formRecipe.trim(),
      ingredients: formIngredients,
    }, {
      onSuccess: () => {
        setIsEditMode(false);
        setIsViewDialogOpen(false);
      }
    });
  };

  const handleAddAllIngredients = () => {
    if (!selectedRecipe) return;
    const names = selectedRecipe.ingredients.map(
      (ing) => `${ing.name} (${ing.amount})`
    );
    addItems.mutate(names);
    toast.success("Wszystkie składniki dodane do listy zakupów! 🛒");
  };

  const handleAddSingleIngredient = (ingredientName: string, amount: string) => {
    addItem.mutate(`${ingredientName} (${amount})`);
    setAddedIngredients((prev) => new Set(prev).add(ingredientName));
  };

  const handleAddToDay = () => {
    if (!selectedRecipe || selectedDay === "") return;
    
    addMealFromFavorite.mutate({
      name: selectedRecipe.name,
      recipe: selectedRecipe.recipe,
      ingredients: selectedRecipe.ingredients,
      dayOfWeek: parseInt(selectedDay),
    });
    setSelectedDay("");
  };

  const renderIngredientForm = () => (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">Składniki</h4>
      <div className="flex gap-2">
        <Input
          placeholder="Nazwa składnika"
          value={newIngredientName}
          onChange={(e) => setNewIngredientName(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="Ilość"
          value={newIngredientAmount}
          onChange={(e) => setNewIngredientAmount(e.target.value)}
          className="w-24"
        />
        <Button size="icon" variant="outline" onClick={handleAddIngredient}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {formIngredients.length > 0 && (
        <ul className="space-y-1">
          {formIngredients.map((ing, idx) => (
            <li key={idx} className="flex items-center justify-between text-sm p-2 bg-secondary rounded-lg">
              <span>• {ing.name} - {ing.amount}</span>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleRemoveIngredient(idx)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <WidgetWrapper
      title="Książka Kucharska"
      icon={<BookOpen className="w-5 h-5 text-foreground" />}
      iconBg="bg-amber-100"
      actions={
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="soft" className="h-8 w-8" onClick={openAddDialog}>
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[85vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                Dodaj własny przepis
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[65vh] pr-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Nazwa dania</label>
                  <Input
                    placeholder="Np. Spaghetti bolognese"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                
                {renderIngredientForm()}
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Przepis</label>
                  <Textarea
                    placeholder="Opisz krok po kroku jak przygotować danie..."
                    value={formRecipe}
                    onChange={(e) => setFormRecipe(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>
                
                <Button 
                  onClick={handleSaveRecipe} 
                  className="w-full"
                  disabled={addFavoriteRecipe.isPending}
                >
                  {addFavoriteRecipe.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Zapisz przepis
                </Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : favoriteRecipes.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Dodaj swoje ulubione przepisy! 📖
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

      {/* View/Edit Recipe Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              {isEditMode ? "Edytuj przepis" : selectedRecipe?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh] pr-4">
            {selectedRecipe && !isEditMode && (
              <div className="space-y-4">
                {/* Actions row */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={openEditMode} className="gap-2 flex-1">
                    <Edit className="w-4 h-4" />
                    Edytuj
                  </Button>
                </div>
                
                {/* Add to meal plan */}
                <div className="p-3 bg-primary/10 rounded-xl space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <CalendarPlus className="w-4 h-4" />
                    Dodaj do planu obiadów
                  </p>
                  <div className="flex gap-2">
                    <Select value={selectedDay} onValueChange={setSelectedDay}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Wybierz dzień..." />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.map((day) => (
                          <SelectItem key={day.id} value={String(day.id)}>
                            {day.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      onClick={handleAddToDay}
                      disabled={selectedDay === "" || addMealFromFavorite.isPending}
                    >
                      {addMealFromFavorite.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Ingredients */}
                {selectedRecipe.ingredients.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">Składniki:</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAddAllIngredients}
                        className="text-xs gap-1"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Dodaj do zakupów
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
                )}
                
                {/* Recipe */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Przygotowanie:</h4>
                  <div className="text-sm text-muted-foreground whitespace-pre-line bg-secondary p-3 rounded-lg">
                    {selectedRecipe.recipe}
                  </div>
                </div>
              </div>
            )}

            {/* Edit mode */}
            {isEditMode && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Nazwa dania</label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                
                {renderIngredientForm()}
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Przepis</label>
                  <Textarea
                    value={formRecipe}
                    onChange={(e) => setFormRecipe(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditMode(false)} className="flex-1">
                    Anuluj
                  </Button>
                  <Button onClick={handleUpdateRecipe} className="flex-1" disabled={updateFavoriteRecipe.isPending}>
                    {updateFavoriteRecipe.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Zapisz
                  </Button>
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
