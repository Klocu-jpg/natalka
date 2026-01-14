import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mealName } = await req.json();

    if (!mealName) {
      throw new Error('Meal name is required');
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Jesteś pomocnym asystentem kulinarnym. Generujesz przepisy po polsku.
Odpowiadaj TYLKO w formacie JSON bez żadnego dodatkowego tekstu:
{
  "recipe": "Szczegółowy przepis krok po kroku...",
  "ingredients": [
    { "name": "nazwa składnika", "amount": "ilość np. 200g, 2 sztuki" }
  ]
}
Przepis powinien być prosty i praktyczny. Składniki podawaj z dokładnymi ilościami.`
          },
          {
            role: 'user',
            content: `Wygeneruj przepis na: ${mealName}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error('Failed to generate recipe');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in response');
    }

    // Parse JSON from response, handle potential markdown code blocks
    let parsed;
    try {
      // Remove markdown code blocks if present (handles ```json, ``` at start/end)
      let cleanContent = content.trim();
      // Remove opening code fence with optional language
      cleanContent = cleanContent.replace(/^```(?:json)?\s*\n?/i, '');
      // Remove closing code fence
      cleanContent = cleanContent.replace(/\n?```\s*$/i, '');
      cleanContent = cleanContent.trim();
      parsed = JSON.parse(cleanContent);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid response format from AI');
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in generate-recipe function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
