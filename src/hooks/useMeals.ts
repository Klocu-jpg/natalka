// Meals hook - manages meal planning with favorites support
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Ingredient {
  name: string;
  amount: string;
}

export interface Meal {
  id: string;
  user_id: string;
  day_of_week: number;
  name: string;
  recipe: string | null;
  ingredients: Ingredient[];
  created_at: string;
}

export const useMeals = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: meals = [], isLoading } = useQuery({
    queryKey: ["meals", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .order("day_of_week", { ascending: true });

      if (error) throw error;
      
      // Parse ingredients from JSON
      return (data || []).map((meal) => ({
        ...meal,
        recipe: meal.recipe ?? null,
        ingredients: Array.isArray(meal.ingredients) ? (meal.ingredients as unknown as Ingredient[]) : [],
      }));
    },
    enabled: !!user,
  });

  const addMeal = useMutation({
    mutationFn: async ({ name, dayOfWeek }: { name: string; dayOfWeek: number }) => {
      if (!user) throw new Error("Nie jesteś zalogowany");

      // First, generate recipe using AI
      const { data: recipeData, error: recipeError } = await supabase.functions.invoke(
        "generate-recipe",
        { body: { mealName: name } }
      );

      if (recipeError) {
        console.error("Recipe generation error:", recipeError);
        throw new Error("Nie udało się wygenerować przepisu");
      }

      const { recipe, ingredients } = recipeData;

      // Then save the meal with recipe
      const { data, error } = await supabase
        .from("meals")
        .insert({
          user_id: user.id,
          day_of_week: dayOfWeek,
          name,
          recipe,
          ingredients,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals", user?.id] });
      toast.success("Obiad dodany z przepisem! 🍽️");
    },
    onError: (error) => {
      toast.error(error.message || "Nie udało się dodać obiadu");
    },
  });

  const addMealFromFavorite = useMutation({
    mutationFn: async ({
      name,
      recipe,
      ingredients,
      dayOfWeek,
    }: {
      name: string;
      recipe: string;
      ingredients: Ingredient[];
      dayOfWeek: number;
    }) => {
      if (!user) throw new Error("Nie jesteś zalogowany");

      const { data, error } = await supabase
        .from("meals")
        .insert({
          user_id: user.id,
          day_of_week: dayOfWeek,
          name,
          recipe,
          ingredients: JSON.parse(JSON.stringify(ingredients)),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals", user?.id] });
      toast.success("Przepis dodany do planu! 🍽️");
    },
    onError: (error) => {
      toast.error(error.message || "Nie udało się dodać przepisu");
    },
  });

const deleteMeal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("meals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals", user?.id] });
    },
    onError: () => {
      toast.error("Nie udało się usunąć obiadu");
    },
  });

  const clearDay = useMutation({
    mutationFn: async (dayOfWeek: number) => {
      const { error } = await supabase
        .from("meals")
        .delete()
        .eq("day_of_week", dayOfWeek);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals", user?.id] });
      toast.success("Dzień wyczyszczony! 🧹");
    },
    onError: () => {
      toast.error("Nie udało się wyczyścić dnia");
    },
  });

  const clearAllMeals = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("meals")
        .delete()
        .gte("day_of_week", 0); // Delete all meals
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals", user?.id] });
      toast.success("Tydzień wyczyszczony! 🧹");
    },
    onError: () => {
      toast.error("Nie udało się wyczyścić tygodnia");
    },
  });

const getMealsForDay = (dayOfWeek: number) => {
    return meals.filter((meal) => meal.day_of_week === dayOfWeek);
  };

  return {
    meals,
    isLoading,
    addMeal,
    addMealFromFavorite,
    deleteMeal,
    clearDay,
    clearAllMeals,
    getMealsForDay,
  };
};
