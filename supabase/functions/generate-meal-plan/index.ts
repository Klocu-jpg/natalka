import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ACTIVITY_MULT: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};
const GOAL_ADJ: Record<string, number> = { lose: -500, maintain: 0, gain: 400 };

const computeCalories = (p: any): number | null => {
  if (!p?.biological_sex || !p?.birth_year || !p?.height_cm || !p?.weight_kg) return null;
  const age = new Date().getFullYear() - Number(p.birth_year);
  const w = Number(p.weight_kg);
  const h = Number(p.height_cm);
  const bmr =
    p.biological_sex === "male"
      ? 10 * w + 6.25 * h - 5 * age + 5
      : 10 * w + 6.25 * h - 5 * age - 161;
  const mult = ACTIVITY_MULT[p.activity_level ?? "moderate"] ?? 1.55;
  const adj = GOAL_ADJ[p.goal ?? "maintain"] ?? 0;
  return Math.round(bmr * mult + adj);
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({} as any));
    const rawServings = Number(body?.servings ?? 1);
    const requestedServings = Math.min(6, Math.max(1, Number.isFinite(rawServings) ? Math.round(rawServings) : 1));

    // Pobierz członków pary (uwzględniając siebie)
    const { data: memberRows } = await supabase
      .rpc("get_couple_member_ids", { p_user_id: user.id });
    const memberIds: string[] = Array.isArray(memberRows)
      ? memberRows.map((r: any) => (typeof r === "string" ? r : r.get_couple_member_ids)).filter(Boolean)
      : [];
    // user na początku, potem reszta
    const orderedIds = [user.id, ...memberIds.filter((id) => id !== user.id)];
    const effectiveServings = Math.min(requestedServings, Math.max(1, orderedIds.length));
    const useIds = orderedIds.slice(0, effectiveServings);

    const { data: prefsRows } = await supabase
      .from("diet_preferences")
      .select("*")
      .in("user_id", useIds);
    const prefsById = new Map<string, any>(
      (prefsRows ?? []).map((p: any) => [p.user_id, p])
    );
    const perPerson = useIds.map((id, i) => {
      const p = prefsById.get(id) ?? null;
      return {
        idx: i + 1,
        kcal: computeCalories(p),
        prefs: p,
      };
    });

    const totalCalories = perPerson.reduce((sum, p) => sum + (p.kcal ?? 0), 0) || null;
    // Bazowy rozkład kcal na posiłki
    const split = { breakfast: 0.25, lunch: 0.38, dinner: 0.37 } as const;
    const kcalFor = (type: keyof typeof split) =>
      totalCalories ? Math.round(totalCalories * split[type]) : null;

    // Zbiorcze preferencje — sumy ograniczeń (alergie/choroby) muszą obowiązywać dla WSZYSTKICH
    const collect = (key: string) =>
      perPerson
        .map((p) => p.prefs?.[key])
        .filter((v: any) => typeof v === "string" && v.trim().length > 0);

    const allAllergies = Array.from(new Set(collect("allergies").join(",").split(",").map((s) => s.trim()).filter(Boolean)));
    const allHealth = collect("health_conditions").join(" | ");
    const allDislikes = Array.from(new Set(collect("dislikes").join(",").split(",").map((s) => s.trim()).filter(Boolean)));
    const allDietTypes = Array.from(new Set(collect("diet_type")));
    const allLikes = collect("likes").join(" | ");
    const allNotes = collect("notes").join(" | ");

    const perPersonLines = perPerson
      .map((p) => {
        const pr = p.prefs ?? {};
        const sex = pr.biological_sex === "male" ? "M" : pr.biological_sex === "female" ? "K" : "?";
        const meta = [
          sex,
          pr.weight_kg ? `${pr.weight_kg}kg` : null,
          pr.height_cm ? `${pr.height_cm}cm` : null,
          pr.birth_year ? `ur.${pr.birth_year}` : null,
          pr.activity_level ? `akt:${pr.activity_level}` : null,
          pr.goal ? `cel:${pr.goal}` : null,
        ].filter(Boolean).join(", ");
        return `Osoba ${p.idx} (${meta || "brak danych"}): ${p.kcal ?? "?"} kcal/dzień`;
      })
      .join("\n");

    const ctxParts: string[] = [];
    if (allDietTypes.length) ctxParts.push(`Typ diety (musi pasować wszystkim): ${allDietTypes.join(", ")}`);
    if (allAllergies.length) ctxParts.push(`ALERGIE WSZYSTKICH (bezwzględnie pomiń): ${allAllergies.join(", ")}`);
    if (allHealth) ctxParts.push(`Ograniczenia zdrowotne: ${allHealth}`);
    if (allDislikes.length) ctxParts.push(`Czego nie lubią: ${allDislikes.join(", ")}`);
    if (allLikes) ctxParts.push(`Co lubią: ${allLikes}`);
    if (allNotes) ctxParts.push(`Uwagi: ${allNotes}`);
    const ctx = ctxParts.length
      ? `\n\nPREFERENCJE WSPÓLNE (${effectiveServings} ${effectiveServings === 1 ? "osoba" : "os."}):\n- ${ctxParts.join("\n- ")}`
      : "";

    const kcalLine = totalCalories
      ? `ŁĄCZNE dzienne zapotrzebowanie dla ${effectiveServings} ${effectiveServings === 1 ? "osoby" : "os."}: ${totalCalories} kcal (suma).
Dane osób:
${perPersonLines}

Cel kalorii ŁĄCZNIE na posiłek (suma dla wszystkich osób):
- ŚNIADANIE (breakfast): ~${kcalFor("breakfast")} kcal
- OBIAD (lunch): ~${kcalFor("lunch")} kcal
- KOLACJA (dinner): ~${kcalFor("dinner")} kcal`
      : `Generuj zbilansowane posiłki dla ${effectiveServings} ${effectiveServings === 1 ? "osoby" : "os."}.`;

    const servingsLine = effectiveServings > 1
      ? `\n\nGOTUJEMY DLA ${effectiveServings} OSÓB O RÓŻNYCH POTRZEBACH:
- Składniki w "ingredients" PODAJ ŁĄCZNIE dla ${effectiveServings} osób (sumarycznie, nie per osoba).
- Pola "calories", "protein_g", "carbs_g", "fats_g" = ŁĄCZNE wartości dla całego posiłku (suma porcji wszystkich osób).
- Zaplanuj porcje proporcjonalnie do indywidualnych potrzeb (osoba o większym zapotrzebowaniu = większa porcja). W przepisie zaznacz: "Porcja dla osoby 1: X, osoba 2: Y" jeśli różnica jest znacząca.
- Posiłek musi być akceptowalny dla WSZYSTKICH (alergie/diety/nielubiane składniki obowiązują razem).`
      : `\n\nPlan dla 1 osoby. Ilości i makro = na 1 porcję.`;

    const macroLine = targetCalories
      ? `Rozkład makroskładników (orientacyjnie dla diety zbilansowanej): białko ~25%, węglowodany ~45%, tłuszcze ~30%.`
      : "Dobierz makra tak, by danie było zbilansowane.";

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Jesteś dietetykiem i kucharzem. Generujesz KOMPLETNY plan jedzenia na 7 dni po polsku: ŚNIADANIE, OBIAD i KOLACJA na każdy dzień.

