import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useAdmin } from "@/hooks/useAdmin";
import { BookOpen, ChefHat, Lock, LogIn, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import AppLoadingScreen from "@/components/AppLoadingScreen";

interface Ingredient {
  name: string;
  amount: string;
}

const SharedRecipe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { subscribed, loading: subLoading } = useSubscription();
  const { isAdmin, isLoading: adminLoading } = useAdmin();

  const { data: recipe, isLoading: recipeLoading, error } = useQuery({
    queryKey: ["shared-recipe", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorite_recipes")
        .select("id, name, recipe, ingredients")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user && (subscribed || isAdmin),
  });

  if (authLoading || subLoading || adminLoading) {
    return <AppLoadingScreen />;
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <LogIn className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-xl font-heading font-bold mb-2">Zaloguj się, aby zobaczyć przepis</h1>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Ktoś udostępnił Ci przepis z Lovers App. Zaloguj się lub załóż konto, aby go zobaczyć.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/auth")} className="gap-2">
            <LogIn className="w-4 h-4" />
            Zaloguj się
          </Button>
          <Button variant="outline" onClick={() => navigate("/landing")}>
            Dowiedz się więcej
          </Button>
        </div>
      </div>
    );
  }

  // No subscription
  if (!subscribed && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-xl font-heading font-bold mb-2">Potrzebujesz subskrypcji</h1>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Aby zobaczyć udostępnione przepisy, potrzebujesz aktywnej subskrypcji Lovers App.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/")} className="gap-2">
            Wykup subskrypcję
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Wróć do aplikacji
          </Button>
        </div>
      </div>
    );
  }

  if (recipeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-xl font-heading font-bold mb-2">Nie znaleziono przepisu</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Ten przepis mógł zostać usunięty lub link jest nieprawidłowy.
        </p>
        <Button onClick={() => navigate("/")} variant="outline">
          Wróć do aplikacji
        </Button>
      </div>
    );
  }

  const ingredients = Array.isArray(recipe.ingredients)
    ? (recipe.ingredients as unknown as Ingredient[])
    : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto p-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Wróć do aplikacji
        </Button>

        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-border/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg">{recipe.name}</h1>
              <p className="text-xs text-muted-foreground">Udostępniony przepis z Lovers App</p>
            </div>
          </div>

          <ScrollArea className="max-h-[70vh]">
            <div className="p-5 space-y-5">
              {ingredients.length > 0 && (
                <div>
                  <h2 className="font-semibold text-sm mb-2">Składniki:</h2>
                  <ul className="space-y-1">
                    {ingredients.map((ing, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground py-1 px-2 rounded bg-secondary/50">
                        • {ing.name} - {ing.amount}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h2 className="font-semibold text-sm mb-2">Przygotowanie:</h2>
                <div className="text-sm text-muted-foreground whitespace-pre-line bg-secondary p-3 rounded-lg">
                  {recipe.recipe}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default SharedRecipe;
