import { useEffect, useMemo, useState } from "react";
import { Salad, Save, Loader2, Flame, Settings, Sparkles, Shuffle, BookOpen, ChefHat, Download, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import WidgetWrapper from "./WidgetWrapper";
import { useDietPreferences, DietPreferencesInput } from "@/hooks/useDietPreferences";
import { calculateCalories, ACTIVITY_LABELS, GOAL_LABELS } from "@/lib/calories";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLoading } from "@/contexts/LoadingContext";
import { useShoppingItems } from "@/hooks/useShoppingItems";
import { useCouple } from "@/hooks/useCouple";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DIET_TYPES = [
  { value: "none", label: "Brak (wszystko)" },
  { value: "wegetarianska", label: "Wegetariańska" },
  { value: "weganska", label: "Wegańska" },
  { value: "bezglutenowa", label: "Bezglutenowa" },
  { value: "bezlaktozowa", label: "Bezlaktozowa" },
  { value: "keto", label: "Keto / niskowęglowodanowa" },
  { value: "paleo", label: "Paleo" },
  { value: "srodziemnomorska", label: "Śródziemnomorska" },
  { value: "pescatarianska", label: "Pescatariańska (ryby)" },
];

const empty: DietPreferencesInput = {
  likes: "",
  dislikes: "",
  allergies: "",
  diet_type: "",
  health_conditions: "",
  notes: "",
  biological_sex: "",
  birth_year: null,
  height_cm: null,
  weight_kg: null,
  activity_level: "",
  goal: "",
};

type MealType = "breakfast" | "lunch" | "dinner";
interface DraftIngredient { name: string; amount: string }
interface DraftMeal {
  day_of_week: number;
  meal_type: MealType;
  name: string;
  calories?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fats_g?: number | null;
  recipe?: string | null;
  ingredients?: DraftIngredient[];
}

const DAYS = [
  { id: 0, short: "Pn", full: "Poniedziałek" },
  { id: 1, short: "Wt", full: "Wtorek" },
  { id: 2, short: "Śr", full: "Środa" },
  { id: 3, short: "Cz", full: "Czwartek" },
  { id: 4, short: "Pt", full: "Piątek" },
  { id: 5, short: "So", full: "Sobota" },
  { id: 6, short: "Nd", full: "Niedziela" },
];

const MEAL_META: Record<MealType, { label: string; emoji: string }> = {
  breakfast: { label: "Śniadanie", emoji: "🍳" },
  lunch: { label: "Obiad", emoji: "🍝" },
  dinner: { label: "Kolacja", emoji: "🌙" },
};

const DRAFT_KEY = "diet-plan-draft-v1";
const SERVINGS_KEY = "diet-plan-servings-v1";

