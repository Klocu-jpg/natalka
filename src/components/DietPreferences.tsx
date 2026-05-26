import { useEffect, useState } from "react";
import { Salad, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WidgetWrapper from "./WidgetWrapper";
import { useDietPreferences, DietPreferencesInput } from "@/hooks/useDietPreferences";

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
      });
    }
  }, [preferences]);

  const update = <K extends keyof DietPreferencesInput>(key: K, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            AI uwzględni te informacje przy generowaniu przepisów i planu obiadów.
          </p>

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