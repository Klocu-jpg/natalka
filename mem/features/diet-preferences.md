---
name: Diet Preferences
description: Per-user diet preferences (likes, dislikes, allergies, diet type, health conditions, notes) fed into AI recipe generation
type: feature
---
Table `diet_preferences` (one row per user, UNIQUE user_id). Partner in couple can SELECT (for shared meal planning) but only owner can INSERT/UPDATE/DELETE.

Widget `DietPreferences` is the central "Dieta i plan jedzenia" hub. Header has Sparkles (generate weekly plan) + Settings gear (opens dialog with body data + food preferences form — NOT visible inline anymore). Body shows calorie summary card and the AI-generated weekly plan as a 7-day draft (breakfast/lunch/dinner per day) kept in component state + persisted to localStorage key `diet-plan-draft-v1`. Each meal has reroll + tap-to-view recipe. "Importuj do planu obiadów" button writes all 21 meals into `meals` table (prefixed with emoji + meal type), replacing previous user meals. MealsPlanner no longer has its own AI generate button — generation lives only in the diet widget.

Edge function `generate-meal-plan` returns 21 meals (`day_of_week` 0..6 × `meal_type` breakfast|lunch|dinner) with calorie split 25/38/37 and macros (`protein_g`, `carbs_g`, `fats_g`). Prompt forbids empty meals. `reroll-meal` accepts `mealType`, returns same shape (kcal + macros).

On import: meals are written to `meals` table (recipe text gets a `📊 Makro: B:Xg · W:Xg · T:Xg` header prepended) AND all ingredients are auto-deduped (by lowercased name) and bulk-added to `shopping_items` via `useShoppingItems().addItems`.
Edge functions `generate-recipe` and `generate-recipe-from-url` fetch the calling user's prefs and inject a Polish "PREFERENCJE UŻYTKOWNIKA" block into the system prompt. Allergies are marked as "BEZWZGLĘDNIE pomiń". Best-effort: failures to fetch prefs don't block recipe generation.