const DietPreferences = () => {
  const { user } = useAuth();
  const { preferences, isLoading, upsertPreferences } = useDietPreferences();
  const { withLoading } = useLoading();
  const { addItems } = useShoppingItems();
  const { couple } = useCouple();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<DietPreferencesInput>(empty);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [plan, setPlan] = useState<DraftMeal[]>(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? (JSON.parse(raw) as DraftMeal[]) : [];
    } catch { return []; }
  });
  const [selectedDay, setSelectedDay] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [rerollingKey, setRerollingKey] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [recipeMeal, setRecipeMeal] = useState<DraftMeal | null>(null);

  const coupleMemberCount = useMemo(() => {
    if (!couple) return 1;
    return [couple.user1_id, couple.user2_id, couple.user3_id, couple.user4_id]
      .filter(Boolean).length || 1;
  }, [couple]);

  const memberIds = useMemo(() => {
    if (!couple) return user ? [user.id] : [];
    const ids = [couple.user1_id, couple.user2_id, couple.user3_id, couple.user4_id].filter(Boolean) as string[];
    // user jako pierwszy
    return user ? [user.id, ...ids.filter((id) => id !== user.id)] : ids;
  }, [couple, user]);

  // Preferencje wszystkich członków pary (do wyliczenia łącznego zapotrzebowania)
  const { data: allMembersPrefs = [] } = useQuery({
    queryKey: ["diet_preferences_all", memberIds.join(",")],
    queryFn: async () => {
      if (memberIds.length === 0) return [];
      const { data, error } = await supabase
        .from("diet_preferences" as any)
        .select("user_id, biological_sex, birth_year, height_cm, weight_kg, activity_level, goal")
        .in("user_id", memberIds);
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: memberIds.length > 0,
  });

  const [servings, setServings] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(SERVINGS_KEY);
      if (raw) {
        const n = parseInt(raw, 10);
        if (n >= 1 && n <= 6) return n;
      }
    } catch { /* ignore */ }
    return 1;
  });

  useEffect(() => {
    // Auto-default to couple size on first load if user hasn't set it yet
    try {
      if (!localStorage.getItem(SERVINGS_KEY) && coupleMemberCount > 1) {
        setServings(coupleMemberCount);
      }
    } catch { /* ignore */ }
  }, [coupleMemberCount]);

  useEffect(() => {
    try { localStorage.setItem(SERVINGS_KEY, String(servings)); } catch { /* ignore */ }
  }, [servings]);

  // Per-osoba kcal dla wybranej liczby porcji
  const perPersonCalories = useMemo(() => {
    if (memberIds.length === 0) return [];
    const prefsById = new Map<string, any>(allMembersPrefs.map((p) => [p.user_id, p]));
    return memberIds.slice(0, servings).map((id, i) => {
      const p = prefsById.get(id);
      const c = calculateCalories({
        sex: p?.biological_sex ?? "",
        birthYear: p?.birth_year ?? null,
        heightCm: p?.height_cm ?? null,
        weightKg: p?.weight_kg ?? null,
        activity: p?.activity_level ?? "",
        goal: p?.goal ?? "",
      });
      return {
        id,
        idx: i + 1,
        isMe: id === user?.id,
        target: c?.target ?? null,
      };
    });
  }, [memberIds, allMembersPrefs, servings, user?.id]);

  const totalDailyKcal = perPersonCalories.reduce((s, p) => s + (p.target ?? 0), 0) || null;
  const allPersonsHaveData = perPersonCalories.length > 0 && perPersonCalories.every((p) => p.target != null);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(plan));
    } catch { /* ignore */ }
  }, [plan]);

  useEffect(() => {
    if (preferences) {
      setForm({
        likes: preferences.likes ?? "",
        dislikes: preferences.dislikes ?? "",
        allergies: preferences.allergies ?? "",
        diet_type: preferences.diet_type ?? "",
        health_conditions: preferences.health_conditions ?? "",
        notes: preferences.notes ?? "",
        biological_sex: preferences.biological_sex ?? "",
        birth_year: preferences.birth_year ?? null,
        height_cm: preferences.height_cm ?? null,
        weight_kg: preferences.weight_kg ?? null,
        activity_level: preferences.activity_level ?? "",
        goal: preferences.goal ?? "",
      });
    }
  }, [preferences]);

  const update = <K extends keyof DietPreferencesInput>(key: K, value: DietPreferencesInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const calories = useMemo(
    () =>
      calculateCalories({
        sex: form.biological_sex,
        birthYear: form.birth_year,
        heightCm: form.height_cm,
        weightKg: form.weight_kg,
        activity: form.activity_level,
        goal: form.goal,
      }),
    [form]
  );

  const handleSave = () => {
    upsertPreferences.mutate({
      ...form,
      diet_type: form.diet_type === "none" ? "" : form.diet_type,
    });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      if (servings > 1 && !allPersonsHaveData) {
        toast.error("Brakuje danych jednej z osób (płeć, wzrost, waga, wiek). Uzupełnij w ustawieniach diety.");
        setGenerating(false);
        return;
      }
      const { data, error } = await withLoading(
        () => supabase.functions.invoke("generate-meal-plan", { body: { servings } }),
        `AI układa plan na tydzień dla ${servings} ${servings === 1 ? "osoby" : "osób"}...`
      );
      if (error) throw new Error(error.message || "Błąd generowania");
      if ((data as any)?.error) throw new Error((data as any).error);
      const meals: DraftMeal[] = (data as any)?.meals ?? [];
      if (!Array.isArray(meals) || meals.length === 0) throw new Error("Pusty plan z AI");
      setPlan(meals);
      toast.success(`Plan gotowy! 🍽️ (${meals.length} posiłków)`);
    } catch (e: any) {
      toast.error(e?.message || "Nie udało się wygenerować planu");
    } finally {
      setGenerating(false);
    }
  };

  const handleReroll = async (meal: DraftMeal) => {
    const key = `${meal.day_of_week}-${meal.meal_type}`;
    setRerollingKey(key);
    try {
      const excludeNames = plan.map((m) => m.name).filter(Boolean);
      const { data, error } = await supabase.functions.invoke("reroll-meal", {
        body: { excludeNames, mealType: meal.meal_type, servings },
      });
      if (error) throw new Error(error.message || "Błąd");
      if ((data as any)?.error) throw new Error((data as any).error);
      setPlan((prev) =>
        prev.map((m) =>
          m.day_of_week === meal.day_of_week && m.meal_type === meal.meal_type
            ? {
                ...m,
                name: (data as any).name,
                calories: (data as any).calories ?? null,
                protein_g: (data as any).protein_g ?? null,
                carbs_g: (data as any).carbs_g ?? null,
                fats_g: (data as any).fats_g ?? null,
                recipe: (data as any).recipe ?? null,
                ingredients: (data as any).ingredients ?? [],
              }
            : m
        )
      );
      toast.success(`Wymieniono: ${(data as any).name} 🎲`);
    } catch (e: any) {
      toast.error(e?.message || "Nie udało się wymienić posiłku");
    } finally {
      setRerollingKey(null);
    }
  };

  const handleImport = async () => {
    if (!user || plan.length === 0) return;
    setImporting(true);
    try {
      const { error: delErr } = await supabase.from("meals").delete().eq("user_id", user.id);
      if (delErr) throw delErr;

      const rows = plan.map((m) => {
        const meta = MEAL_META[m.meal_type];
        const macros = [
          m.protein_g != null ? `B:${m.protein_g}g` : null,
          m.carbs_g != null ? `W:${m.carbs_g}g` : null,
          m.fats_g != null ? `T:${m.fats_g}g` : null,
        ].filter(Boolean).join(" · ");
        const recipeWithMacros = m.recipe
          ? (macros ? `📊 Makro: ${macros}\n\n${m.recipe}` : m.recipe)
          : null;
        return {
          user_id: user.id,
          day_of_week: m.day_of_week,
          name: `${meta.emoji} ${meta.label} · ${m.name}`,
          recipe: recipeWithMacros,
          ingredients: JSON.parse(JSON.stringify(m.ingredients ?? [])),
          calories: m.calories ?? null,
        };
      });
      const { error: insErr } = await supabase.from("meals").insert(rows);
      if (insErr) throw insErr;

      // Auto-add all ingredients to shopping list (deduplicated by name)
      const ingMap = new Map<string, string>();
      for (const m of plan) {
        for (const ing of m.ingredients ?? []) {
          if (!ing?.name) continue;
          const key = ing.name.trim().toLowerCase();
          if (!ingMap.has(key)) {
            ingMap.set(key, `${ing.name}${ing.amount ? ` (${ing.amount})` : ""}`);
          }
        }
      }
      const shoppingNames = Array.from(ingMap.values());
      if (shoppingNames.length > 0) {
        try {
          await addItems.mutateAsync(shoppingNames);
        } catch (e) {
          console.warn("Shopping list import failed:", e);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["meals", user.id] });
      toast.success(
        `Zaimportowano ${rows.length} posiłków 🍽️ + ${shoppingNames.length} produktów do listy zakupów 🛒`
      );
    } catch (e: any) {
      toast.error(e?.message || "Nie udało się zaimportować planu");
    } finally {
      setImporting(false);
    }
  };

  const dayMeals = useMemo(
    () => plan.filter((m) => m.day_of_week === selectedDay),
    [plan, selectedDay]
  );

  const orderedTypes: MealType[] = ["breakfast", "lunch", "dinner"];
  const dayTotalKcal = dayMeals.reduce((sum, m) => sum + (m.calories ?? 0), 0);

  const preferencesForm = (
    <div className="space-y-4">
      {/* Body data */}
      <div className="space-y-2 pt-1">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Dane ciała
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Płeć</Label>
                <Select
                  value={form.biological_sex || ""}
                  onValueChange={(v) => update("biological_sex", v)}
                >
                  <SelectTrigger className="rounded-xl h-9 text-sm">
                    <SelectValue placeholder="Wybierz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Kobieta</SelectItem>
                    <SelectItem value="male">Mężczyzna</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Rok urodzenia</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="np. 1995"
                  min={1900}
                  max={new Date().getFullYear()}
                  value={form.birth_year ?? ""}
                  onChange={(e) =>
                    update("birth_year", e.target.value ? parseInt(e.target.value, 10) : null)
                  }
                  className="rounded-xl h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Wzrost (cm)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="np. 175"
                  min={100}
                  max={250}
                  value={form.height_cm ?? ""}
                  onChange={(e) =>
                    update("height_cm", e.target.value ? parseInt(e.target.value, 10) : null)
                  }
                  className="rounded-xl h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Waga (kg)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  step={0.1}
                  placeholder="np. 70"
                  min={30}
                  max={300}
                  value={form.weight_kg ?? ""}
                  onChange={(e) =>
                    update("weight_kg", e.target.value ? parseFloat(e.target.value) : null)
                  }
                  className="rounded-xl h-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Poziom aktywności</Label>
              <Select
                value={form.activity_level || ""}
                onValueChange={(v) => update("activity_level", v)}
              >
                <SelectTrigger className="rounded-xl h-9 text-sm">
                  <SelectValue placeholder="Wybierz..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ACTIVITY_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Cel</Label>
              <Select value={form.goal || ""} onValueChange={(v) => update("goal", v)}>
                <SelectTrigger className="rounded-xl h-9 text-sm">
                  <SelectValue placeholder="Wybierz..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GOAL_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Food preferences */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Preferencje kulinarne
            </h4>

          <div className="space-y-1.5">
            <Label className="text-xs">Typ diety</Label>
            <Select
              value={form.diet_type || "none"}
              onValueChange={(v) => update("diet_type", v)}
            >
              <SelectTrigger className="rounded-xl h-9">
                <SelectValue placeholder="Wybierz..." />
              </SelectTrigger>
              <SelectContent>
                {DIET_TYPES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Co lubisz jeść 😋</Label>
            <Textarea
              placeholder="np. makarony, pikantne, kuchnia azjatycka, ryby..."
              value={form.likes ?? ""}
              onChange={(e) => update("likes", e.target.value)}
              className="rounded-xl resize-none text-sm"
              rows={2}
              maxLength={500}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Czego nie lubisz 🚫</Label>
            <Textarea
              placeholder="np. brokuły, ostre, owoce morza, cebula..."
              value={form.dislikes ?? ""}
              onChange={(e) => update("dislikes", e.target.value)}
              className="rounded-xl resize-none text-sm"
              rows={2}
              maxLength={500}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Alergie ⚠️</Label>
            <Input
              placeholder="np. orzechy, gluten, laktoza"
              value={form.allergies ?? ""}
              onChange={(e) => update("allergies", e.target.value)}
              className="rounded-xl h-9 text-sm"
              maxLength={300}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Choroby / ograniczenia zdrowotne 🩺</Label>
            <Input
              placeholder="np. cukrzyca, nadciśnienie, refluks"
              value={form.health_conditions ?? ""}
              onChange={(e) => update("health_conditions", e.target.value)}
              className="rounded-xl h-9 text-sm"
              maxLength={300}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Dodatkowe uwagi</Label>
            <Textarea
              placeholder="np. mało czasu na gotowanie, dieta redukcyjna..."
              value={form.notes ?? ""}
              onChange={(e) => update("notes", e.target.value)}
              className="rounded-xl resize-none text-sm"
              rows={2}
              maxLength={500}
            />
          </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={upsertPreferences.isPending}
            className="w-full"
            size="sm"
          >
            {upsertPreferences.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Zapisuję...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Zapisz preferencje
              </>
            )}
          </Button>
    </div>
  );

  return (
    <WidgetWrapper
      title="Dieta i plan jedzenia"
      icon={<Salad className="w-5 h-5 text-primary-foreground" />}
      iconBg="gradient-primary"
      actions={
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="soft"
            className="h-8 w-8"
            onClick={handleGenerate}
            disabled={generating}
            title="Wygeneruj plan tygodniowy AI"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </Button>
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8" title="Ustawienia diety">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading flex items-center gap-2">
                  <Salad className="w-5 h-5 text-primary" /> Ustawienia diety
                </DialogTitle>
              </DialogHeader>
              <div className="pt-2">{preferencesForm}</div>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Servings selector */}
          <div className="flex items-center justify-between gap-2 rounded-2xl border bg-card px-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-medium">Plan dla</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setServings(n)}
                  className={cn(
                    "h-7 w-9 rounded-md text-xs font-semibold transition-all",
                    servings === n
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  title={`${n} ${n === 1 ? "osoba" : n < 5 ? "osoby" : "osób"}`}
                >
                  {n}
                </button>
              ))}
              <span className="ml-1 text-xs text-muted-foreground">
                {servings === 1 ? "osoby" : "osób"}
              </span>
            </div>
          </div>

          {/* Calorie summary */}
          {calories ? (
            <div className="rounded-2xl gradient-primary p-4 text-primary-foreground shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4" />
                <span className="text-xs font-medium opacity-90">Dzienne zapotrzebowanie</span>
              </div>
              <div className="text-3xl font-heading font-bold">
                {calories.target}{" "}
                <span className="text-base font-normal opacity-90">kcal/dzień</span>
              </div>
              <div className="text-xs opacity-80 mt-1">
                BMR: {calories.bmr} · TDEE: {calories.tdee} · {calories.age} lat
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground">
              Uzupełnij dane (płeć, wzrost, waga…) w{" "}
              <button
                className="text-primary underline underline-offset-2"
                onClick={() => setSettingsOpen(true)}
              >
                ustawieniach diety
              </button>
              , aby policzyć kalorie i wygenerować plan.
            </div>
          )}

          {/* Plan section */}
          {plan.length === 0 ? (
            <div className="rounded-2xl bg-secondary p-5 text-center space-y-3">
              <ChefHat className="w-8 h-8 mx-auto text-primary" />
              <div>
                <div className="font-heading font-semibold text-sm">Brak planu na tydzień</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Kliknij ✨, aby AI ułożyła śniadania, obiady i kolacje dopasowane do Twoich preferencji.
                </div>
              </div>
              <Button size="sm" onClick={handleGenerate} disabled={generating} className="gap-2">
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Wygeneruj plan
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Day picker */}
              <div className="grid grid-cols-7 gap-0.5 bg-muted rounded-lg p-1">
                {DAYS.map((day) => {
                  const has = plan.some((m) => m.day_of_week === day.id);
                  const isActive = selectedDay === day.id;
                  return (
                    <button
                      key={day.id}
                      onClick={() => setSelectedDay(day.id)}
                      className={cn(
                        "text-xs py-2 rounded-md text-center transition-all font-medium",
                        isActive && has && "bg-primary text-primary-foreground shadow-sm",
                        isActive && !has && "bg-background text-foreground shadow-sm",
                        !isActive && has && "bg-primary/20 text-primary font-semibold",
                        !isActive && !has && "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between px-1">
                <h3 className="font-heading font-semibold text-sm text-muted-foreground">
                  {DAYS[selectedDay].full}
                </h3>
                {dayTotalKcal > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Σ {dayTotalKcal} kcal
                  </span>
                )}
              </div>

              <ul className="space-y-2">
                {orderedTypes.map((type) => {
                  const meal = dayMeals.find((m) => m.meal_type === type);
                  const meta = MEAL_META[type];
                  const key = `${selectedDay}-${type}`;
                  if (!meal) {
                    return (
                      <li key={key} className="rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
                        {meta.emoji} {meta.label} — brak
                      </li>
                    );
                  }
                  const isRerolling = rerollingKey === key;
                  return (
                    <li key={key} className="bg-secondary rounded-xl p-3 group">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRecipeMeal(meal)}
                          className="flex-1 text-left flex items-center gap-2 min-w-0 hover:text-primary transition-colors"
                        >
                          <span className="text-base shrink-0">{meta.emoji}</span>
                          <div className="min-w-0">
                            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              {meta.label}
                            </div>
                            <div className="font-medium truncate text-sm">{meal.name}</div>
                          </div>
                        </button>
                        {meal.recipe && (
                          <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 hover:bg-primary/20 hover:text-primary"
                          onClick={() => handleReroll(meal)}
                          disabled={isRerolling || !!rerollingKey}
                          title="Wymień (AI)"
                        >
                          {isRerolling ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Shuffle className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      {(meal.calories || meal.protein_g != null) && (
                        <div className="mt-1.5 ml-7 flex flex-wrap items-center gap-1.5 text-[10px]">
                          {meal.calories ? (
                            <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
                              {meal.calories} kcal
                            </span>
                          ) : null}
                          {meal.protein_g != null && (
                            <span className="px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600">
                              B {meal.protein_g}g
                            </span>
                          )}
                          {meal.carbs_g != null && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700">
                              W {meal.carbs_g}g
                            </span>
                          )}
                          {meal.fats_g != null && (
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700">
                              T {meal.fats_g}g
                            </span>
                          )}
                          {meal.ingredients?.length ? (
                            <span className="text-muted-foreground">
                              · {meal.ingredients.length} skł.
                            </span>
                          ) : null}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="flex gap-2 pt-1">
                <Button
                  onClick={handleImport}
                  disabled={importing}
                  className="flex-1 gap-2"
                  size="sm"
                >
                  {importing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Importuj do planu obiadów
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-9 w-9" title="Wyczyść plan">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Wyczyścić plan?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Wygenerowany plan zostanie usunięty z podglądu. Zaimportowane posiłki w "Planie obiadów" zostaną nietknięte.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anuluj</AlertDialogCancel>
                      <AlertDialogAction onClick={() => setPlan([])}>Wyczyść</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recipe dialog */}
      <Dialog open={!!recipeMeal} onOpenChange={(o) => !o && setRecipeMeal(null)}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          {recipeMeal && (
            <>
              <DialogHeader className="pb-3 border-b">
                <DialogTitle className="font-heading text-lg flex items-center gap-2">
                  <span className="text-2xl">{MEAL_META[recipeMeal.meal_type].emoji}</span>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-sans font-normal">
                      {MEAL_META[recipeMeal.meal_type].label} · {DAYS[recipeMeal.day_of_week].full}
                    </div>
                    {recipeMeal.name}
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="flex flex-wrap gap-1.5">
                  {recipeMeal.calories ? (
                    <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
                      <Flame className="w-3.5 h-3.5" />
                      {recipeMeal.calories} kcal
                    </span>
                  ) : null}
                  {recipeMeal.protein_g != null && (
                    <span className="text-xs bg-rose-500/10 text-rose-600 px-3 py-1.5 rounded-full font-medium">
                      Białko {recipeMeal.protein_g}g
                    </span>
                  )}
                  {recipeMeal.carbs_g != null && (
                    <span className="text-xs bg-amber-500/10 text-amber-700 px-3 py-1.5 rounded-full font-medium">
                      Węgle {recipeMeal.carbs_g}g
                    </span>
                  )}
                  {recipeMeal.fats_g != null && (
                    <span className="text-xs bg-emerald-500/10 text-emerald-700 px-3 py-1.5 rounded-full font-medium">
                      Tłuszcze {recipeMeal.fats_g}g
                    </span>
                  )}
                </div>
                {recipeMeal.ingredients && recipeMeal.ingredients.length > 0 && (
                  <div>
                    <h4 className="font-heading font-semibold mb-2 text-sm">🧂 Składniki</h4>
                    <ul className="space-y-1 text-sm">
                      {recipeMeal.ingredients.map((ing, i) => (
                        <li key={i} className="flex justify-between border-b border-border/50 py-1">
                          <span>{ing.name}</span>
                          <span className="text-muted-foreground">{ing.amount}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {recipeMeal.recipe && (
                  <div>
                    <h4 className="font-heading font-semibold mb-2 text-sm">👨‍🍳 Przepis</h4>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
                      {recipeMeal.recipe}
                    </p>
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

export default DietPreferences;