ZASADY (BARDZO WAŻNE):
- ZAWSZE wygeneruj DOKŁADNIE 21 pozycji (7 dni × 3 posiłki). Nigdy nie zostawiaj posiłku pustego ani nie pisz "brak". Każdy posiłek musi mieć pełne dane.
- ZAWSZE pełny przepis krok po kroku (min. 4 kroki) i konkretne ilości w składnikach (gramy / sztuki / łyżki).
- Dania mają być RÓŻNORODNE (różne białka, różne kuchnie świata, brak powtórzeń w tygodniu).
- DOPASUJ do preferencji użytkownika (lubi/nie lubi/alergie/typ diety). Nigdy nie używaj składników z listy alergii.

${kcalLine}${servingsLine}
${macroLine}

Odpowiadaj TYLKO w formacie JSON (bez markdown, bez komentarzy):
{
  "meals": [
    {
      "day_of_week": 0,
      "meal_type": "breakfast",
      "name": "nazwa dania",
      "calories": 420,
      "protein_g": 28,
      "carbs_g": 45,
      "fats_g": 14,
      "recipe": "Szczegółowy przepis krok po kroku...",
      "ingredients": [
        { "name": "nazwa składnika", "amount": "ilość np. 200g" }
      ]
    }
    // 21 elementów: dni 0..6 (Pn=0, Nd=6) × meal_type: breakfast|lunch|dinner
  ]
}${ctx}`,
          },
          {
            role: "user",
            content: "Wygeneruj kompletny plan jedzenia na cały tydzień: śniadanie, obiad i kolacja na każdy dzień (21 posiłków). Każdy posiłek z makro (białko/węgle/tłuszcze) i pełnym przepisem.",
          },
        ],
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      console.error("AI Gateway error:", response.status, txt);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Zbyt wiele zapytań. Spróbuj za chwilę." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Brak kredytów AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    let clean = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(clean);

    if (!Array.isArray(parsed?.meals) || parsed.meals.length === 0) {
      throw new Error("Invalid plan format");
    }

    return new Response(
      JSON.stringify({ meals: parsed.meals, targetCalories: totalCalories, servings: effectiveServings }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: unknown) {
    console.error("generate-meal-plan error:", e);
    return new Response(JSON.stringify({ error: "Nie udało się wygenerować planu" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});