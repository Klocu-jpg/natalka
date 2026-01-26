import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Ingredient } from "./useMeals";

export interface FavoriteRecipe {
  id: string;
  user_id: string;
  name: string;
  recipe: string;
  ingredients: Ingredient[];
  created_at: string;
}

export const useFavoriteRecipes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favoriteRecipes = [], isLoading } = useQuery({
    queryKey: ["favorite_recipes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorite_recipes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((recipe) => ({
        ...recipe,
        ingredients: Array.isArray(recipe.ingredients)
          ? (recipe.ingredients as unknown as Ingredient[])
          : [],
      }));
    },
    enabled: !!user,
  });

  const addFavoriteRecipe = useMutation({
    mutationFn: async ({
      name,
      recipe,
      ingredients,
    }: {
      name: string;
      recipe: string;
      ingredients: Ingredient[];
    }) => {
      if (!user) throw new Error("Nie jesteś zalogowany");

      const { data, error } = await supabase
        .from("favorite_recipes")
        .insert([{
          user_id: user.id,
          name,
          recipe,
          ingredients: JSON.parse(JSON.stringify(ingredients)),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite_recipes", user?.id] });
      toast.success("Przepis dodany do książki kucharskiej! 📖");
    },
    onError: (error) => {
      toast.error(error.message || "Nie udało się zapisać przepisu");
    },
  });

  const updateFavoriteRecipe = useMutation({
    mutationFn: async ({
      id,
      name,
      recipe,
      ingredients,
    }: {
      id: string;
      name: string;
      recipe: string;
      ingredients: Ingredient[];
    }) => {
      const { error } = await supabase
        .from("favorite_recipes")
        .update({
          name,
          recipe,
          ingredients: JSON.parse(JSON.stringify(ingredients)),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite_recipes", user?.id] });
      toast.success("Przepis zaktualizowany! 📖");
    },
    onError: () => {
      toast.error("Nie udało się zaktualizować przepisu");
    },
  });

  const deleteFavoriteRecipe = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("favorite_recipes")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite_recipes", user?.id] });
      toast.success("Przepis usunięty z ulubionych");
    },
    onError: () => {
      toast.error("Nie udało się usunąć przepisu");
    },
  });

  const isRecipeFavorite = (name: string) => {
    return favoriteRecipes.some((recipe) => recipe.name === name);
  };

  return {
    favoriteRecipes,
    isLoading,
    addFavoriteRecipe,
    updateFavoriteRecipe,
    deleteFavoriteRecipe,
    isRecipeFavorite,
  };
};
