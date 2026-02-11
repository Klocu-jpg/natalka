import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { mealName } = await req.json();

    // Input validation
    if (!mealName || typeof mealName !== 'string' || mealName.trim().length === 0 || mealName.length > 100) {
      return new Response(JSON.stringify({ error: 'Invalid meal name: must be 1-100 characters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sanitizedMealName = mealName.trim();

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
            content: `Wygeneruj przepis na: ${sanitizedMealName}`
          }
        ],
      }),
    });

    if (!response.ok) {
      console.error('AI Gateway error:', await response.text());
      throw new Error('Failed to generate recipe');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in response');
    }

    let parsed;
    try {
      let cleanContent = content.trim();
      cleanContent = cleanContent.replace(/^```(?:json)?\s*\n?/i, '');
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
    return new Response(JSON.stringify({ error: 'An error occurred while generating the recipe' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
