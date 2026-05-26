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

    const { data: prefs } = await supabase
      .from("diet_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const targetCalories = computeCalories(prefs);
    // Calorie split for breakfast / lunch / dinner
    const split = { breakfast: 0.25, lunch: 0.38, dinner: 0.37 } as const;
    const kcalFor = (type: keyof typeof split) =>
      targetCalories ? Math.round(targetCalories * split[type]) : null;

    const ctxParts: string[] = [];
    if (prefs?.diet_type) ctxParts.push(`Typ diety: ${prefs.diet_type}`);
    if (prefs?.allergies) ctxParts.push(`ALERGIE (bezwzględnie pomiń): ${prefs.allergies}`);
    if (prefs?.health_conditions) ctxParts.push(`Ograniczenia zdrowotne: ${prefs.health_conditions}`);
    if (prefs?.dislikes) ctxParts.push(`Nie lubi: ${prefs.dislikes}`);
    if (prefs?.likes) ctxParts.push(`Lubi: ${prefs.likes}`);
    if (prefs?.notes) ctxParts.push(`Uwagi: ${prefs.notes}`);
    const ctx = ctxParts.length
      ? `\n\nPREFERENCJE UŻYTKOWNIKA:\n- ${ctxParts.join("\n- ")}`
      : "";

    const kcalLine = targetCalories
      ? `Dzienne zapotrzebowanie użytkownika: ${targetCalories} kcal.
Rozkład kcal na posiłek:
- ŚNIADANIE (breakfast): ~${kcalFor("breakfast")} kcal
- OBIAD (lunch): ~${kcalFor("lunch")} kcal
- KOLACJA (dinner): ~${kcalFor("dinner")} kcal`
      : `Generuj zbilansowane posiłki:
- śniadanie ~400 kcal, obiad ~700 kcal, kolacja ~500 kcal.`;

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
            content: `Jesteś dietetykiem i kucharzem. Generujesz KOMPLETNY plan jedzenia na 7 dni po polsku: ŚNIADANIE, OBIAD i KOLACJA na każdy dzień (łącznie DOKŁADNIE 21 pozycji).
${kcalLine}
Dania mają być RÓŻNORODNE (różne białka, różne kuchnie świata, brak powtórzeń w tygodniu).

Odpowiadaj TYLKO w formacie JSON (bez markdown, bez komentarzy):
{
  "meals": [
    {
      "day_of_week": 0,
      "meal_type": "breakfast",
      "name": "nazwa dania",
      "calories": 420,
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
            content: "Wygeneruj kompletny plan jedzenia na cały tydzień: śniadanie, obiad i kolacja na każdy dzień (21 posiłków).",
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
      JSON.stringify({ meals: parsed.meals, targetCalories }),
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