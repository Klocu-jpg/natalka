import { useEffect, useMemo, useState } from "react";
import { Salad, Save, Loader2, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WidgetWrapper from "./WidgetWrapper";
import { useDietPreferences, DietPreferencesInput } from "@/hooks/useDietPreferences";
import { calculateCalories, ACTIVITY_LABELS, GOAL_LABELS } from "@/lib/calories";

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

const DietPreferences = () => {
  const { preferences, isLoading, upsertPreferences } = useDietPreferences();
  const [form, setForm] = useState<DietPreferencesInput>(empty);

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

  return (
    <WidgetWrapper
      title="Preferencje dietetyczne"
      icon={<Salad className="w-5 h-5 text-primary-foreground" />}
      iconBg="gradient-primary"
    >
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            AI używa tych danych do liczenia kalorii i generowania planu obiadów.
          </p>

          {/* Calorie summary card */}
          {calories && (
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
          )}

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
      )}
    </WidgetWrapper>
  );
};

export default DietPreferences;