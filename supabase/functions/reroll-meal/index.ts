import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ACTIVITY_MULT: Record<string, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
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

    const { excludeNames = [], mealType = "dinner" } = await req.json().catch(() => ({}));
    const safeExclude: string[] = Array.isArray(excludeNames)
      ? excludeNames.filter((s: unknown) => typeof s === "string").slice(0, 20)
      : [];
    const validTypes = ["breakfast", "lunch", "dinner"] as const;
    const type = (validTypes as readonly string[]).includes(mealType) ? mealType : "dinner";
    const typeLabel = type === "breakfast" ? "ŚNIADANIE" : type === "lunch" ? "OBIAD" : "KOLACJĘ";
    const split: Record<string, number> = { breakfast: 0.25, lunch: 0.38, dinner: 0.37 };

    const { data: prefs } = await supabase
      .from("diet_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const target = computeCalories(prefs);
    const mealKcal = target ? Math.round(target * split[type]) : null;

    const ctxParts: string[] = [];
    if (prefs?.diet_type) ctxParts.push(`Typ diety: ${prefs.diet_type}`);
    if (prefs?.allergies) ctxParts.push(`ALERGIE (bezwzględnie pomiń): ${prefs.allergies}`);
    if (prefs?.health_conditions) ctxParts.push(`Ograniczenia zdrowotne: ${prefs.health_conditions}`);
    if (prefs?.dislikes) ctxParts.push(`Nie lubi: ${prefs.dislikes}`);
    if (prefs?.likes) ctxParts.push(`Lubi: ${prefs.likes}`);
    if (prefs?.notes) ctxParts.push(`Uwagi: ${prefs.notes}`);
    const ctx = ctxParts.length ? `\n\nPREFERENCJE:\n- ${ctxParts.join("\n- ")}` : "";

    const kcalLine = mealKcal
      ? `Cel kalorii: około ${mealKcal} kcal.`
      : "Cel: zbilansowany posiłek.";
    const excludeLine = safeExclude.length
      ? `\nNIE PROPONUJ tych dań (były już w planie): ${safeExclude.join(", ")}.`
      : "";

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
            content: `Jesteś dietetykiem i kucharzem. Proponujesz JEDNO ${typeLabel} po polsku.
${kcalLine}${excludeLine}
Odpowiadaj TYLKO w formacie JSON:
{
  "name": "nazwa dania",
  "calories": 650,
  "recipe": "Szczegółowy przepis krok po kroku...",
  "ingredients": [{ "name": "...", "amount": "..." }]
}${ctx}`,
          },
          { role: "user", content: `Zaproponuj jedno nowe ${typeLabel.toLowerCase()}.` },
        ],
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      console.error("AI Gateway error:", response.status, txt);
      throw new Error("AI failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    let clean = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(clean);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    console.error("reroll-meal error:", e);
    return new Response(JSON.stringify({ error: "Nie udało się wymienić obiadu" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});